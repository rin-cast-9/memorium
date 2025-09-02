package service

import (
	"errors"
	"strings"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ModuleService struct {
	moduleRepo repo.ModuleRepo
	folderRepo repo.FolderRepo
}

func NewModuleService(moduleRepo repo.ModuleRepo, folderRepo repo.FolderRepo) *ModuleService {
	return &ModuleService{moduleRepo: moduleRepo, folderRepo: folderRepo}
}

func (s *ModuleService) Create(userID int, name string) (*model.Module, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		util.Logger.Warn("Empty module display name")
		return nil, util.NewPublicError(util.ErrCodeModuleDisplayNameEmpty, "Display name is required")
	}

	module := &model.Module{DisplayName: name}
	if err := s.moduleRepo.CreateModule(userID, module); err != nil {
		util.Logger.Error("Module creation failed", zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeModuleCreationFailed, err)
	}

	return module, nil
}

func (s *ModuleService) Delete(userID, moduleID int) error {
	err := s.moduleRepo.DeleteModule(userID, moduleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return util.NewPublicError(util.ErrCodeNotFound, "module not found")
		}

		return util.NewInternalError(util.ErrCodeModuleDeletionFailed, err)
	}

	return nil
}

func (s *ModuleService) Rename(userID, moduleID int, newDisplayName string) (*model.Module, error) {
	newDisplayName = strings.TrimSpace(newDisplayName)
	if newDisplayName == "" {
		util.Logger.Warn("Empty module display name")
		return nil, util.NewPublicError(util.ErrCodeModuleDisplayNameEmpty, "Display name is required")
	}

	err := s.moduleRepo.RenameModule(userID, moduleID, newDisplayName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "module not found")
		}
		return nil, util.NewInternalError(util.ErrCodeModuleRenameFailed, err)
	}

	module, err := s.Get(userID, moduleID)

	return module, err
}

func (s *ModuleService) Get(userID, moduleID int) (*model.Module, error) {
	module, err := s.moduleRepo.GetModuleByID(userID, moduleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "module not found")
		}
		return nil, util.NewInternalError(util.ErrCodeModuleGetFailed, err)
	}

	return module, nil
}

func (s *ModuleService) List(userID int) ([]model.Module, error) {
	modules, err := s.moduleRepo.GetAllModules(userID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeModuleListFailed, err)
	}

	return modules, nil
}

func (s *ModuleService) GetFoldersByModule(userID, moduleID int) ([]model.Folder, error) {
	folders, err := s.moduleRepo.GetFoldersByModule(userID, moduleID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeFoldersByModuleListFailed, err)
	}

	return folders, nil
}

func (s *ModuleService) AddModuleToFolder(userID, moduleID, folderID int) error {
	_, err := s.Get(userID, moduleID)
	if err != nil {
		return err
	}

	_, err = s.folderRepo.GetFolderByID(userID, folderID)
	if err != nil {
		return util.NewPublicError(util.ErrCodeNotFound, "folder not found")
	}

	if err := s.moduleRepo.AddModuleToFolder(moduleID, folderID); err != nil {
		util.Logger.Error("Module to folder association failed", zap.Int("moduleID", moduleID), zap.Int("folderID", folderID), zap.Int("userID", userID), zap.Error(err))
		return util.NewInternalError(util.ErrCodeModuleToFolderAssociationFailed, err)
	}

	return nil
}

func (s *ModuleService) RemoveModuleFromService(userID, moduleID, folderID int) error {
	_, err := s.Get(userID, moduleID)
	if err != nil {
		return err
	}

	_, err = s.folderRepo.GetFolderByID(userID, folderID)
	if err != nil {
		return util.NewPublicError(util.ErrCodeNotFound, "folder not found")
	}

	if err := s.moduleRepo.RemoveModuleFromFolder(moduleID, folderID); err != nil {
		util.Logger.Error("Module from folder association failed", zap.Int("moduleID", moduleID), zap.Int("folderID", folderID), zap.Int("userID", userID), zap.Error(err))
		return util.NewInternalError(util.ErrCodeModuleFromFolderAssociationFailed, err)
	}

	return nil
}

func (s *ModuleService) UpdateModuleFolders(userID, moduleID int, folderMap map[int]bool) error {
	folders, err := s.GetFoldersByModule(userID, moduleID)
	if err != nil {
		return err
	}

	currentSet := make(map[int]struct{}, len(folders))
	for _, m := range folders {
		currentSet[m.ID] = struct{}{}
	}

	var toAdd, toRemove []int

	for id, checked := range folderMap {
		_, exists := currentSet[id]

		if checked && !exists {
			toAdd = append(toAdd, id)
		} else if !checked && exists {
			toRemove = append(toRemove, id)
		}
	}

	err = s.moduleRepo.UpdateModuleFoldersDelta(moduleID, toAdd, toRemove)
	if err != nil {
		currentFolders := make([]int, 0, len(currentSet))
		for k := range currentSet {
			currentFolders = append(currentFolders, k)
		}

		requestedFolders := make([]int, 0, len(folderMap))
		for k := range folderMap {
			requestedFolders = append(requestedFolders, k)
		}

		util.Logger.Error("Failed to update module folders", zap.Int("moduleID", moduleID), zap.Ints("requestedFolderIDs", requestedFolders), zap.Ints("currentFolderIDs", currentFolders), zap.Int("userID", userID), zap.Error(err))
	}

	return nil
}
