package repo

import (
	"github.com/rin-cast-9/memorium/server/internal/dto"
	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CardRepo interface {
	CreateCard(card *model.Card) error
	DeleteCard(cardID int) error
	EditCard(cardID int, updates *dto.CardUpdate) error
	GetCardsByModule(moduleID int) ([]model.Card, error)
	GetCardById(cardID int) (*model.Card, error)
}

type cardRepo struct {
	db *gorm.DB
}

func NewCardRepo(db *gorm.DB) CardRepo {
	return &cardRepo{db: db}
}

func (r *cardRepo) CreateCard(card *model.Card) error {
	err := r.db.Create(card).Error
	if err != nil {
		util.Logger.Error("Failed to create card", zap.Error(err))
	} else {
		util.Logger.Info("Card created", zap.Int("moduleID", card.ModuleID))
	}

	return err
}

func (r *cardRepo) DeleteCard(cardID int) error {
	res := r.db.Delete(&model.Card{}, cardID)
	if res.Error != nil {
		util.Logger.Error("Failed to delete card", zap.Int("cardID", cardID), zap.Error(res.Error))

		return res.Error
	}

	if res.RowsAffected == 0 {
		util.Logger.Warn("No card found to delete", zap.Int("cardID", cardID))
		return gorm.ErrRecordNotFound
	}

	util.Logger.Info("Card deleted", zap.Int("cardID", cardID))
	return nil
}

func (r *cardRepo) EditCard(cardID int, updates *dto.CardUpdate) error {
	updateData := map[string]interface{}{}

	if updates.Front != nil {
		updateData["front"] = *updates.Front
	}

	if updates.Back != nil {
		updateData["back"] = *updates.Back
	}

	if len(updateData) == 0 {
		return nil
	}

	res := r.db.Model(&model.Card{}).Where("id = ?", cardID).Updates(updateData)
	if res.Error != nil {
		util.Logger.Error("Failed to edit card", zap.Int("cardID", cardID), zap.Error(res.Error))
		return res.Error
	}

	if res.RowsAffected == 0 {
		util.Logger.Warn("No card found to update", zap.Int("cardID", cardID))
		return gorm.ErrRecordNotFound
	}

	util.Logger.Info("Card updated", zap.Int("cardID", cardID))
	return nil
}

func (r *cardRepo) GetCardsByModule(moduleID int) ([]model.Card, error) {
	var cards []model.Card
	res := r.db.Where("module_id = ?", moduleID).Find(&cards)
	if res.Error != nil {
		util.Logger.Error("Failed to fetch cards", zap.Int("moduleID", moduleID), zap.Error(res.Error))

		return nil, res.Error
	}

	util.Logger.Info("Cards fetched", zap.Int("moduleID", moduleID), zap.Int("count", len(cards)))
	return cards, nil
}

func (r *cardRepo) GetCardById(cardID int) (*model.Card, error) {
	var card *model.Card
	res := r.db.Where("id = ?", cardID).Find(&card)
	if res.Error != nil {
		util.Logger.Error("Failed to fetch card", zap.Int("cardID", cardID), zap.Error(res.Error))

		return nil, res.Error
	}

	util.Logger.Info("Card fetched", zap.Int("cardID", cardID))
	return card, nil
}
