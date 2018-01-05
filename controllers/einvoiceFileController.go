package controllers

import (
	"bufio"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"time"

	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"erpvietnam/ehoadon/settings"

	"net/http"

	"github.com/gorilla/context"
	uuid "github.com/satori/go.uuid"
)

// ErrEInvoiceFileCreateFail indicates there was error when create pdf from Base64
var ErrEInvoiceFileCreateFail = errors.New("EInvoiceFile create failed")

func API_eInvoiceFiles(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "POST":
		type PostData struct {
			InvoiceID    *int64 `json:",string"`
			PDFBase64    string
			PDFBase64MD5 string
			Status       int8  `json:",string"`
			Version      int16 `json:",string"`
		}
		postData := PostData{}
		err := json.NewDecoder(r.Body).Decode(&postData)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		uuidFileName, err := uuid.NewV4()
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		dec, err := base64.StdEncoding.DecodeString(postData.PDFBase64)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		invoiceFileName := fmt.Sprintf("%s%s.pdf", settings.Settings.InvoiceFilePath, uuidFileName)

		f, err := os.Create(invoiceFileName)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		defer f.Close()

		if _, err := f.Write(dec); err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		if err := f.Sync(); err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		//check md5 of new pdf's base64
		newPDFFile, err := os.Open(invoiceFileName)

		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		defer newPDFFile.Close()

		// create a new buffer base on file size
		fInfo, _ := newPDFFile.Stat()
		sizePDF := fInfo.Size()
		buf := make([]byte, sizePDF)

		// read file content into buffer
		fReader := bufio.NewReader(newPDFFile)
		fReader.Read(buf)

		// convert the buffer bytes to base64 string - use buf.Bytes() for new image
		newPDFBase64 := base64.StdEncoding.EncodeToString(buf)

		if postData.PDFBase64 != newPDFBase64 {
			log.Error("%s : wrong base64 old %s - new %s", invoiceFileName, postData.PDFBase64, newPDFBase64)
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFileCreateFail.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		invoiceFile := models.EInvoiceFile{
			ID:            postData.InvoiceID,
			InvoiceFileID: uuidFileName.String(),
			SignedByID:    requestUser.ID,
			SignedDate:    &models.Timestamp{time.Now()},
			Status:        postData.Status,
			Version:       postData.Version,
		}

		getData, tranInfo := models.PostEInvoiceFile(invoiceFile)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}
