package repo

import (
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type QuestionRepo interface {
	Create(question *model.Question) error
	CreateBatch(tx *gorm.DB, questions []*model.Question) error
	GetQuestion(questionID int) (*model.Question, error)
	ListByTest(testID int) ([]model.Question, error)
	Update(questionID int, isCorrect bool) error
}

type questionRepo struct {
	db *gorm.DB
}

func NewQuestionRepo(db *gorm.DB) QuestionRepo {
	return &questionRepo{db: db}
}

func (r *questionRepo) Create(question *model.Question) error {
	err := r.db.Create(question).Error
	if err != nil {
		util.Logger.Error("Failed to create question", zap.Error(err))
	} else {
		util.Logger.Info("Question created", zap.Int("testID", question.TestID), zap.Int("cardID", question.CardID))
	}

	return err
}

func (r *questionRepo) CreateBatch(tx *gorm.DB, questions []*model.Question) error {
	if tx == nil {
		return gorm.ErrInvalidTransaction
	}

	if len(questions) == 0 {
		return nil
	}

	if err := tx.Create(&questions).Error; err != nil {
		util.Logger.Error("failed to batch insert questinos", zap.Int("count", len(questions)), zap.Error(err))
		return err
	}

	util.Logger.Info("batch of questions created", zap.Int("count", len(questions)))
	return nil
}

func (r *questionRepo) GetQuestion(questionID int) (*model.Question, error) {
	var question model.Question
	err := r.db.Where("id = ?", questionID).First(&question).Error
	if err != nil {
		util.Logger.Error("Failed to retrieve question", zap.Int("questionID", questionID), zap.Error(err))
	} else {
		util.Logger.Info("Question retrieved", zap.Int("questionID", questionID))
	}

	return &question, nil
}

func (r *questionRepo) ListByTest(testID int) ([]model.Question, error) {
	var questions []model.Question
	err := r.db.Preload("QuestionType").Preload("Card").Where("test_id = ?", testID).Find(&questions).Error
	if err != nil {
		util.Logger.Error("Failed to get questions by test", zap.Int("testID", testID), zap.Error(err))
		return nil, err
	}

	return questions, nil
}

func (r *questionRepo) Update(questionID int, isCorrect bool) error {
	now := time.Now()
	res := r.db.Model(&model.Question{}).Where("id = ?", questionID).Updates(map[string]interface{}{
		"is_correct":  isCorrect,
		"answered_at": now,
	})

	if res.Error != nil {
		util.Logger.Error("Failed to update question result", zap.Int("questionID", questionID), zap.Error(res.Error))
		return res.Error
	}

	if res.RowsAffected == 0 {
		util.Logger.Warn("No question found to update", zap.Int("questionID", questionID))
		return gorm.ErrRecordNotFound
	}

	util.Logger.Info("Question result updated", zap.Int("questionID", questionID), zap.Bool("isCorrect", isCorrect))
	return nil
}
