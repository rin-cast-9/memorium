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
	ErrCodeUserExists                        = "USER_EXISTS"
	ErrCodeFullNameEmpty                     = "FULL_NAME_EMPTY"
	ErrCodeFullNameTooShort                  = "FULL_NAME_TOO_SHORT"
	ErrCodeFullNameTooLong                   = "FULL_NAME_TOO_LONG"
	ErrCodeFullNameInvalidChars              = "FULL_NAME_INVALID_CHARACTERS"
	ErrCodeInvalidCredentials                = "INVALID_CREDENTIALS"
	ErrCodePasswordHashingFailed             = "PASSWORD_HASHING_FAILED"
	ErrCodeTokenGenerationFailed             = "TOKEN_GENERATION_FAILED"
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
	ErrCodeFolderToModuleAssociationFailed   = "FOLDER_TO_MODULE_ASSOCIATION_FAILED"
	ErrCodeFolderFromModuleAssociationFailed = "FOLDER_FROM_MODULE_ASSOCIATION_FAILED"
	ErrCodeModuleListFailed                  = "MODULE_LIST_FAILED"
	ErrCodeFoldersByModuleListFailed         = "FOLDER_BY_MODUlES_LIST_FAILED"
	ErrCodeModuleToFolderAssociationFailed   = "MODULE_TO_FOLDER_ASSOCIATION_FAILED"
	ErrCodeModuleFromFolderAssociationFailed = "MODULE_FROM_FOLDER_ASSOCIATION_FAIlED"
)
