package model

import "time"

type UserCardProgress struct {
	ID             int        `gorm:"primaryKey" json:"id"`
	UserID         int        `gorm:"not null;index" json:"user_id"`
	User           User       `gorm:"foreignKey:UserID;references:ID" json:"-"`
	CardID         int        `gorm:"not null;index" json:"card_id"`
	Card           Card       `gorm:"foreignKey:CardID;references:ID" json:"-"`
	CorrectCount   int        `gorm:"not null;default:0" json:"correct_count"`
	IncorrectCount int        `gorm:"not null;default:0" json:"incorrect_count"`
	LastSeenAt     *time.Time `json:"last_seen_at"`
}
