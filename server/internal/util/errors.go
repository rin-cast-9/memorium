package util

import (
	"errors"
)

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

var (
	ErrInvalidFullName              = errors.New("invalid full name")
	ErrFullNameEmpty                = errors.New("full name is empty")
	ErrFullNameTooLong              = errors.New("full name is too long")
	ErrFullNameTooShort             = errors.New("full name is too short")
	ErrFullNameInvalidChars         = errors.New("full name contains invalid characters")
	ErrNotFound                     = errors.New("data not found")
	ErrUserExists                   = errors.New("user already exists")
	ErrPasswordHashingFailed        = errors.New("password hashing failed")
	ErrUserCreationFailed           = errors.New("user creation failed")
	ErrInvalidCredentials           = errors.New("invalid credentials")
	ErrRefreshTokenGenerationFailed = errors.New("refresh token generation failed")
	ErrAccessTokenGenerationFailed  = errors.New("access token generation failed")
	ErrInvalidRefreshToken          = errors.New("invalid refresh token")
)

const (
	ErrCodeUserExists                        = "USER_EXISTS"
	ErrCodeInvalidFullName                   = "INVALID_FULL_NAME"
	ErrCodeFullNameEmpty                     = "FULL_NAME_EMPTY"
	ErrCodeFullNameTooShort                  = "FULL_NAME_TOO_SHORT"
	ErrCodeFullNameTooLong                   = "FULL_NAME_TOO_LONG"
	ErrCodeFullNameInvalidCharacters         = "FULL_NAME_INVALID_CHARACTERS"
	ErrCodeInvalidCredentials                = "INVALID_CREDENTIALS"
	ErrCodePasswordHashingFailed             = "PASSWORD_HASHING_FAILED"
	ErrCodeTokenGenerationFailed             = "TOKEN_GENERATION_FAILED"
	ErrCodeRefreshTokenGenerationFailed      = "REFRESH_TOKEN_GENERATION_FAILED"
	ErrCodeUserCreationFailed                = "USER_CREATION_FAILED"
	ErrCodeInternalServerError               = "INTERNAL_SERVER_ERROR"
	ErrCodeInvalidRequest                    = "INVALID_REQUEST"
	ErrCodeFolderDisplayNameEmpty            = "FOLDER_DISPLAY_NAME_EMPTY"
	ErrCodeFolderCreationFailed              = "FOLDER_CREATION_FAILED"
	ErrCodeFolderDeletionFailed              = "FOLDER_DELETION_FAILED"
	ErrCodeNotFound                          = "NOT_FOUND"
	ErrCodeFolderRenameFailed                = "FOLDER_RENAME_FAILED"
	ErrCodeFolderGetFailed                   = "FOLDER_GET_FAILED"
	ErrCodeFolderListFailed                  = "FOLDER_LIST_FAILED"
	ErrCodeModulesByFolderListFailed         = "MODULES_BY_FOLDER_LIST_FAILED"
	ErrCodeModuleDisplayNameEmpty            = "MODULE_DISPLAY_NAME_EMPTY"
	ErrCodeModuleCreationFailed              = "MODULE_CREATION_FAILED"
	ErrCodeModuleDeletionFailed              = "MODULE_DELETION_FAILED"
	ErrCodeModuleRenameFailed                = "MODULE_RENAME_FAILED"
	ErrCodeModuleGetFailed                   = "MODULE_GET_FAILED"
	ErrCodeModuleCheckFailed                 = "MODULE_CHECK_FAILED"
	ErrCodeFolderToModuleAssociationFailed   = "FOLDER_TO_MODULE_ASSOCIATION_FAILED"
	ErrCodeFolderFromModuleAssociationFailed = "FOLDER_FROM_MODULE_ASSOCIATION_FAILED"
	ErrCodeModuleListFailed                  = "MODULE_LIST_FAILED"
	ErrCodeFoldersByModuleListFailed         = "FOLDER_BY_MODUlES_LIST_FAILED"
	ErrCodeModuleToFolderAssociationFailed   = "MODULE_TO_FOLDER_ASSOCIATION_FAILED"
	ErrCodeModuleFromFolderAssociationFailed = "MODULE_FROM_FOLDER_ASSOCIATION_FAIlED"
	ErrCodeCardFrontEmpty                    = "CARD_FRONT_EMPTY"
	ErrCodeUnauthorized                      = "UNAUTHORIZED_ERR"
	ErrCodeCardCreationFailed                = "CARD_CREATION_FAILED"
	ErrCodeCardFetchFailed                   = "CARD_FETCH_FAILED"
	ErrCodeCardDeletionFailed                = "CARD_DELETION_FAILED"
	ErrCodeCardUpdateFailed                  = "CARD_UPDATE_FAILED"
	ErrCodeProgressRetrievalFailed           = "PROGRESS_RETRIEVAL_FAILED"
	ErrCodeDBTransactionFailed               = "DB_TRANSACTION_FAILED"
	ErrCodeDBError                           = "DB_ERROR"
	ErrCodeDBWriteFailed                     = "DB_WRITE_FAILED"
	ErrCodeProgressUpdateFailed              = "PROGRESS_UPDATE_FAILED"
	ErrCodeProgressCreationFailed            = "PROGRESS_CREATION_FAILED"
	ErrCodeTestCreationFailed                = "TEST_CREATION_FAILED"
	ErrCodeTestUpdateFailed                  = "TEST_UPDATE_FAILED"
	ErrCodeTestRetrievalFailed               = "TEST_RETRIEVAL_FAILED"
	ErrCodeTestDeletionFailed                = "TEST_DELETION_FAILED"
	ErrCodeForbidden                         = "FORBIDDEN"
	ErrCodeMissingRefreshToken               = "MISSING_REFRESH_TOKEN"
	ErrCodeRevokedRefreshToken               = "REVOKED_REFRESH_TOKEN"
	ErrCodeExpiredRefreshToken               = "EXPIRED_REFRESH_TOKEN"
	ErrCodeInvalidRefreshToken               = "INVALID_REFRESH_TOKEN"
	ErrCodeRefreshTokenRevokationFailed      = "REFRESH_TOKEN_REVOKATION_FAILED"
)
