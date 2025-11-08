package util

type FinishTestRequest struct {
	Answers []Answer `json:"answers" binding:"required"`
}

type Answer struct {
	QuestionID   int    `json:"question_id" binding:"required"`
	AnsweredText string `json:"answered_text" binding:"required"`
}

type ReviewResult struct {
	CardID         int `json:"card_id" binding:"required"`
	CorrectCount   int `json:"correct_count" binding:"required"`
	IncorrectCount int `json:"incorrect_count" binding:"required"`
}
