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

type FolderService struct {
	folderRepo repo.FolderRepo
	moduleRepo repo.ModuleRepo
}

func NewFolderService(folderRepo repo.FolderRepo, moduleRepo repo.ModuleRepo) *FolderService {
	return &FolderService{folderRepo: folderRepo, moduleRepo: moduleRepo}
}

func (s *FolderService) Create(userID int, name string) (*model.Folder, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		util.Logger.Warn("Empty folder display name")
		return nil, util.NewPublicError(util.ErrCodeFolderDisplayNameEmpty, "Display name is required")
	}

	folder := &model.Folder{DisplayName: name}
	if err := s.folderRepo.CreateFolder(userID, folder); err != nil {
		util.Logger.Error("Folder creation failed", zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeFolderCreationFailed, err)
	}

	return folder, nil
}

func (s *FolderService) Delete(userID, folderID int) error {
	err := s.folderRepo.DeleteFolder(userID, folderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return util.NewPublicError(util.ErrCodeNotFound, "folder not found")
		}
		return util.NewInternalError(util.ErrCodeFolderDeletionFailed, err)
	}

	return nil
}

func (s *FolderService) Rename(userID, folderID int, newDisplayName string) (*model.Folder, error) {
	newDisplayName = strings.TrimSpace(newDisplayName)
	if newDisplayName == "" {
		util.Logger.Warn("Empty folder display name")
		return nil, util.NewPublicError(util.ErrCodeFolderDisplayNameEmpty, "Display name is required")
	}

	err := s.folderRepo.RenameFolder(userID, folderID, newDisplayName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "folder not found")
		}
		return nil, util.NewInternalError(util.ErrCodeFolderRenameFailed, err)
	}

	folder, err := s.Get(userID, folderID)

	return folder, err
}

func (s *FolderService) Get(userID, folderID int) (*model.Folder, error) {
	folder, err := s.folderRepo.GetFolderByID(userID, folderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "folder not found")
		}
		return nil, util.NewInternalError(util.ErrCodeFolderGetFailed, err)
	}

	return folder, nil
}

func (s *FolderService) List(userID int) ([]model.Folder, error) {
	folders, err := s.folderRepo.GetAllFolders(userID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeFolderListFailed, err)
	}

	return folders, nil
}

func (s *FolderService) GetModulesByFolder(userID, folderID int) ([]model.Module, error) {
	modules, err := s.folderRepo.GetModulesByFolder(userID, folderID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeModulesByFolderListFailed, err)
	}

	return modules, nil
}

func (s *FolderService) AddFolderToModule(userID, folderID, moduleID int) error {
	_, err := s.Get(userID, folderID)
	if err != nil {
		return err
	}

	_, err = s.moduleRepo.GetModuleByID(userID, moduleID)
	if err != nil {
		return util.NewPublicError(util.ErrCodeNotFound, "module not found")
	}

	if err := s.folderRepo.AddFolderToModule(folderID, moduleID); err != nil {
		util.Logger.Error("Folder to module association failed", zap.Int("folderID", folderID), zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
		return util.NewInternalError(util.ErrCodeFolderToModuleAssociationFailed, err)
	}

	return nil
}

func (s *FolderService) RemoveFolderFromModule(userID, folderID, moduleID int) error {
	_, err := s.Get(userID, folderID)
	if err != nil {
		return err
	}

	_, err = s.moduleRepo.GetModuleByID(userID, moduleID)
	if err != nil {
		return util.NewPublicError(util.ErrCodeNotFound, "module not found")
	}

	if err := s.folderRepo.RemoveFolderFromModule(folderID, moduleID); err != nil {
		util.Logger.Error("Folder from module association failed", zap.Int("folderID", folderID), zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
		return util.NewInternalError(util.ErrCodeFolderFromModuleAssociationFailed, err)
	}

	return nil
}

func (s *FolderService) UpdateFolderModules(userID, folderID int, moduleMap map[int]bool) error {
	folder, err := s.folderRepo.GetFolderByID(userID, folderID)
	if err != nil {
		return err
	}

	if folder == nil {
		return util.NewPublicError(util.ErrCodeNotFound, "folder not found or unauthorized")
	}

	modules, err := s.GetModulesByFolder(userID, folderID)
	if err != nil {
		return err
	}

	currentSet := make(map[int]struct{}, len(modules))
	for _, m := range modules {
		currentSet[m.ID] = struct{}{}
	}

	var toAdd, toRemove []int

	for id, checked := range moduleMap {
		_, exists := currentSet[id]

		if checked && !exists {
			toAdd = append(toAdd, id)
		} else if !checked && exists {
			toRemove = append(toRemove, id)
		}
	}

	err = s.folderRepo.UpdateFolderModulesDelta(folderID, toAdd, toRemove)
	if err != nil {
		currentModules := make([]int, 0, len(currentSet))
		for k := range currentSet {
			currentModules = append(currentModules, k)
		}

		requestedModules := make([]int, 0, len(moduleMap))
		for k := range moduleMap {
			requestedModules = append(requestedModules, k)
		}

		util.Logger.Error("Failed to update folder modules", zap.Int("folderID", folderID), zap.Ints("requestedModuleIDs", requestedModules), zap.Ints("currentModuleIDs", currentModules), zap.Int("userID", userID), zap.Error(err))
	}

	return nil
}
