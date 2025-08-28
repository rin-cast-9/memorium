package repo

import (
	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type FolderRepo interface {
	CreateFolder(userID int, folder *model.Folder) error
	DeleteFolder(userID, folderID int) error
	RenameFolder(userID, folderID int, newName string) error
	GetAllFolders(userID int) ([]model.Folder, error)
	GetFolderByID(userID, folderID int) (*model.Folder, error)
}

type folderRepo struct {
	db *gorm.DB
}

func NewFolderRepo(db *gorm.DB) FolderRepo {
	return &folderRepo{db: db}
}

func (r *folderRepo) CreateFolder(userID int, folder *model.Folder) error {
	folder.UserID = userID
	err := r.db.Create(folder).Error
	if err != nil {
		util.Logger.Error("Failed to create folder", zap.Error(err))
	} else {
		util.Logger.Info("Folder created", zap.Int("userID", userID))
	}

	return err
}

func (r *folderRepo) DeleteFolder(userID, folderID int) error {
	res := r.db.Where("id = ? AND user_id = ?", folderID, userID).Delete(&model.Folder{})
	if res.Error != nil {
		util.Logger.Error("Failed to delete folder", zap.Int("folderID", folderID), zap.Int("userID", userID), zap.Error(res.Error))
		return res.Error
	}

	if res.RowsAffected == 0 {
		util.Logger.Warn("No folder found to delete", zap.Int("folderID", folderID), zap.Int("userID", userID))
		return gorm.ErrRecordNotFound
	}

	util.Logger.Info("Folder deleted", zap.Int("folderID", folderID), zap.Int("userID", userID))
	return nil
}

func (r *folderRepo) RenameFolder(userID, folderID int, newName string) error {
	err := r.db.Model(&model.Folder{}).
		Where("id = ? AND user_id = ?", folderID, userID).
		UpdateColumn("display_name", newName).Error
	if err != nil {
		util.Logger.Error("Failed to rename folder", zap.Int("folderID", folderID), zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Folder renamed", zap.Int("folderID", folderID), zap.Int("userID", userID))
	}

	return err
}

func (r *folderRepo) GetAllFolders(userID int) ([]model.Folder, error) {
	var folders []model.Folder
	err := r.db.Where("user_id = ?", userID).Find(&folders).Error
	if err != nil {
		util.Logger.Error("Failed to retrieve folders", zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Folders retrieved", zap.Int("userID", userID))
	}

	return folders, err
}

func (r *folderRepo) GetFolderByID(userID, folderID int) (*model.Folder, error) {
	var folder model.Folder
	err := r.db.Where("id = ? AND user_id = ?", folderID, userID).First(&folder).Error
	if err != nil {
		util.Logger.Error("Failed to retrieve folder", zap.Int("folderID", folderID), zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Folder retrieved", zap.Int("folderID", folderID), zap.Int("userID", userID))
	}

	return &folder, err
}
