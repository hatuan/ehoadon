package auth

import (
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"errors"
	"net/http"
)

// ErrLoginInvalid is thrown when a user attempts to register a username that is taken.
var ErrLoginInvalid = errors.New("Login invalid.")

// TokenLogin attempts to login the user given a request.
func TokenLogin(requestLogin *models.LoginDTO) (int, models.Token) {
	authBackend := InitJWTAuthenticationBackend()

	if authBackend.Authenticate(requestLogin.UserName, requestLogin.Password) {
		token, err := authBackend.GenerateToken(requestLogin.UserName)
		if err != nil {
			log.Error(err)
			token := models.Token{
				TransactionalInformation: models.TransactionalInformation{ReturnMessage: []string{err.Error()}, ReturnStatus: false},
				Token: "",
			}
			return http.StatusInternalServerError, token
		}
		response := models.Token{
			TransactionalInformation: models.TransactionalInformation{ReturnStatus: true, IsAuthenticated: true},
			Token: token,
		}
		return http.StatusOK, response
	}

	return http.StatusUnauthorized, models.Token{
		TransactionalInformation: models.TransactionalInformation{ReturnMessage: []string{ErrLoginInvalid.Error()}, ReturnStatus: false},
		Token: "",
	}
}

//TokenRefresh get new JWT Token
func TokenRefresh(username string) (int, models.Token) {
	authBackend := InitJWTAuthenticationBackend()
	token, err := authBackend.GenerateToken(username)
	if err != nil {
		log.Error(err)
		return http.StatusInternalServerError, models.Token{
			TransactionalInformation: models.TransactionalInformation{ReturnMessage: []string{err.Error()}, ReturnStatus: false},
			Token: "",
		}
	}
	response := models.Token{
		TransactionalInformation: models.TransactionalInformation{ReturnStatus: true},
		Token: token,
	}
	return http.StatusOK, response
}
