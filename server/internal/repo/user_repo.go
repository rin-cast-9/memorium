package repo

import (
	"errors"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserRepo interface {
	GetByEmail(email string) (*model.User, error)
	CreateUser(user *model.User) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) UserRepo {
	return &userRepo{db: db}
}

func (r *userRepo) GetByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			util.Logger.Warn("User not found", zap.String("email", email))
			return nil, errors.New("user not found")
		}

		util.Logger.Error("DB error on GetByEmail", zap.String("email", email), zap.Error(err))
		return nil, err
	}

	util.Logger.Debug("User fetched", zap.String("email", email))
	return &user, nil
}

func (r *userRepo) CreateUser(user *model.User) error {
	err := r.db.Create(user).Error
	if err != nil {
		util.Logger.Error("Failed to create user", zap.String("email", user.Email), zap.Error(err))
	} else {
		util.Logger.Info("User created", zap.String("email", user.Email))
	}

	return err
}
