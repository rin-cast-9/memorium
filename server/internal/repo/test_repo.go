package repo

import (
	"errors"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type TestRepo interface {
	CreateTest(test *model.Test) error
	GetTestByID(userID, testID int) (*model.Test, error)
	FinishTest(userID, testID, correctAnswers, totalQuestions int) error
	ListTestsByModule(userID, moduleID int) ([]model.Test, error)
}

type testRepo struct {
	db *gorm.DB
}

func NewTestRepo(db *gorm.DB) TestRepo {
	return &testRepo{db: db}
}

func (r *testRepo) CreateTest(test *model.Test) error {
	err := r.db.Create(test).Error
	if err != nil {
		util.Logger.Error("Failed to create test", zap.Error(err))
		return err
	}

	util.Logger.Info("Test created", zap.Int("userID", test.UserID), zap.Int("moduleID", test.ModuleID), zap.Bool("isReviewOnly", test.IsReviewOnly))

	return nil
}

func (r *testRepo) GetTestByID(userID, testID int) (*model.Test, error) {
	var test model.Test
	err := r.db.Where("id = ? AND user_id = ?", testID, userID).First(&test).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			util.Logger.Warn("Test not found", zap.Int("userID", userID), zap.Int("testID", testID))
		} else {
			util.Logger.Error("Failed to get test", zap.Int("userID", userID), zap.Int("testID", testID), zap.Error(err))
		}

		return nil, err
	}

	return &test, nil
}

func (r *testRepo) FinishTest(userID, testID, correctAnswers, totalQuestions int) error {
	res := r.db.Model(&model.Test{}).Where("id = ? AND user_id = ?", testID, userID).Updates(map[string]interface{}{
		"finished_at":     gorm.Expr("NOW()"),
		"correct_answers": correctAnswers,
		"total_questions": totalQuestions,
	})
	if res.Error != nil {
		util.Logger.Error("Failed to finish test", zap.Int("userID", userID), zap.Int("testID", testID), zap.Error(res.Error))
		return res.Error
	}

	if res.RowsAffected == 0 {
		util.Logger.Warn("No test found to finish", zap.Int("userID", userID), zap.Int("testID", testID))
		return gorm.ErrRecordNotFound
	}

	util.Logger.Info("Test finished", zap.Int("userID", userID), zap.Int("testID", testID))
	return nil
}

func (r *testRepo) ListTestsByModule(userID, moduleID int) ([]model.Test, error) {
	var tests []model.Test
	err := r.db.Where("user_id = ? AND module_id = ?", userID, moduleID).Order("started_at DESC").Find(&tests).Error
	if err != nil {
		util.Logger.Error("Failed to list tests", zap.Int("userID", userID), zap.Int("moduleID", moduleID), zap.Error(err))
		return nil, err
	}

	return tests, nil
}
