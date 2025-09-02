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
	GetModulesByFolder(userID, folderID int) ([]model.Module, error)
	AddFolderToModule(folderID, moduleID int) error
	RemoveFolderFromModule(folderID, moduleID int) error
	UpdateFolderModulesDelta(folderID int, checkedModuleIDs, uncheckedModuleIDs []int) error
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

func (r *folderRepo) GetModulesByFolder(userID, folderID int) ([]model.Module, error) {
	var modules []model.Module
	err := r.db.Joins("JOIN folder_modules fm ON fm.module_id = modules.id").
		Joins("JOIN folders f ON f.id = fm.folder_id").
		Where("f.id = ? AND f.user_id = ?", folderID, userID).
		Find(&modules).Error

	if err != nil {
		util.Logger.Error("Failed to retrieve modules for folder", zap.Int("folderID", folderID), zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Modules for folder retrieved", zap.Int("folderID", folderID), zap.Int("userID", userID))
	}

	return modules, err
}

func (r *folderRepo) AddFolderToModule(folderID, moduleID int) error {
	err := r.db.Exec("INSERT INTO folder_modules (folder_id, module_id) VALUES (?, ?) ON CONFLICT DO NOTHING", folderID, moduleID).Error
	if err != nil {
		util.Logger.Error("Failed to add folder to module", zap.Int("folderID", folderID), zap.Int("moduleID", moduleID), zap.Error(err))
	}

	return err
}

func (r *folderRepo) RemoveFolderFromModule(folderID, moduleID int) error {
	err := r.db.Exec("DELETE FROM folder_modules WHERE folder_id = ? AND module_id = ?", folderID, moduleID).Error
	if err != nil {
		util.Logger.Error("Failed to remove folder from module", zap.Int("folderID", folderID), zap.Int("moduleID", moduleID), zap.Error(err))
	}

	return err
}

func (r *folderRepo) addFolderToModuleTx(tx *gorm.DB, folderID, moduleID int) error {
	return tx.Exec("INSERT INTO folder_modules (folder_id, module_id) VALUES (?, ?) ON CONFLICT DO NOTHING", folderID, moduleID).Error
}

func (r *folderRepo) removeFolderFromModuleTx(tx *gorm.DB, folderID, moduleID int) error {
	return tx.Exec("DELETE FROM folder_modules WHERE folder_id = ? AND module_id = ?", folderID, moduleID).Error
}

func (r *folderRepo) UpdateFolderModulesDelta(folderID int, checkedModuleIDs, uncheckedModuleIDs []int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, uncheckedModuleID := range uncheckedModuleIDs {
			if err := r.removeFolderFromModuleTx(tx, folderID, uncheckedModuleID); err != nil {
				util.Logger.Error("Failed to delete existing module association", zap.Int("folderID", folderID), zap.Int("uncheckedModuleID", uncheckedModuleID), zap.Error(err))
				return err
			}
		}

		for _, checkedModuleID := range checkedModuleIDs {
			if err := r.addFolderToModuleTx(tx, folderID, checkedModuleID); err != nil {
				util.Logger.Error("Failed to insert module association", zap.Int("folderID", folderID), zap.Int("checkedModuleID", checkedModuleID), zap.Error(err))
				return err
			}
		}

		return nil
	})
}
