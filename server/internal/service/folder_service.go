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
}

func NewFolderService(folderRepo repo.FolderRepo) *FolderService {
	return &FolderService{folderRepo: folderRepo}
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
