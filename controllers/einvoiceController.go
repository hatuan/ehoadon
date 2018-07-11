package controllers

import (
	"bufio"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/models"
	"erpvietnam/ehoadon/settings"
	"erpvietnam/ehoadon/utils"
	"fmt"
	"os"
	"strconv"

	"net/http"
	"strings"
	"time"

	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	uuid "github.com/satori/go.uuid"
)

func API_eInvoices(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}}}, http.StatusBadRequest)
			return
		}

		infiniteScrollingInformation := models.InfiniteScrollingInformation{
			After:          r.URL.Query().Get("After"),
			FetchSize:      r.URL.Query().Get("FetchSize"),
			SortDirection:  r.URL.Query().Get("SortDirection"),
			SortExpression: r.URL.Query().Get("SortExpression")}

		einvoice, tranInfor := models.GetEInvoices(user.OrganizationID, r.URL.Query().Get("SearchNumberForm"), r.URL.Query().Get("SearchSymbol"), r.URL.Query().Get("SearchFromDate"), r.URL.Query().Get("SearchToDate"), r.URL.Query().Get("SearchCustomer"), r.URL.Query().Get("SearchCustomerVatNumber"), r.URL.Query().Get("SearchStatus"), infiniteScrollingInformation)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}, "NumberForms": []string{}, "Symbols": []string{}}}, http.StatusBadRequest)
			return
		}
		numberForms, tranInfor := models.GetEInvoiceNumberForms(user.OrganizationID)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}, "NumberForms": []string{}, "Symbols": []string{}}}, http.StatusBadRequest)
			return
		}
		symbols, tranInfor := models.GetEInvoiceSymbols(user.OrganizationID)
		if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}, "NumberForms": []string{}, "Symbols": []string{}}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, TotalRows: len(einvoice), Data: map[string]interface{}{"eInvoices": einvoice, "NumberForms": numberForms, "Symbols": symbols}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST":
		einvoice := models.EInvoice{}
		err := json.NewDecoder(r.Body).Decode(&einvoice)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": []models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		if einvoice.ID == nil {
			einvoice.RecCreatedByID = *user.ID
			einvoice.RecModifiedByID = *user.ID
			einvoice.RecCreated = &models.Timestamp{time.Now()}
			einvoice.RecModified = &models.Timestamp{time.Now()}
			einvoice.Version = 1
			einvoice.ClientID = user.ClientID
			einvoice.OrganizationID = user.OrganizationID
		} else {
			einvoice.RecModifiedByID = *user.ID
			einvoice.RecModified = &models.Timestamp{time.Now()}
		}

		for lineIndex := range einvoice.InvoiceLines {
			if einvoice.InvoiceLines[lineIndex].ID == nil {
				einvoice.InvoiceLines[lineIndex].Version = 1
				einvoice.InvoiceLines[lineIndex].RecCreatedByID = *user.ID
				einvoice.InvoiceLines[lineIndex].RecModifiedByID = *user.ID
				einvoice.InvoiceLines[lineIndex].RecCreated = &models.Timestamp{time.Now()}
				einvoice.InvoiceLines[lineIndex].RecModified = &models.Timestamp{time.Now()}
				einvoice.InvoiceLines[lineIndex].ClientID = user.ClientID
				einvoice.InvoiceLines[lineIndex].OrganizationID = user.OrganizationID
			} else {
				einvoice.InvoiceLines[lineIndex].RecModifiedByID = *user.ID
				einvoice.InvoiceLines[lineIndex].RecModified = &models.Timestamp{time.Now()}
			}
		}

		einvoice, tranInfor := models.PostEInvoice(einvoice)
		if tranInfor.ReturnStatus == false && len(tranInfor.ValidationErrors) > 0 {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, ValidationErrors: tranInfor.ValidationErrors, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": einvoice}}, http.StatusBadRequest)
			return
		} else if tranInfor.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfor.ReturnStatus, ReturnMessage: tranInfor.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": einvoice}}, http.StatusBadRequest)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: true, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": einvoice}}, http.StatusOK)

	case r.Method == "DELETE":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		ids := strings.Split(r.URL.Query().Get("ID"), ",")
		tranInfo := models.DeleteEInvoiceById(user.OrganizationID, ids)
		if tranInfo.ReturnStatus == false {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoice_Id(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "GET":
		ID, err := strconv.ParseInt(r.URL.Query().Get("ID"), 10, 64)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		getData, tranInfo := models.GetEInvoiceByID(ID)

		if !tranInfo.ReturnStatus && tranInfo.ReturnError == sql.ErrNoRows {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusNotFound)
			return
		} else if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusInternalServerError)
			return
		}

		var originalInvoice models.EInvoice
		if getData.OriginalInvoiceID != nil {
			originalInvoice, _ = models.GetEInvoiceByID(*getData.OriginalInvoiceID)
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData, "eInvoiceOriginal": originalInvoice}, IsAuthenticated: true}, http.StatusOK)
			return
		}

		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoice_InvoiceNo(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET":
		user, err := models.GetUser(*requestUser.ID)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoices": []models.EInvoice{}}}, http.StatusBadRequest)
			return
		}

		vars := mux.Vars(r)
		invoiceNo := vars["InvoiceNo"]
		symbol := r.URL.Query().Get("Symbol")
		numberForm := r.URL.Query().Get("NumberForm")

		if numberForm == "" || symbol == "" || invoiceNo == "" {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}

		getData, tranInfo := models.GetEInvoiceByNo(user.OrganizationID, numberForm, symbol, invoiceNo)
		if !tranInfo.ReturnStatus && tranInfo.ReturnError == sql.ErrNoRows {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusNotFound)
			return
		} else if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusInternalServerError)
			return
		}

		var originalInvoice models.EInvoice
		if getData.OriginalInvoiceID != nil {
			originalInvoice, _ = models.GetEInvoiceByID(*getData.OriginalInvoiceID)
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData, "eInvoiceOriginal": originalInvoice}, IsAuthenticated: true}, http.StatusOK)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData}, IsAuthenticated: true}, http.StatusOK)
	}
}

