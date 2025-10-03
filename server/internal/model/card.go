package model

import "time"

type Card struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	ModuleID  int       `gorm:"not null;index" json:"module_id"`
	Module    Module    `gorm:"foreignKey:ModuleID;references:ID" json:"-"`
	Front     string    `gorm:"not null" json:"front"`
	Back      string    `json:"back"`
	CreatedAt time.Time `gorm:"default:now()" json:"created_at"`
}
