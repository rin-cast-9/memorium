package service

import (
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
		return util.NewPublicError(util.ErrCodeUserExists, "User with this email already exists")
	}

	hash, err := util.HashPassword(password)
	if err != nil {
		util.Logger.Error("Password hashing failed", zap.Error(err))
		return util.NewInternalError(util.ErrCodePasswordHashingFailed, err)
	}

	user := &model.User{
		Email:        email,
		FullName:     fullName,
		PasswordHash: hash,
	}

	if err := s.userRepo.CreateUser(user); err != nil {
		util.Logger.Error("User creation failed", zap.Error(err))
		return util.NewInternalError(util.ErrCodeUserCreationFailed, err)
	}

	return nil
}

func (s *AuthService) Login(email, password string) (token, username string, err error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		util.Logger.Warn("Login failed: user not found", zap.String("email", email))
		return "", "", util.NewPublicError(util.ErrCodeInvalidCredentials, "Invalid email or password")
	}

	if util.CheckPassword(user.PasswordHash, password) != nil {
		util.Logger.Warn("Login failed: wrong password", zap.String("email", email))
		return "", "", util.NewPublicError(util.ErrCodeInvalidCredentials, "Invalid email or password")
	}

	token, err = util.GenerateToken(uint(user.ID), time.Hour)
	if err != nil {
		util.Logger.Error("Token generation failed", zap.String("email", email), zap.Error(err))
		return "", "", util.NewInternalError(util.ErrCodeTokenGenerationFailed, err)
	}

	util.Logger.Info("User logged in", zap.String("email", email), zap.Uint("userID", uint(user.ID)))
	return token, user.FullName, nil
}

func validateFullName(name string) error {
	name = strings.TrimSpace(name)

	switch {
	case len(name) == 0:
		return util.NewPublicError(util.ErrCodeFullNameEmpty, "Full name cannot be empty")
	case len(name) > 100:
		return util.NewPublicError(util.ErrCodeFullNameTooLong, "Full name too long")
	case len([]rune(name)) < 2:
		return util.NewPublicError(util.ErrCodeFullNameTooShort, "Full name too short")
	}

	var invalidChars = regexp.MustCompile(`[^\p{L}\p{M}\p{Zs}\-']`)

	if invalidChars.MatchString(name) {
		return util.NewPublicError(util.ErrCodeFullNameInvalidChars, "Full name contains invalid characters")
	}

	return nil
}
