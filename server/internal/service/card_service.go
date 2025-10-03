package service

import (
	"errors"
	"strings"

	"github.com/rin-cast-9/memorium/server/internal/dto"
	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CardService struct {
	cardRepo   repo.CardRepo
	moduleRepo repo.ModuleRepo
}

func NewCardService(cardRepo repo.CardRepo, moduleRepo repo.ModuleRepo) *CardService {
	return &CardService{cardRepo: cardRepo, moduleRepo: moduleRepo}
}

func (s *CardService) Create(userID, moduleID int, front, back string) (*model.Card, error) {
	front = strings.TrimSpace(front)
	if front == "" {
		return nil, util.NewPublicError(util.ErrCodeCardFrontEmpty, "card front text cannot be empty")
	}

	owned, err := s.moduleRepo.IsModuleOwnedByUser(moduleID, userID)
	if err != nil {
		util.Logger.Error("Failed to check module ownership", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))

		return nil, util.NewInternalError(util.ErrCodeModuleCheckFailed, err)
	}

	if !owned {
		return nil, util.NewPublicError(util.ErrCodeUnauthorized, "cannot add card to a module you do not own")
	}

	card := &model.Card{
		ModuleID: moduleID,
		Front:    front,
		Back:     back,
	}

	if err := s.cardRepo.CreateCard(card); err != nil {
		util.Logger.Error("Failed to create card", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeCardCreationFailed, err)
	}

	util.Logger.Info("Card created", zap.Int("moduleID", moduleID), zap.Int("userID", userID))

	return card, nil
}

func (s *CardService) Delete(userID, cardID int) error {
	card, err := s.cardRepo.GetCardById(cardID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return util.NewPublicError(util.ErrCodeNotFound, "card not found")
		}

		util.Logger.Error("Failed to fetch card", zap.Int("cardID", cardID), zap.Error(err))

		return util.NewInternalError(util.ErrCodeCardFetchFailed, err)
	}

	owned, err := s.moduleRepo.IsModuleOwnedByUser(card.ModuleID, userID)
	if err != nil {
		util.Logger.Error("Failed to check module ownership", zap.Int("moduleID", card.ModuleID), zap.Int("userID", userID), zap.Error(err))
		return util.NewInternalError(util.ErrCodeModuleCheckFailed, err)
	}

	if !owned {
		return util.NewPublicError(util.ErrCodeUnauthorized, "cannot delete a card from a module you do not own")
	}

	if err := s.cardRepo.DeleteCard(cardID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return util.NewPublicError(util.ErrCodeNotFound, "card not found")
		}

		util.Logger.Error("Failed to delete card", zap.Int("cardID", cardID), zap.Error(err))
		return util.NewInternalError(util.ErrCodeCardDeletionFailed, err)
	}

	util.Logger.Info("Card deleted", zap.Int("cardID", cardID), zap.Int("userID", userID))
	return nil
}

func (s *CardService) Edit(userID, cardID int, updates *dto.CardUpdate) (*model.Card, error) {
	card, err := s.cardRepo.GetCardById(cardID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "card not found")
		}
		util.Logger.Error("Failed to fetch card", zap.Int("cardID", cardID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeCardFetchFailed, err)
	}

	owned, err := s.moduleRepo.IsModuleOwnedByUser(card.ModuleID, userID)
	if err != nil {
		util.Logger.Error("Failed to check module ownership", zap.Int("moduleID", card.ModuleID), zap.Int("userID", userID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeModuleCheckFailed, err)
	}

	if !owned {
		return nil, util.NewPublicError(util.ErrCodeUnauthorized, "cannot edit a card in a module you do not own")
	}

	if updates.Front != nil {
		*updates.Front = strings.TrimSpace(*updates.Front)
		if *updates.Front == "" {
			return nil, util.NewPublicError(util.ErrCodeInvalidRequest, "card front text cannot be empty")
		}
	}

	if err := s.cardRepo.EditCard(cardID, updates); err != nil {
		util.Logger.Error("Failed to edit card", zap.Int("cardID", cardID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeCardUpdateFailed, err)
	}

	updatedCard, err := s.cardRepo.GetCardById(cardID)
	if err != nil {
		util.Logger.Error("Failed to fetch updated card", zap.Int("cardID", cardID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeCardFetchFailed, err)
	}

	util.Logger.Info("Card updated", zap.Int("cardID", cardID), zap.Int("userID", userID))
	return updatedCard, nil
}

func (s *CardService) List(userID, moduleID int) ([]model.Card, error) {
	owned, err := s.moduleRepo.IsModuleOwnedByUser(moduleID, userID)
	if err != nil {
		util.Logger.Error("Failed to check module ownership", zap.Int("moduleID", moduleID), zap.Int("userID", userID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeModuleCheckFailed, err)
	}

	if !owned {
		return nil, util.NewPublicError(util.ErrCodeUnauthorized, "cannot view cards of a module you do not own")
	}

	cards, err := s.cardRepo.GetCardsByModule(moduleID)
	if err != nil {
		util.Logger.Error("Failed to get cards by module", zap.Int("moduleID", moduleID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeCardFetchFailed, err)
	}

	util.Logger.Info("Cards retrieved for module", zap.Int("moduleID", moduleID), zap.Int("userID", userID))
	return cards, nil
}

func (s *CardService) Get(userID, cardID int) (*model.Card, error) {
	card, err := s.cardRepo.GetCardById(cardID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "card not found")
		}
		util.Logger.Error("Failed to fetch card", zap.Int("cardID", cardID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeCardFetchFailed, err)
	}

	owned, err := s.moduleRepo.IsModuleOwnedByUser(card.ModuleID, userID)
	if err != nil {
		util.Logger.Error("Failed to check module ownership", zap.Int("moduleID", card.ModuleID), zap.Int("userID", userID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeModuleCheckFailed, err)
	}

	if !owned {
		return nil, util.NewPublicError(util.ErrCodeUnauthorized, "cannot view a card in a module you do not own")
	}

	util.Logger.Info("Card retrieved", zap.Int("cardID", cardID), zap.Int("userID", userID))
	return card, nil
}
