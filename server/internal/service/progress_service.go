package service

import (
	"errors"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ProgressService struct {
	progressRepo repo.ProgressRepo
	cardRepo     repo.CardRepo
	db           *gorm.DB
}

type CardCategory int

const (
	CategoryNew CardCategory = iota + 1
	CategoryNeedReview
	CategoryLearned
)

func NewProgressService(db *gorm.DB, progressRepo repo.ProgressRepo, cardRepo repo.CardRepo) *ProgressService {
	return &ProgressService{progressRepo: progressRepo, db: db, cardRepo: cardRepo}
}

func (s *ProgressService) ListByModule(userID, moduleID int) ([]model.UserCardProgress, error) {
	progresses, err := s.progressRepo.ListByModule(userID, moduleID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeProgressRetrievalFailed, err)
	}

	return progresses, nil
}

func (s *ProgressService) ListByUser(userID int) ([]model.UserCardProgress, error) {
	progresses, err := s.progressRepo.ListByUser(userID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeProgressRetrievalFailed, err)
	}

	return progresses, nil
}

func (s *ProgressService) TouchOrCreate(userID, cardID int) (*model.UserCardProgress, error) {
	progress, err := s.progressRepo.GetByUserCard(userID, cardID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, util.NewInternalError(util.ErrCodeProgressRetrievalFailed, err)
	}

	if progress == nil {
		progress = &model.UserCardProgress{
			UserID: userID,
			CardID: cardID,
		}

		if err := s.progressRepo.Create(progress); err != nil {
			return nil, util.NewInternalError(util.ErrCodeProgressCreationFailed, err)
		}

		util.Logger.Info("user progress created", zap.Int("userID", userID), zap.Int("cardID", cardID))
	}

	return progress, nil
}

func (s *ProgressService) UpdateResult(userID, cardID int, correct bool) error {
	now := time.Now()

	progress, err := s.TouchOrCreate(userID, cardID)
	if err != nil {
		return util.NewInternalError(util.ErrCodeProgressRetrievalFailed, err)
	}

	if correct {
		progress.CorrectCount++
	} else {
		progress.IncorrectCount++
	}

	progress.LastSeenAt = &now

	err = s.progressRepo.Update(progress)
	if err != nil {
		return util.NewInternalError(util.ErrCodeProgressUpdateFailed, err)
	}

	util.Logger.Info("user progress updated", zap.Int("userID", userID), zap.Int("cardID", cardID), zap.Bool("isCorrect", correct))

	return nil
}

func (s *ProgressService) Categorize(userID, moduleID int) (map[int]CardCategory, error) {
	cards, err := s.cardRepo.GetCardsByModule(moduleID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeCardFetchFailed, err)
	}

	progresses, err := s.progressRepo.ListByModule(userID, moduleID)
	if err != nil {
		return nil, err
	}

	progressMap := make(map[int]*model.UserCardProgress)
	for i := range progresses {
		p := &progresses[i]
		progressMap[p.CardID] = p
	}

	now := time.Now()
	categories := make(map[int]CardCategory, len(cards))
	for _, c := range cards {
		p, ok := progressMap[c.ID]
		if !ok {
			categories[c.ID] = CategoryNew
			continue
		}

		total := p.CorrectCount + p.IncorrectCount
		var accuracy float64
		if total > 0 {
			accuracy = float64(p.CorrectCount) / float64(total)
		}

		switch {
		case p.CorrectCount == 0 && p.IncorrectCount == 0 && p.LastSeenAt == nil:
			categories[c.ID] = CategoryNew

		case (p.CorrectCount < 3 || accuracy < 0.7) && (p.LastSeenAt == nil || p.LastSeenAt.Before(now.AddDate(0, 0, -7))):
			categories[c.ID] = CategoryNeedReview

		case p.CorrectCount >= 3 && accuracy >= 0.85 && p.LastSeenAt != nil && p.LastSeenAt.After(now.AddDate(0, 0, -7)):
			categories[c.ID] = CategoryLearned

		default:
			categories[c.ID] = CategoryNeedReview
		}
	}

	return categories, nil
}
