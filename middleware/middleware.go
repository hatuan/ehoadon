package middleware

import (
	"erpvietnam/ehoadon/auth"
	"fmt"
	"net/http"

	"encoding/json"
	"erpvietnam/ehoadon/models"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/dgrijalva/jwt-go/request"
	ctx "github.com/gorilla/context"
)

type Context struct {
}

func NewContext() *Context {
	return &Context{}
}

func (c *Context) ServeHTTP(rw http.ResponseWriter, req *http.Request, next http.HandlerFunc) {
	next(rw, req)
	// Remove context contents
	ctx.Clear(req)
}

func RequireTokenAuthentication(rw http.ResponseWriter, req *http.Request, next http.HandlerFunc) {
	authBackend := auth.InitJWTAuthenticationBackend()

	token, err := request.ParseFromRequestWithClaims(req, request.AuthorizationHeaderExtractor, &auth.MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return authBackend.PublicKey, nil
	})

	if err == nil && token.Valid {
		userClaim := models.User{}
		userClaimBytes := []byte(token.Claims.(*auth.MyCustomClaims).User)
		json.Unmarshal(userClaimBytes, &userClaim)

		user, err := models.GetUser(*userClaim.ID)
		if err != nil {
			response := []byte("{\"ReturnMessage\":\"" + err.Error() + "\"}\"")
			rw.Header().Set("Content-Type", "application/json")
			rw.WriteHeader(http.StatusUnauthorized)
			rw.Write(response)
		}
		ctx.Set(req, "user", user)

		next(rw, req)
	} else {
		transactionalInformation := new(models.TransactionalInformation)
		transactionalInformation.IsAuthenticated = false
		transactionalInformation.ReturnStatus = false
		transactionalInformation.ReturnMessage = []string{"Auth failed"}

		response, err := json.Marshal(transactionalInformation)
		if err != nil {
			response = []byte("{\"ReturnMessage\":\"" + err.Error() + "\"}\"")
		}

		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusUnauthorized)
		rw.Write(response)
	}
}
