package handler

import (
	"math/rand/v2"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

type TestHandler struct {
	testService     *service.TestService
	questionService *service.QuestionService
	cardService     *service.CardService
}

type QuestionPayload struct {
	QuestionID     int      `json:"question_id"`
	TestID         int      `json:"test_id"`
	CardID         int      `json:"card_id"`
	QuestionTypeID int      `json:"question_type_id"`
	Prompt         string   `json:"prompt"`
	Answer         string   `json:"answer"`
	Options        []string `json:"options"`
}

func NewTestHandler(testService *service.TestService, questionService *service.QuestionService, cardService *service.CardService) *TestHandler {
	return &TestHandler{testService: testService, questionService: questionService, cardService: cardService}
}

func (h *TestHandler) StartTest(c *gin.Context) {
	userID := c.GetInt("userID")

	var req struct {
		ModuleID     int   `json:"module_id" binding:"required"`
		IsReviewOnly *bool `json:"is_review_only" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	test, err := h.testService.StartTest(userID, req.ModuleID, *req.IsReviewOnly)
	if err != nil {
		handleError(c, err)
		return
	}

	questions, err := h.questionService.CreateQuestionsForTest(userID, test.ID, *req.IsReviewOnly)
	if err != nil {
		handleError(c, err)
		return
	}

	cards, err := h.cardService.List(userID, req.ModuleID)
	if err != nil {
		handleError(c, err)
		return
	}

	payload := buildQuestionPayloadFromCards(questions, cards)

	util.Logger.Info("Test started", zap.Int("userID", userID), zap.Int("moduleID", req.ModuleID), zap.Int("testID", test.ID), zap.Bool("isReviewOnly", *req.IsReviewOnly))

	c.JSON(http.StatusCreated, gin.H{
		"test":    test,
		"payload": payload,
	})
}

func (h *TestHandler) StartReview(c *gin.Context) {
	userID := c.GetInt("userID")

	var req struct {
		ModuleID   int `json:"module_id" binding:"required"`
		ReviewType int `json:"review_type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	testMode := service.TestMode(req.ReviewType)

	questions, err := h.questionService.GenerateQuestionsForReview(userID, req.ModuleID, testMode)
	if err != nil {
		handleError(c, err)
		return
	}

	cards, err := h.cardService.List(userID, req.ModuleID)
	if err != nil {
		handleError(c, err)
		return
	}

	payload := buildQuestionPayloadFromCards(questions, cards)

	util.Logger.Info("Review started", zap.Int("userID", userID), zap.Int("moduleID", req.ModuleID))

	c.JSON(http.StatusCreated, gin.H{
		"payload": payload,
	})
}

func buildQuestionPayload(questions []*model.Question, cards map[int]*model.Card) []QuestionPayload {
	var payloads []QuestionPayload
	for _, q := range questions {
		c := cards[q.CardID]
		p := QuestionPayload{
			QuestionID:     q.ID,
			TestID:         q.TestID,
			CardID:         q.CardID,
			QuestionTypeID: q.QuestionTypeID,
			Prompt:         c.Back,
			Answer:         c.Front,
		}

		if int(q.QuestionTypeID) == int(service.QuestionTypeSelect) {
			options := []string{c.Front}
			for _, other := range cards {
				if other.ID != c.ID && len(options) < 4 {
					options = append(options, other.Front)
				}
			}

			rand.Shuffle(len(options), func(i, j int) { options[i], options[j] = options[j], options[i] })
			p.Options = options
		}

		payloads = append(payloads, p)
	}

	return payloads
}

func buildQuestionPayloadFromCards(questions []*model.Question, cards []model.Card) []QuestionPayload {
	cardsMap := make(map[int]*model.Card, len(cards))
	for i := range cards {
		c := &cards[i]
		cardsMap[c.ID] = c
	}

	return buildQuestionPayload(questions, cardsMap)
}

func (h *TestHandler) FinishTest(c *gin.Context) {
	userID := c.GetInt("userID")

	testID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid test id"))
		return
	}

	var req util.FinishTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	summary, err := h.testService.FinishTest(userID, testID, req.Answers)
	if err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Test finished", zap.Int("userID", userID), zap.Int("testID", testID))

	c.JSON(http.StatusOK, summary)
}

func (h *TestHandler) FinishReview(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	var req struct {
		ReviewResults []util.ReviewResult `json:"review_results" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	if err := h.testService.FinishReview(userID, moduleId, req.ReviewResults); err != nil {
		handleError(c, err)
		return
	}

	util.Logger.Info("Review finished", zap.Int("userID", userID), zap.Int("moduleID", moduleId))

	c.Status(http.StatusOK)
}

func (h *TestHandler) GetTest(c *gin.Context) {
	userID := c.GetInt("userID")

	testID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid test id"))
		return
	}

	test, err := h.testService.GetTest(userID, testID)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, test)
}

func (h *TestHandler) ListTestsByModule(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("module_id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	tests, err := h.testService.ListTestsByModule(userID, moduleID)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, tests)
}
