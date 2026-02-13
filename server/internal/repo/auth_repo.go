package repo

import (
	"errors"
	"time"

	"github.com/rin-cast-9/memorium/server/internal/model"
	"github.com/rin-cast-9/memorium/server/internal/util"
	"gorm.io/gorm"
)

type AuthRepo interface {
	InsertToken(user_id int, tokenHash string, expiresAt time.Time, revoked bool) error
	GetRefreshTokenByHash(hash string) (*model.RefreshToken, error)
	RotateRefreshToken(oldHash string, userID int, newHash string, expiresAt time.Time) error
	RevokeToken(hash string) error
}

type authRepo struct {
	db *gorm.DB
}

func NewAuthRepo(db *gorm.DB) AuthRepo {
	return &authRepo{db: db}
}

func (r *authRepo) InsertToken(user_id int, tokenHash string, expiresAt time.Time, revoked bool) error {
	token := model.RefreshToken{
		UserID:    user_id,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
		Revoked:   revoked,
	}

	return r.db.Create(&token).Error
}

func (r *authRepo) GetRefreshTokenByHash(hash string) (*model.RefreshToken, error) {
	var token model.RefreshToken
	err := r.db.Where("token_hash = ?", hash).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, util.ErrNotFound
		}

		return nil, err
	}

	return &token, nil
}

func (r *authRepo) RevokeToken(hash string) error {
	tx := r.db.Model(&model.RefreshToken{}).Where("token_hash = ? AND revoked = false", hash).Update("revoked", true)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (r *authRepo) RotateRefreshToken(oldHash string, userID int, newHash string, expiresAt time.Time) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&model.RefreshToken{}).Where("token_hash = ? AND revoked = false", oldHash).Update("revoked", true)

		if res.Error != nil {
			return res.Error
		}

		if res.RowsAffected == 0 {
			return util.ErrInvalidRefreshToken
		}

		token := model.RefreshToken{
			UserID:    userID,
			TokenHash: newHash,
			ExpiresAt: expiresAt,
			Revoked:   false,
		}

		if err := tx.Create(&token).Error; err != nil {
			return err
		}

		return nil
	})
}
