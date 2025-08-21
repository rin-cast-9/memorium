package model

import "time"

type Folder struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	UserID      int       `gorm:"not null;index" json:"user_id"`
	User        User      `gorm:"foreignKey:UserID;references:ID" json:"-"`
	DisplayName string    `gorm:"not null" json:"display_name"`
	CreatedAt   time.Time `gorm:"default:now()" json:"created_at"`
}
