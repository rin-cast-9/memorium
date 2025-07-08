package model

import "time"

type User struct {
	ID           int       `gorm:"primaryKey"`
	Email        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"default:now()"`
}
