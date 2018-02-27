package utils

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net"
	"net/mail"
	"net/smtp"
	"path/filepath"
	"strings"
)

var auth smtp.Auth

var servername string = "smtp.zoho.com:465"
var serverpass string = "1boV2KgU"

func encodeRFC2047(String string) string {
	// use mail's rfc2047 to encode any string
	addr := mail.Address{String, ""}
	return strings.Trim(addr.String(), " <>")
}

type Mail struct {
	from    string
	to      string
	subject string
	body    string
}

func NewMail(to string, subject, body string) *Mail {
	return &Mail{
		from:    "thongbao@ehoadon.com.vn",
		to:      to,
		subject: subject,
		body:    body,
	}
}

func (r *Mail) SendEmail() (bool, error) {
	from := mail.Address{"", r.from}
	to := mail.Address{"", r.to}
	// Setup headers
	headers := make(map[string]string)
	headers["From"] = from.String()
	headers["To"] = to.String()
	headers["Subject"] = encodeRFC2047(r.subject)
	headers["MIME-version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"utf-8\""

	// Setup message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + r.body

	host, _, _ := net.SplitHostPort(servername)

	auth = smtp.PlainAuth("", r.from, serverpass, host)

	// TLS config
	tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         host,
	}

	// Here is the key, you need to call tls.Dial instead of smtp.Dial
	// for smtp servers running on 465 that require an ssl connection
	// from the very beginning (no starttls)
	conn, err := tls.Dial("tcp", servername, tlsconfig)
	if err != nil {
		return false, err
	}

	c, err := smtp.NewClient(conn, host)
	if err != nil {
		return false, err
	}

	// Auth
	if err = c.Auth(auth); err != nil {
		return false, err
	}

	// To && From
	if err = c.Mail(from.Address); err != nil {
		return false, err
	}

	if err = c.Rcpt(to.Address); err != nil {
		return false, err
	}

	// Data
	w, err := c.Data()
	if err != nil {
		return false, err
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		return false, err
	}

	err = w.Close()
	if err != nil {
		return false, err
	}

	err = c.Quit()
	if err != nil {
		return false, err
	}
	return true, nil
}

func (r *Mail) ParseTemplate(templateFileName string, data interface{}) error {
	funcMap := template.FuncMap{
		"ToLower": strings.ToLower,
	}
	file := filepath.Base(templateFileName)
	t, err := template.New(file).Funcs(funcMap).ParseFiles(templateFileName)
	if err != nil {
		return err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, data); err != nil {
		return err
	}
	r.body = buf.String()
	return nil
}
