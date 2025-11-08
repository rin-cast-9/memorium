package model

import "time"

type Question struct {
	ID             int          `gorm:"primaryKey" json:"id"`
	TestID         int          `gorm:"not null;index" json:"test_id"`
	Test           Test         `gorm:"foreignKey:TestID;references:ID" json:"-"`
	CardID         int          `gorm:"not null;index" json:"card_id"`
	Card           Card         `gorm:"foreignKey:CardID;references:ID" json:"-"`
	QuestionTypeID int          `gorm:"column:question_type;not null;index" json:"question_type_id"`
	QuestionType   QuestionType `gorm:"foreignKey:QuestionTypeID;references:ID" json:"question_type"`
	IsCorrect      *bool        `json:"is_correct"`
	AnsweredAt     *time.Time   `json:"answered_at"`
}

type QuestionType struct {
	ID          int    `gorm:"primaryKey" json:"id"`
	DisplayName string `gorm:"not null" json:"display_name"`
}
