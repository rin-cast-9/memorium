package util

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	return string(hashedBytes), err
}

func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
