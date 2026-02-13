package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/rin-cast-9/memorium/server/internal/db"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/service"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

func init() {
	util.Logger = zap.NewNop()
}

func setupTestEnv(t *testing.T) *AuthHandler {
	gormDB := db.InitTestDB()
	userRepo := repo.NewUserRepo(gormDB)
	authRepo := repo.NewAuthRepo(gormDB)
	authService := service.NewAuthService(userRepo, authRepo)
	authHandler := NewAuthHandler(authService)

	t.Cleanup(func() {
		sqlDB, _ := gormDB.DB()
		sqlDB.Close()
	})

	return authHandler
}

func performRequest(r http.Handler, method, path string, body any, headers map[string]string, requestCookies []*http.Cookie) (*httptest.ResponseRecorder, []*http.Cookie) {
	var reader io.Reader
	if body != nil {
		jsonBody, _ := json.Marshal(body)
		reader = bytes.NewReader(jsonBody)
	}

	req := httptest.NewRequest(method, path, reader)
	req.Header.Set("Content-Type", "application/json")

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	for _, c := range requestCookies {
		req.AddCookie(c)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	responseCookies := w.Result().Cookies()

	return w, responseCookies
}

func TestRegister_Success(t *testing.T) {
	authHandler := setupTestEnv(t)

	router := gin.Default()
	router.POST("/register", authHandler.Register)

	body := map[string]string{
		"email":    "user@example.com",
		"fullname": "test user",
		"password": "password123",
	}

	w, _ := performRequest(router, "POST", "/register", body, nil, nil)
	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestRegister_Failure_UserExists(t *testing.T) {
	authHandler := setupTestEnv(t)

	router := gin.Default()
	router.POST("/register", authHandler.Register)

	body := map[string]string{
		"email":    "user@example.com",
		"fullname": "test user",
		"password": "password123",
	}

	performRequest(router, "POST", "/register", body, nil, nil)
	w, _ := performRequest(router, "POST", "/register", body, nil, nil)
	assert.Equal(t, http.StatusConflict, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	assert.Equal(t, util.ErrCodeUserExists, resp["error"])
}

func TestRegister_Failure_InvalidName(t *testing.T) {
	authHandler := setupTestEnv(t)

	router := gin.Default()
	router.POST("/register", authHandler.Register)

	body := map[string]string{
		"email":    "user@example.com",
		"fullname": "t",
		"password": "password123",
	}

	w, _ := performRequest(router, "POST", "/register", body, nil, nil)
	assert.Equal(t, http.StatusUnprocessableEntity, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	assert.Equal(t, util.ErrCodeFullNameTooShort, resp["error"])
}

func TestLogin_Success(t *testing.T) {
	authHandler := setupTestEnv(t)

	authHandler.authService.Register("user@example.com", "test user", "password123")

	router := gin.Default()
	router.POST("/login", authHandler.Login)

	body := map[string]string{
		"email":    "user@example.com",
		"password": "password123",
	}

	w, cookies := performRequest(router, "POST", "/login", body, nil, nil)
	assert.Equal(t, http.StatusOK, w.Code)

	foundAccess := false
	foundRefresh := false

	for _, c := range cookies {
		if c.Name == "access_token" {
			foundAccess = true
		}
		if c.Name == "refresh_token" {
			foundRefresh = true
		}
	}

	assert.True(t, foundAccess)
	assert.True(t, foundRefresh)
}

func TestLogin_Failure_WrongCredentials(t *testing.T) {
	authHandler := setupTestEnv(t)

	authHandler.authService.Register("user@example.com", "test user", "password123")

	router := gin.Default()
	router.POST("/login", authHandler.Login)

	body := map[string]string{
		"email":    "user@example.com",
		"password": "password12",
	}

	w, _ := performRequest(router, "POST", "/login", body, nil, nil)
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	assert.Equal(t, util.ErrCodeInvalidCredentials, resp["error"])
}

func TestRefresh_Success(t *testing.T) {
	authHandler := setupTestEnv(t)

	authHandler.authService.Register("user@example.com", "test user", "password123")

	router := gin.Default()
	router.POST("/login", authHandler.Login)
	router.POST("/refresh", authHandler.Refresh)

	bodyLogin := map[string]string{
		"email":    "user@example.com",
		"password": "password123",
	}

	_, loginCookies := performRequest(router, "POST", "/login", bodyLogin, nil, nil)

	w, refreshedCookies := performRequest(router, "POST", "/refresh", nil, nil, loginCookies)

	assert.Equal(t, http.StatusOK, w.Code)

	oldRefreshToken := ""

	for _, c := range loginCookies {
		if c.Name == "refresh_token" {
			oldRefreshToken = c.Value
		}
	}

	newAccessToken := ""
	newRefreshToken := ""

	for _, c := range refreshedCookies {
		if c.Name == "access_token" {
			newAccessToken = c.Value
		}
		if c.Name == "refresh_token" {
			newRefreshToken = c.Value
		}
	}

	assert.NotEmpty(t, newAccessToken)
	assert.NotEmpty(t, newRefreshToken)
	assert.NotEqual(t, oldRefreshToken, newRefreshToken)
}

func TestRefresh_Failure_InvalidToken(t *testing.T) {
	authHandler := setupTestEnv(t)

	authHandler.authService.Register("user@example.com", "test user", "password123")

	router := gin.Default()
	router.POST("/login", authHandler.Login)
	router.POST("/refresh", authHandler.Refresh)

	bodyLogin := map[string]string{
		"email":    "user@example.com",
		"password": "password123",
	}

	_, loginCookies := performRequest(router, "POST", "/login", bodyLogin, nil, nil)

	var refreshCookie *http.Cookie
	for _, c := range loginCookies {
		if c.Name == "refresh_token" {
			refreshCookie = c
			break
		}
	}

	badRefresh := *refreshCookie
	badRefresh.Value = ""

	w, _ := performRequest(router, "POST", "/refresh", nil, nil, []*http.Cookie{&badRefresh})

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	badRefresh.Value = refreshCookie.Value + "0"

	w, _ = performRequest(router, "POST", "/refresh", nil, nil, []*http.Cookie{&badRefresh})

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestLogout(t *testing.T) {
	authHandler := setupTestEnv(t)

	authHandler.authService.Register("user@example.com", "test user", "password123")

	router := gin.Default()
	router.POST("/login", authHandler.Login)
	router.POST("/logout", authHandler.Logout)

	bodyLogin := map[string]string{
		"email":    "user@example.com",
		"password": "password123",
	}

	_, loginCookies := performRequest(router, "POST", "/login", bodyLogin, nil, nil)

	w, clearedCookies := performRequest(router, "POST", "/logout", nil, nil, loginCookies)

	accessToken := ""
	refreshToken := ""

	for _, c := range clearedCookies {
		if c.Name == "access_token" {
			accessToken = c.Value
		}

		if c.Name == "refresh_token" {
			refreshToken = c.Value
		}
	}

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Empty(t, accessToken)
	assert.Empty(t, refreshToken)
}
