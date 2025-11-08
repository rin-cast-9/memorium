package service

import (
	"errors"
	"strings"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type TestService struct {
	testRepo         repo.TestRepo
	questionRepo     repo.QuestionRepo
	cardRepo         repo.CardRepo
	questionAnswerer QuestionAnswerer
	progressRepo     repo.ProgressRepo
	progressToucher  ProgressToucher
}

type QuestionAnswerer interface {
	AnswerQuestion(userID, questionID int, isCorrect bool) error
}

type ProgressToucher interface {
	TouchOrCreate(userID, cardID int) (*model.UserCardProgress, error)
}

type FinishedTestSummary struct {
	Correct            int                     `json:"correct"`
	Total              int                     `json:"total"`
	IncorrectQuestions []IncorrectQuestionInfo `json:"incorrect_questions"`
}

type IncorrectQuestionInfo struct {
	QuestionID    int    `json:"question_id"`
	Prompt        string `json:"prompt"`
	UserAnswer    string `json:"user_answer"`
	CorrectAnswer string `json:"correct_answer"`
}

func NewTestService(testRepo repo.TestRepo, questionRepo repo.QuestionRepo, cardRepo repo.CardRepo, questionAnswerer QuestionAnswerer, progressRepo repo.ProgressRepo, progressToucher ProgressToucher) *TestService {
	return &TestService{
		testRepo:         testRepo,
		questionRepo:     questionRepo,
		cardRepo:         cardRepo,
		questionAnswerer: questionAnswerer,
		progressRepo:     progressRepo,
		progressToucher:  progressToucher,
	}
}

func (s *TestService) StartTest(userID, moduleID int, isReviewOnly bool) (*model.Test, error) {
	test := &model.Test{
		UserID:       userID,
		ModuleID:     moduleID,
		IsReviewOnly: isReviewOnly,
		StartedAt:    time.Now(),
	}

	if err := s.testRepo.CreateTest(test); err != nil {
		util.Logger.Error("Failed to create test", zap.Int("userID", userID), zap.Int("moduleID", moduleID), zap.Error(err))
		return nil, util.NewInternalError(util.ErrCodeTestCreationFailed, err)
	}

	return test, nil
}

func (s *TestService) FinishTest(userID, testID int, answers []util.Answer) (*FinishedTestSummary, error) {
	test, err := s.testRepo.GetTestByID(userID, testID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "test not found")
		}

		return nil, util.NewInternalError(util.ErrCodeTestUpdateFailed, err)
	}

	correct := 0
	incorrectItems := make([]IncorrectQuestionInfo, 0, len(answers))

	for _, ans := range answers {
		q, err := s.questionRepo.GetQuestion(ans.QuestionID)
		if err != nil {
			return nil, util.NewInternalError(util.ErrCodeInternalServerError, err)
		}

		if q.TestID != test.ID {
			return nil, util.NewPublicError(util.ErrCodeForbidden, "question does not belong to test")
		}

		card, err := s.cardRepo.GetCardById(q.CardID)
		if err != nil {
			return nil, util.NewInternalError(util.ErrCodeCardFetchFailed, err)
		}

		isCorrect := strings.EqualFold(strings.TrimSpace(ans.AnsweredText), strings.TrimSpace(card.Front))

		if isCorrect {
			correct++
		} else {
			incorrectItems = append(incorrectItems, IncorrectQuestionInfo{
				QuestionID:    q.ID,
				Prompt:        card.Back,
				UserAnswer:    ans.AnsweredText,
				CorrectAnswer: card.Front,
			})
		}

		if err := s.questionAnswerer.AnswerQuestion(userID, q.ID, isCorrect); err != nil {
			return nil, util.NewInternalError(util.ErrCodeInternalServerError, err)
		}
	}

	if err := s.testRepo.FinishTest(userID, testID, correct, len(answers)); err != nil {
		return nil, util.NewInternalError(util.ErrCodeTestUpdateFailed, err)
	}

	return &FinishedTestSummary{
		Correct:            correct,
		Total:              len(answers),
		IncorrectQuestions: incorrectItems,
	}, nil
}

func (s *TestService) FinishReview(userID, moduleID int, results []util.ReviewResult) error {
	now := time.Now()

	for _, r := range results {
		progress, err := s.progressToucher.TouchOrCreate(userID, r.CardID)
		if err != nil {
			return err
		}
		progress.CorrectCount += r.CorrectCount
		progress.IncorrectCount += r.IncorrectCount
		progress.LastSeenAt = &now
		s.progressRepo.Update(progress)
	}

	return nil
}

func (s *TestService) GetTest(userID, testID int) (*model.Test, error) {
	test, err := s.testRepo.GetTestByID(userID, testID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.NewPublicError(util.ErrCodeNotFound, "test not found")
		}

		return nil, util.NewInternalError(util.ErrCodeTestRetrievalFailed, err)
	}

	return test, nil
}

func (s *TestService) ListTestsByModule(userID, moduleID int) ([]model.Test, error) {
	tests, err := s.testRepo.ListTestsByModule(userID, moduleID)
	if err != nil {
		return nil, util.NewInternalError(util.ErrCodeTestRetrievalFailed, err)
	}

	return tests, nil
}
