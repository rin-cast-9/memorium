package util

type AppError struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	Internal error  `json:"-"`
	IsPublic bool
}

func (e *AppError) Error() string {
	return e.Message
}

func NewPublicError(code, message string) *AppError {
	return &AppError{
		Code:     code,
		Message:  message,
		IsPublic: true,
	}
}

func NewInternalError(code string, err error) *AppError {
	return &AppError{
		Code:     code,
		Internal: err,
		IsPublic: false,
	}
}

const (
	ErrCodeUserExists            = "USER_EXISTS"
	ErrCodeFullNameEmpty         = "FULL_NAME_EMPTY"
	ErrCodeFullNameTooShort      = "FULL_NAME_TOO_SHORT"
	ErrCodeFullNameTooLong       = "FULL_NAME_TOO_LONG"
	ErrCodeFullNameInvalidChars  = "FULL_NAME_INVALID_CHARACTERS"
	ErrCodeInvalidCredentials    = "INVALID_CREDENTIALS"
	ErrCodePasswordHashingFailed = "PASSWORD_HASHING_FAILED"
	ErrCodeTokenGenerationFailed = "TOKEN_GENERATION_FAILED"
	ErrCodeUserCreationFailed    = "USER_CREATION_FAILED"
	ErrCodeInternalServerError   = "INTERNAL_SERVER_ERROR"
	ErrCodeInvalidRequest        = "INVALID_REQUEST"
)
