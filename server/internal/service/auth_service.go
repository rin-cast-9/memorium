package service

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
)

type AuthService struct {
	userRepo repo.UserRepo
	authRepo repo.AuthRepo
}

func NewAuthService(userRepo repo.UserRepo, authRepo repo.AuthRepo) *AuthService {
	return &AuthService{userRepo: userRepo, authRepo: authRepo}
}

func (s *AuthService) Register(email, fullName, password string) error {
	if err := validateFullName(fullName); err != nil {
		return err
	}

	_, err := s.userRepo.GetByEmail(email)
	if err == nil {
		return util.ErrUserExists
	}
	if !errors.Is(err, util.ErrNotFound) {
		return err
	}

	hash, err := util.HashPassword(password)
	if err != nil {
		return util.ErrPasswordHashingFailed
	}

	user := &model.User{
		Email:        email,
		FullName:     fullName,
		PasswordHash: hash,
	}

	if err := s.userRepo.CreateUser(user); err != nil {
		return err
	}

	return nil
}

func (s *AuthService) Login(email, password string) (username, accessToken, refreshToken string, err error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil || user == nil {
		return "", "", "", util.ErrInvalidCredentials
	}

	err = util.CheckPassword(user.PasswordHash, password)
	if err != nil {
		return "", "", "", util.ErrInvalidCredentials
	}

	raw, hashed, err := util.GenerateRefreshToken()
	if err != nil {
		return "", "", "", util.ErrRefreshTokenGenerationFailed
	}

	accessToken, err = util.GenerateToken(uint(user.ID), time.Hour)
	if err != nil {
		return "", "", "", util.ErrAccessTokenGenerationFailed
	}

	err = s.authRepo.InsertToken(user.ID, hashed, time.Now().Add(30*24*time.Hour), false)
	if err != nil {
		return "", "", "", err
	}

	return user.FullName, accessToken, raw, nil
}

func (s *AuthService) Refresh(refreshToken string) (accessToken, refreshTokenOut string, err error) {
	sum := sha256.Sum256([]byte(refreshToken))
	oldHash := hex.EncodeToString(sum[:])

	storedToken, err := s.authRepo.GetRefreshTokenByHash(oldHash)
	if err != nil {
		if errors.Is(err, util.ErrNotFound) {
			return "", "", util.ErrInvalidRefreshToken
		}

		return "", "", err
	}

	if storedToken.Revoked || time.Now().After(storedToken.ExpiresAt) {
		return "", "", util.ErrInvalidRefreshToken
	}

	rawNew, newHash, err := util.GenerateRefreshToken()
	if err != nil {
		return "", "", util.ErrRefreshTokenGenerationFailed
	}

	accessToken, err = util.GenerateToken(uint(storedToken.UserID), time.Hour)
	if err != nil {
		return "", "", util.ErrAccessTokenGenerationFailed
	}

	err = s.authRepo.RotateRefreshToken(oldHash, storedToken.UserID, newHash, time.Now().Add(30*24*time.Hour))
	if err != nil {
		if errors.Is(err, util.ErrInvalidRefreshToken) {
			return "", "", util.ErrInvalidRefreshToken
		}

		return "", "", err
	}

	return accessToken, rawNew, nil
}

func (s *AuthService) Logout(refreshToken string) error {
	if refreshToken == "" {
		return nil
	}

	sum := sha256.Sum256([]byte(refreshToken))
	hashed := hex.EncodeToString(sum[:])

	s.authRepo.RevokeToken(hashed)

	return nil
}

func validateFullName(name string) error {
	name = strings.TrimSpace(name)

	switch {
	case len(name) == 0:
		return fmt.Errorf("%w: %w", util.ErrInvalidFullName, util.ErrFullNameEmpty)
	case len(name) > 100:
		return fmt.Errorf("%w: %w", util.ErrInvalidFullName, util.ErrFullNameTooLong)
	case len([]rune(name)) < 2:
		return fmt.Errorf("%w: %w", util.ErrInvalidFullName, util.ErrFullNameTooShort)
	}

	var invalidChars = regexp.MustCompile(`[^\p{L}\p{M}\p{Zs}\-']`)
	if invalidChars.MatchString(name) {
		return fmt.Errorf("%w: %w", util.ErrInvalidFullName, util.ErrFullNameInvalidChars)
	}

	return nil
}
