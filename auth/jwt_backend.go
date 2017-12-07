package auth

import (
	"bufio"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"erpvietnam/ehoadon/crypto"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"erpvietnam/ehoadon/settings"
	"os"
	"time"

	"encoding/json"

	jwt "github.com/dgrijalva/jwt-go"
)

type JWTAuthenticationBackend struct {
	privateKey *rsa.PrivateKey
	PublicKey  *rsa.PublicKey
}

const (
	tokenDuration = 72
	expireOffset  = 3600
)

var authBackendInstance *JWTAuthenticationBackend = nil

func InitJWTAuthenticationBackend() *JWTAuthenticationBackend {
	if authBackendInstance == nil {
		authBackendInstance = &JWTAuthenticationBackend{
			privateKey: getPrivateKey(),
			PublicKey:  getPublicKey(),
		}
	}

	return authBackendInstance
}

type MyCustomClaims struct {
	User string `json:"user"`
	*jwt.StandardClaims
}

func (backend *JWTAuthenticationBackend) GenerateToken(userName string) (string, error) {
	user, err := models.GetUserByUsername(userName)
	if err != nil && err != models.ErrUsernameTaken {
		log.Error(err)
		return "", err
	}

	userClaim := models.UserClaim{
		ID:             *user.ID,
		Name:           user.Name,
		Comment:        user.Comment,
		FullName:       user.FullName,
		ClientID:       user.ClientID,
		OrganizationID: user.OrganizationID,
	}

	userClaimJSON, _ := json.Marshal(userClaim)

	claims := &MyCustomClaims{
		string(userClaimJSON),
		&jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * time.Duration(settings.Settings.JWTExpirationDelta)).Unix(),
			IssuedAt:  time.Now().Unix(),
			Subject:   userName,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS512, claims)

	tokenString, err := token.SignedString(backend.privateKey)
	if err != nil {
		log.Error(err)
		return "", err
	}
	return tokenString, nil
}

func (backend *JWTAuthenticationBackend) Authenticate(userName, password string) bool {
	user, err := models.GetUserByUsername(userName)
	if err != nil && err != models.ErrUsernameTaken {
		log.Error(err)
		return false
	}
	hashPassword := crypto.HashPassword(password, user.Salt)
	if hashPassword == user.Password {
		return true
	}
	return false
}

func (backend *JWTAuthenticationBackend) getTokenRemainingValidity(timestamp interface{}) int {
	if validity, ok := timestamp.(float64); ok {
		tm := time.Unix(int64(validity), 0)
		remainer := tm.Sub(time.Now())
		if remainer > 0 {
			return int(remainer.Seconds() + expireOffset)
		}
	}
	return expireOffset
}

func getPrivateKey() *rsa.PrivateKey {
	privateKeyFile, err := os.Open(settings.Settings.PrivateKeyPath)
	if err != nil {
		panic(err)
	}

	pemfileinfo, _ := privateKeyFile.Stat()
	var size int64 = pemfileinfo.Size()
	pembytes := make([]byte, size)

	buffer := bufio.NewReader(privateKeyFile)
	_, err = buffer.Read(pembytes)

	data, _ := pem.Decode([]byte(pembytes))

	privateKeyFile.Close()

	privateKeyImported, err := x509.ParsePKCS1PrivateKey(data.Bytes)

	if err != nil {
		panic(err)
	}

	return privateKeyImported
}

func getPublicKey() *rsa.PublicKey {
	publicKeyFile, err := os.Open(settings.Settings.PublicKeyPath)
	if err != nil {
		panic(err)
	}

	pemfileinfo, _ := publicKeyFile.Stat()
	var size int64 = pemfileinfo.Size()
	pembytes := make([]byte, size)

	buffer := bufio.NewReader(publicKeyFile)
	_, err = buffer.Read(pembytes)

	data, _ := pem.Decode([]byte(pembytes))

	publicKeyFile.Close()

	publicKeyImported, err := x509.ParsePKIXPublicKey(data.Bytes)

	if err != nil {
		panic(err)
	}

	rsaPub, ok := publicKeyImported.(*rsa.PublicKey)

	if !ok {
		panic(err)
	}

	return rsaPub
}
