package service

import (
	"errors"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/repo"
	"github.com/rin-cast-9/memorium/server/internal/util"
)

type AuthService struct {
	userRepo repo.UserRepo
}

func NewAuthService(userRepo repo.UserRepo) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(email, password string) error {
	_, err := s.userRepo.GetByEmail(email)
	if err == nil {
		return errors.New("user already exists")
	}

	hash, err := util.HashPassword(password)
	if err != nil {
		return err
	}

	user := &model.User{
		Email:        email,
		PasswordHash: hash,
	}

	return s.userRepo.CreateUser(user)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	if util.CheckPassword(user.PasswordHash, password) != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := util.GenerateToken(uint(user.ID), time.Hour)
	if err != nil {
		return "", err
	}

	return token, nil
}
