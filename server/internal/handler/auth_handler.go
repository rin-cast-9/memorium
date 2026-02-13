package handler

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		FullName string `json:"fullname"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": util.ErrCodeInvalidRequest})
		return
	}

	err := h.authService.Register(req.Email, req.FullName, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, util.ErrUserExists):
			c.JSON(http.StatusConflict, gin.H{"error": util.ErrCodeUserExists})

		case errors.Is(err, util.ErrInvalidFullName):
			errorCode := ""
			switch {
			case errors.Is(err, util.ErrFullNameEmpty):
				errorCode = util.ErrCodeFullNameEmpty

			case errors.Is(err, util.ErrFullNameTooShort):
				errorCode = util.ErrCodeFullNameTooShort

			case errors.Is(err, util.ErrFullNameTooLong):
				errorCode = util.ErrCodeFullNameTooLong

			case errors.Is(err, util.ErrFullNameInvalidChars):
				errorCode = util.ErrCodeFullNameInvalidCharacters
			}
			responseBody := gin.H{"error": errorCode}
			c.JSON(http.StatusUnprocessableEntity, responseBody)

		default:
			util.Logger.Error("Registration failed", zap.Error(err))
			c.Status(http.StatusInternalServerError)
		}

		return
	}

	util.Logger.Info("Registration successful", zap.String("email", req.Email))
	c.Status(http.StatusCreated)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": util.ErrCodeInvalidRequest})
		return
	}

	username, accessToken, refreshToken, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, util.ErrInvalidCredentials):
			c.JSON(http.StatusUnauthorized, gin.H{"error": util.ErrCodeInvalidCredentials})

		default:
			util.Logger.Error("Login failed", zap.Error(err))
			c.Status(http.StatusInternalServerError)
		}

		return
	}

	setAccessRefreshTokensCookies(c, accessToken, refreshToken)

	util.Logger.Info("Login successful", zap.String("email", req.Email))
	c.JSON(http.StatusOK, gin.H{"username": username})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.Status(http.StatusUnauthorized)
		return
	}

	fmt.Println(refreshToken)

	accessToken, refreshToken, err := h.authService.Refresh(refreshToken)
	if err != nil {
		switch {
		case errors.Is(err, util.ErrInvalidRefreshToken):
			c.Status(http.StatusUnauthorized)

		default:
			util.Logger.Error("Refresh failed", zap.Error(err))
			c.Status(http.StatusInternalServerError)
		}

		return
	}

	setAccessRefreshTokensCookies(c, accessToken, refreshToken)
	c.Status(http.StatusOK)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	rawRefreshToken, _ := c.Cookie("refresh_token")

	h.authService.Logout(rawRefreshToken)

	clearAccessRefreshTokenCookies(c)

	c.Status(http.StatusOK)
}

func setAccessRefreshTokensCookies(c *gin.Context, access, refresh string) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    access,
		Path:     "/",
		Expires:  time.Now().Add(1 * time.Minute),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    refresh,
		Path:     "/",
		Expires:  time.Now().Add(30 * 24 * time.Hour),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
}

func clearAccessRefreshTokenCookies(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: false,
		Secure:   false,
		SameSite: http.SameSiteStrictMode,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteStrictMode,
	})
}