func API_eInvoice_Sign(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	requestUser := context.Get(r, "user").(models.User)

	switch {
	case r.Method == "GET": //get information for begin sign
		ID, err := strconv.ParseInt(r.URL.Query().Get("ID"), 10, 64)
		if err != nil {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{ErrIDParameterNotFound.Error()}, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		getData, tranInfo := models.GetEInvoiceByIDForSign(ID)
		if !tranInfo.ReturnStatus {
			JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, IsAuthenticated: true, Data: map[string]interface{}{"eInvoice": models.EInvoice{}}}, http.StatusBadRequest)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: tranInfo.ReturnStatus, ReturnMessage: tranInfo.ReturnMessage, Data: map[string]interface{}{"eInvoice": getData}, IsAuthenticated: true}, http.StatusOK)

	case r.Method == "POST": //post signed file
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

func API_eInvoice_Mail(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	switch {
	case r.Method == "POST":
		postData := models.EInvoice{}
		err := json.NewDecoder(r.Body).Decode(&postData)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		client := models.Client{}
		err = client.Get(postData.ClientID)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusBadRequest)
			return
		}

		mailInvoice := struct {
			models.EInvoice
			ClientDescription string
			ClientVatNumber   string
			ClientContactName string
			ClientMobile      string
		}{
			EInvoice: models.EInvoice{
				ID:                  postData.ID,
				CustomerContactName: postData.CustomerContactName,
				InvoiceDate:         postData.InvoiceDate,
				InvoiceNo:           postData.InvoiceNo,
				TotalPayment:        postData.TotalPayment,
				InvoiceFileID:       postData.InvoiceFileID,
			},
			ClientDescription: client.Description,
			ClientVatNumber:   client.VatNumber,
			ClientContactName: client.ContactName,
			ClientMobile:      client.Mobile,
		}
		mailSubject := fmt.Sprintf("Thông báo V/v gửi hóa đơn điện tử, số hóa đơn: %s - %s", postData.InvoiceNo, postData.InvoiceDate)
		mail := utils.NewMail(postData.CustomerContactEmail, mailSubject, "")

		invoiceFileName := fmt.Sprintf("%s%s.pdf", settings.Settings.InvoiceFilePath, postData.InvoiceFileID.UUID)
		err = mail.Attach(invoiceFileName)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusInternalServerError)
			return
		}

		logo := fmt.Sprintf("./static/assets/images/logo.png")
		_ = mail.Attach(logo)

		err = mail.ParseTemplate("./static/templates/mailInvoice.html", mailInvoice)
		if err != nil {
			log.Error(err.Error())
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusInternalServerError)
			return
		}
		ok, err := mail.SendEmail()
		if !ok {
			JSONResponse(w, models.Response{ReturnStatus: false, ReturnMessage: []string{err.Error()}, IsAuthenticated: true}, http.StatusInternalServerError)
			return
		}
		JSONResponse(w, models.Response{ReturnStatus: true, ReturnMessage: []string{"Mail sended successfully"}, IsAuthenticated: true}, http.StatusOK)
	}
}
