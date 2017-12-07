package crypto

import (
	"crypto/sha1"
	b64 "encoding/base64"
	"encoding/binary"
	"unicode/utf16"

	"golang.org/x/crypto/pbkdf2"
)

var (
	passwordSecurityIterations = 1000
	passwordSecurityKeylen     = 32
)

func convertUTF16ToLittleEndianBytes(s string) []byte {
	u := utf16.Encode([]rune(s))
	b := make([]byte, 2*len(u))
	for index, value := range u {
		binary.LittleEndian.PutUint16(b[index*2:], value)
	}
	return b
}

func HashPassword(pass, salt interface{}) string {
	var _pass, _salt []byte
	switch pass.(type) {
	case string:
		_pass = convertUTF16ToLittleEndianBytes(pass.(string))
	case []byte:
		_pass = pass.([]byte)
	}

	switch salt.(type) {
	case string:
		_salt = convertUTF16ToLittleEndianBytes(salt.(string))
	case []byte:
		_salt = salt.([]byte)
	}

	hashedPassword := pbkdf2.Key(_pass, _salt, passwordSecurityIterations, passwordSecurityKeylen, sha1.New)
	return b64.StdEncoding.EncodeToString(hashedPassword)
}
