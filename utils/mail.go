package utils

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"erpvietnam/ehoadon/log"
	"fmt"
	"html/template"
	"io/ioutil"
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
	from        string
	to          string
	subject     string
	body        string
	attachments map[string][]byte
}

func NewMail(to string, subject, body string) *Mail {
	return &Mail{
		from:        "thongbao@ehoadon.com.vn",
		to:          to,
		subject:     subject,
		body:        body,
		attachments: make(map[string][]byte),
	}
}

func (r *Mail) Attach(file string) error {
	b, err := ioutil.ReadFile(file)
	if err != nil {
		return err
	}

	_, fileName := filepath.Split(file)
	r.attachments[fileName] = b
	return nil
}

func (r *Mail) SendEmail() (bool, error) {
	from := mail.Address{"", r.from}
	to := mail.Address{"", r.to}

	boundary := "nJFjO1FDYkRtmXgWoEKE8SqLLCO25S8JAEsQdAkilJssqAfLWwPDPJn5An2P"
	message := bytes.NewBuffer(nil)
	message.WriteString("From: " + from.String() + "\r\n")
	message.WriteString("To: " + to.String() + "\r\n")
	message.WriteString("Subject: " + encodeRFC2047(r.subject) + "\r\n")
	message.WriteString("MIME-Version: 1.0\r\n")
	if len(r.attachments) > 0 {
		message.WriteString("Content-Type: multipart/mixed; boundary=" + boundary + "\r\n")
		message.WriteString("\r\n--" + boundary + "\r\n")
	}
	message.WriteString("Content-Type: text/html; charset=\"utf-8\"\r\n")
	message.WriteString(r.body)
	if len(r.attachments) > 0 {
		for k, v := range r.attachments {
			message.WriteString("\r\n--" + boundary + "\r\n")
			message.WriteString("Content-Type: application/octet-stream\r\n")
			message.WriteString("Content-Transfer-Encoding: base64\r\n")
			message.WriteString("Content-Disposition: attachment; filename=\"" + k + "\"\r\n\r\n")

			b := make([]byte, base64.StdEncoding.EncodedLen(len(v)))
			base64.StdEncoding.Encode(b, v)
			message.Write(b)
			message.WriteString("\r\n--" + boundary)
		}
		message.WriteString("--")
	}

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

	_, err = w.Write(message.Bytes())
	if err != nil {
		log.Error(fmt.Sprintf("%s", message.Bytes()))
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
