package model

import "time"

type Test struct {
	ID             int        `gorm:"primaryKey" json:"id"`
	UserID         int        `gorm:"not null;index" json:"user_id"`
	User           User       `gorm:"foreignKey:UserID;references:ID" json:"-"`
	ModuleID       int        `gorm:"not null;index" json:"module_id"`
	Module         Module     `gorm:"foreignKey:ModuleID;references:ID" json:"-"`
	IsReviewOnly   bool       `json:"is_review_only"`
	StartedAt      time.Time  `gorm:"default:now()" json:"started_at"`
	FinishedAt     *time.Time `json:"finished_at"`
	CorrectAnswers int        `gorm:"default:0" json:"correct_answers"`
	TotalQuestions int        `gorm:"default:0" json:"total_questions"`
}
