package repo

import (
	"errors"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ProgressRepo interface {
	GetByUserCard(userID, cardID int) (*model.UserCardProgress, error)
	ListByModule(userID, moduleID int) ([]model.UserCardProgress, error)
	ListByUser(userID int) ([]model.UserCardProgress, error)
	Create(progress *model.UserCardProgress) error
	Update(progress *model.UserCardProgress) error
}

type progressRepo struct {
	db *gorm.DB
}

func NewProgressRepo(db *gorm.DB) ProgressRepo {
	return &progressRepo{db: db}
}

func (r *progressRepo) GetByUserCard(userID, cardID int) (*model.UserCardProgress, error) {
	var p model.UserCardProgress
	err := r.db.Where("user_id = ? AND card_id = ?", userID, cardID).First(&p).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			util.Logger.Debug("progress not found", zap.Int("userID", userID), zap.Int("cardID", cardID))
		} else {
			util.Logger.Error("failed to get progress", zap.Int("userID", userID), zap.Int("cardID", cardID), zap.Error(err))
		}

		return nil, err
	}

	return &p, nil
}

func (r *progressRepo) ListByModule(userID, moduleID int) ([]model.UserCardProgress, error) {
	var progresses []model.UserCardProgress
	err := r.db.Joins("JOIN cards ON user_card_progresses.card_id = cards.id").Where("user_card_progresses.user_id = ? AND cards.module_id = ?", userID, moduleID).Find(&progresses).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			util.Logger.Debug("progresses not found", zap.Int("userID", userID), zap.Int("moduleID", moduleID))
		} else {
			util.Logger.Error("failed to get progresses", zap.Int("userID", userID), zap.Int("moduleID", moduleID), zap.Error(err))
		}

		return nil, err
	}

	return progresses, nil
}

func (r *progressRepo) ListByUser(userID int) ([]model.UserCardProgress, error) {
	var progresses []model.UserCardProgress
	err := r.db.Where("user_id = ?", userID).Find(&progresses).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			util.Logger.Debug("progresses not found", zap.Int("userID", userID))
		} else {
			util.Logger.Error("failed to get progresses", zap.Int("userID", userID), zap.Error(err))
		}

		return nil, err
	}

	return progresses, nil
}

func (r *progressRepo) Create(progress *model.UserCardProgress) error {
	if progress.LastSeenAt == nil {
		now := time.Now()
		progress.LastSeenAt = &now
	}

	if err := r.db.Create(progress).Error; err != nil {
		util.Logger.Error("Failed to create user_card_progress", zap.Error(err), zap.Int("userID", progress.UserID), zap.Int("cardID", progress.CardID))

		return err
	}

	util.Logger.Info("user_card_progress created", zap.Int("userID", progress.UserID), zap.Int("cardID", progress.CardID))

	return nil
}

func (r *progressRepo) Update(progress *model.UserCardProgress) error {
	err := r.db.Save(progress).Error
	if err != nil {
		util.Logger.Error("failed to update progress (tx)", zap.Int("userID", progress.UserID), zap.Int("cardID", progress.CardID), zap.Error(err))
		return err
	}

	util.Logger.Debug("progress updated (tx)", zap.Int("userID", progress.UserID), zap.Int("cardID", progress.CardID))
	return nil
}
