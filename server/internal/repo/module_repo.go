package repo

import (
	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ModuleRepo interface {
	CreateModule(userID int, module *model.Module) error
	DeleteModule(userID, moduleID int) error
	RenameModule(userID, moduleID int, newName string) error
	GetAllModules(userID int) ([]model.Module, error)
	GetModuleByID(userID, moduleID int) (*model.Module, error)
	GetFoldersByModule(userID, moduleID int) ([]model.Folder, error)
	AddModuleToFolder(moduleID, folderID int) error
	RemoveModuleFromFolder(moduleID, folderID int) error
	UpdateModuleFoldersDelta(moduleID int, checkedFolderIDs, uncheckedFolderIDs []int) error
	IsModuleOwnedByUser(moduleID, userID int) (bool, error)
}

type moduleRepo struct {
	db *gorm.DB
}

func NewModuleRepo(db *gorm.DB) ModuleRepo {
	return &moduleRepo{db: db}
}

func (r *moduleRepo) CreateModule(userID int, module *model.Module) error {
	module.UserID = userID
	err := r.db.Create(module).Error
	if err != nil {
		util.Logger.Error("Failed to create module", zap.Error(err))
	} else {
		util.Logger.Info("Module created", zap.Int("userID", userID))
	}

	return err
}

func (r *moduleRepo) DeleteModule(userID, moduleID int) error {
	res := r.db.Where("id = ? AND user_id = ?", moduleID, userID).Delete(&model.Module{})
	if res.Error != nil {
		util.Logger.Error("Failed to delete module", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(res.Error))

		return res.Error
	}

	if res.RowsAffected == 0 {
		util.Logger.Warn("No module found to delete", zap.Int("moduleID", moduleID), zap.Int("userID", userID))
		return gorm.ErrRecordNotFound
	}

	util.Logger.Info("Module deleted", zap.Int("moduleID", moduleID), zap.Int("userID", userID))
	return nil
}

func (r *moduleRepo) RenameModule(userID, moduleID int, newName string) error {
	err := r.db.Model(&model.Module{}).
		Where("id = ? AND user_id = ?", moduleID, userID).
		UpdateColumn("display_name", newName).Error
	if err != nil {
		util.Logger.Error("Failed to rename module", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Module renamed", zap.Int("moduleID", moduleID), zap.Int("userID", userID))
	}

	return err
}

func (r *moduleRepo) GetAllModules(userID int) ([]model.Module, error) {
	var modules []model.Module

	err := r.db.Where("user_id = ?", userID).Find(&modules).Error
	if err != nil {
		util.Logger.Error("Failed to retrieve modules", zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Modules retrieved", zap.Int("userID", userID))
	}

	return modules, err
}

func (r *moduleRepo) GetModuleByID(userID, moduleID int) (*model.Module, error) {
	var module model.Module
	err := r.db.Where("id = ? AND user_id = ?", moduleID, userID).First(&module).Error
	if err != nil {
		util.Logger.Error("Failed to retrieve module", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Module retrieved", zap.Int("moduleID", moduleID), zap.Int("userID", userID))
	}

	return &module, err
}

func (r *moduleRepo) GetFoldersByModule(userID, moduleID int) ([]model.Folder, error) {
	var folders []model.Folder
	err := r.db.Joins("JOIN folder_modules fm ON fm.folder_id = folders.id").
		Joins("JOIN modules m ON m.id = fm.module_id").
		Where("m.id = ? AND m.user_id = ?", moduleID, userID).
		Find(&folders).Error

	if err != nil {
		util.Logger.Error("Failed to retrieve folders for module", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
	} else {
		util.Logger.Info("Folders for module retrieved", zap.Int("moduleID", moduleID), zap.Int("userID", userID))
	}

	return folders, err
}

func (r *moduleRepo) AddModuleToFolder(moduleID, folderID int) error {
	err := r.db.Exec("INSERT INTO folder_modules (module_id, folder_id) VALUES (?, ?) ON CONFLICT DO NOTHING", moduleID, folderID).Error
	if err != nil {
		util.Logger.Error("Failed to add module to folder", zap.Int("moduleID", moduleID), zap.Int("folderID", folderID), zap.Error(err))
	}

	return err
}

func (r *moduleRepo) RemoveModuleFromFolder(moduleID, folderID int) error {
	err := r.db.Exec("DELETE FROM folder_modules WHERE module_id = ? AND folder_id = ?", moduleID, folderID).Error
	if err != nil {
		util.Logger.Error("Failed to remove module from folder", zap.Int("moduleID", moduleID), zap.Int("folderID", folderID), zap.Error(err))
	}

	return err
}

func (r *moduleRepo) addModuleToFolderTx(tx *gorm.DB, moduleID, folderID int) error {
	return tx.Exec("INSERT INTO folder_modules (module_id, folder_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
		moduleID, folderID).Error
}

func (r *moduleRepo) removeModuleFromFolderTx(tx *gorm.DB, moduleID, folderID int) error {
	return tx.Exec("DELETE FROM folder_modules WHERE module_id = ? AND folder_id = ?", moduleID, folderID).Error
}

func (r *moduleRepo) UpdateModuleFoldersDelta(moduleID int, checkedFolderIDs, uncheckedFolderIDs []int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, uncheckedFolderID := range uncheckedFolderIDs {
			if err := r.removeModuleFromFolderTx(tx, moduleID, uncheckedFolderID); err != nil {
				util.Logger.Error("Failed to delete existing folder associations", zap.Int("moduleID", moduleID), zap.Int("uncheckedFolderID", uncheckedFolderID), zap.Error(err))
				return err
			}
		}

		for _, checkedFolderID := range checkedFolderIDs {
			if err := r.addModuleToFolderTx(tx, moduleID, checkedFolderID); err != nil {
				util.Logger.Error("Failed to insert folder association", zap.Int("moduleID", moduleID), zap.Int("checkedFolderID", checkedFolderID), zap.Error(err))
				return err
			}
		}

		return nil
	})
}

func (r *moduleRepo) IsModuleOwnedByUser(moduleID, userID int) (bool, error) {
	var count int64
	err := r.db.Model(&model.Module{}).
		Where("id = ? AND user_id = ?", moduleID, userID).
		Count(&count).Error

	if err != nil {
		util.Logger.Error("Failed to check module ownership", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
		return false, err
	}

	return count > 0, nil
}
