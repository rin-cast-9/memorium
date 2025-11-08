package service

import (
	"errors"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type QuestionService struct {
	questionRepo repo.QuestionRepo
	testRepo     repo.TestRepo
	progress     ProgressCategorizer
	progressUpd  ProgressUpdater
	db           *gorm.DB
}

type ProgressCategorizer interface {
	Categorize(userID, moduleID int) (map[int]CardCategory, error)
}

type ProgressUpdater interface {
	UpdateResult(userID, cardID int, correct bool) error
}

type TestType int

const (
	TestTypeReview TestType = iota + 1
	TestTypeTest
)

type TestMode int

const (
	TestModeAll TestMode = iota + 1
	TestModeLearned
	TestModeNeedReview
	TestModeNew
)

type QuestionTypeID int

const (
	QuestionTypeSelect QuestionTypeID = 1
	QuestionTypeSpell  QuestionTypeID = 2
)

func NewQuestionService(questionRepo repo.QuestionRepo, testRepo repo.TestRepo, progress ProgressCategorizer, progressUpd ProgressUpdater, db *gorm.DB) *QuestionService {
	return &QuestionService{questionRepo: questionRepo, testRepo: testRepo, progress: progress, progressUpd: progressUpd, db: db}
}

// func (s *QuestionService) GetQuestions(userID, testID int) ([]model.Question, error) {
// 	test, err := s.testRepo.GetTestByID(userID, testID)
// 	if err != nil {
// 		if errors.Is(err, gorm.ErrRecordNotFound) {
// 			return nil, util.NewPublicError(util.ErrCodeNotFound, "test not found")
// 		}

// 		return nil, util.NewInternalError(util.ErrCodeInternalServerError, err)
// 	}

// 	questions, err := s.questionRepo.GetQuestionByTest(test.ID)
// 	if err != nil {
// 		return nil, util.NewInternalError(util.ErrCodeInternalServerError, err)
// 	}

// 	util.Logger.Info("Fetched test questions", zap.Int("userID", userID), zap.Int("testID", testID), zap.Int("count", len(questions)))

// 	return questions, nil
// }

func (s *QuestionService) CreateQuestionsForTest(userID, testID int, isReviewOnly bool) ([]*model.Question, error) {
	test, err := s.testRepo.GetTestByID(userID, testID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeTestRetrievalFailed, err)
	}

	var testMode TestMode
	if isReviewOnly {
		testMode = TestModeNeedReview
	} else {
		testMode = TestModeAll
	}

	questions, err := s.generateQuestions(userID, test.ModuleID, TestTypeTest, testMode, &testID)
	if err != nil {
		return nil, err
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, util.NewInternalError(util.ErrCodeDBTransactionFailed, tx.Error)
	}
	if err := s.questionRepo.CreateBatch(tx, questions); err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, util.NewInternalError(util.ErrCodeDBTransactionFailed, err)
	}

	return questions, nil
}

func (s *QuestionService) GenerateQuestionsForReview(userID, moduleID int, testMode TestMode) ([]*model.Question, error) {
	return s.generateQuestions(userID, moduleID, TestTypeReview, testMode, nil)
}

func (s *QuestionService) generateQuestions(userID, moduleID int, testType TestType, testMode TestMode, testID *int) ([]*model.Question, error) {
	progresses, err := s.progress.Categorize(userID, moduleID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeProgressRetrievalFailed, err)
	}

	var selectedCategories []CardCategory
	switch testType {
	case TestTypeReview:
		switch testMode {
		case TestModeAll:
			selectedCategories = []CardCategory{CategoryNew, CategoryNeedReview, CategoryLearned}

		case TestModeNew:
			selectedCategories = []CardCategory{CategoryNew}

		case TestModeNeedReview:
			selectedCategories = []CardCategory{CategoryNeedReview}

		case TestModeLearned:
			selectedCategories = []CardCategory{CategoryLearned}
		}

	case TestTypeTest:
		if testMode == TestModeNeedReview {
			selectedCategories = []CardCategory{CategoryNeedReview}
		} else {
			selectedCategories = []CardCategory{CategoryNew, CategoryNeedReview, CategoryLearned}
		}
	}

	var candidateCardIDs []int
	for cardID, category := range progresses {
		for _, selected := range selectedCategories {
			if category == selected {
				candidateCardIDs = append(candidateCardIDs, cardID)
			}
		}
	}

	numQuestions := len(candidateCardIDs)
	numSelect := int(float64(numQuestions) * 0.8)
	questions := make([]*model.Question, 0, numQuestions)

	for i, cardID := range candidateCardIDs {
		qType := QuestionTypeSelect
		if i >= numSelect {
			qType = QuestionTypeSpell
		}

		q := &model.Question{
			CardID:         cardID,
			QuestionTypeID: int(qType),
		}

		if testID != nil {
			q.TestID = *testID
		}

		questions = append(questions, q)
	}

	return questions, nil
}

func (s *QuestionService) AnswerQuestion(userID, questionID int, isCorrect bool) error {
	question, err := s.questionRepo.GetQuestion(questionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return util.NewPublicError(util.ErrCodeNotFound, "question not found")
		}

		return util.NewInternalError(util.ErrCodeInternalServerError, err)
	}

	test, err := s.testRepo.GetTestByID(userID, question.TestID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return util.NewPublicError(util.ErrCodeForbidden, "access denied")
		}

		return util.NewInternalError(util.ErrCodeInternalServerError, err)
	}

	if test.UserID != userID {
		return util.NewPublicError(util.ErrCodeForbidden, "not your test")
	}

	err = s.questionRepo.Update(questionID, isCorrect)
	if err != nil {
		return util.NewInternalError(util.ErrCodeInternalServerError, err)
	}

	if err := s.progressUpd.UpdateResult(userID, question.CardID, isCorrect); err != nil {
		return util.NewInternalError(util.ErrCodeProgressUpdateFailed, err)
	}

	util.Logger.Info("Answered question", zap.Int("userID", userID), zap.Int("testID", test.ID), zap.Int("questionID", questionID), zap.Bool("isCorrect", isCorrect))

	return nil
}
