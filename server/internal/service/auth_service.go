package service

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
)

type AuthService struct {
	userRepo repo.UserRepo
}

func NewAuthService(userRepo repo.UserRepo) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(email, fullName, password string) error {
	if err := validateFullName(fullName); err != nil {
		util.Logger.Warn("Invalid full name", zap.String("fullname", fullName), zap.Error(err))
		return err
	}

	if _, err := s.userRepo.GetByEmail(email); err == nil {
		util.Logger.Warn("Attempt to register existing user", zap.String("email", email))
		return errors.New("user already exists")
	}

	hash, err := util.HashPassword(password)
	if err != nil {
		util.Logger.Error("Password hashing failed", zap.Error(err))
		return err
	}

	user := &model.User{
		Email:        email,
		FullName:     fullName,
		PasswordHash: hash,
	}

	return s.userRepo.CreateUser(user)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		util.Logger.Warn("Login failed: user not found", zap.String("email", email))
		return "", errors.New("invalid credentials")
	}

	if util.CheckPassword(user.PasswordHash, password) != nil {
		util.Logger.Warn("Login failed: wrong password", zap.String("email", email))
		return "", errors.New("invalid credentials")
	}

	token, err := util.GenerateToken(uint(user.ID), time.Hour)
	if err != nil {
		util.Logger.Error("Token generation failed", zap.String("email", email), zap.Error(err))
		return "", err
	}

	util.Logger.Info("User logged in", zap.String("email", email), zap.Uint("userID", uint(user.ID)))
	return token, nil
}

func validateFullName(name string) error {
	name = strings.TrimSpace(name)

	if len(name) == 0 {
		return errors.New("full name cannot be empty")
	}

	if len(name) > 100 {
		return errors.New("full name too long")
	}

	if len([]rune(name)) < 2 {
		return errors.New("full name too short")
	}

	var invalidChars = regexp.MustCompile(`[^\p{L}\p{M}\p{Zs}\-']`)

	if invalidChars.MatchString(name) {
		return errors.New("full name contains invalid characters")
	}

	return nil
}
