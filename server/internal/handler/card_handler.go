package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/dto"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
)

type CardHandler struct {
	cardService *service.CardService
}

func NewCardHandler(cardService *service.CardService) *CardHandler {
	return &CardHandler{cardService: cardService}
}

func (h *CardHandler) CreateCard(c *gin.Context) {
	userID := c.GetInt("userID")

	var req struct {
		ModuleID int    `json:"module_id" binding:"required"`
		Front    string `json:"front" binding:"required"`
		Back     string `json:"back" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	card, err := h.cardService.Create(userID, req.ModuleID, req.Front, req.Back)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, card)
}

func (h *CardHandler) DeleteCard(c *gin.Context) {
	userID := c.GetInt("userID")

	cardID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid card id"))
		return
	}

	if err := h.cardService.Delete(userID, cardID); err != nil {
		handleError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *CardHandler) EditCard(c *gin.Context) {
	userID := c.GetInt("userID")

	cardID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid card id"))
		return
	}

	var req dto.CardUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid request"))
		return
	}

	updatedCard, err := h.cardService.Edit(userID, cardID, &req)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, updatedCard)
}

func (h *CardHandler) GetCard(c *gin.Context) {
	userID := c.GetInt("userID")

	cardID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid card id"))
		return
	}

	card, err := h.cardService.Get(userID, cardID)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, card)
}

func (h *CardHandler) ListCards(c *gin.Context) {
	userID := c.GetInt("userID")

	moduleID, err := strconv.Atoi(c.Param("moduleID"))
	if err != nil {
		handleError(c, util.NewPublicError(util.ErrCodeInvalidRequest, "invalid module id"))
		return
	}

	cards, err := h.cardService.List(userID, moduleID)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, cards)
}
