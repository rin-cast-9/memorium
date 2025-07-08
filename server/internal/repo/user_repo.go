package repo

import (
	"errors"

	"github.com/rin-cast-9/memorium/server/internal/model"
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
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}

		return nil, err
	}

	return &user, nil
}

func (r *userRepo) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}
