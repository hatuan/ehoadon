package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"

	"github.com/jmoiron/sqlx"
)

type EInvoiceClient struct {
	ID                 *int64     `db:"id" json:",string"`
	TokenSerialNumber  string     `db:"token_serial_number"`
	TokenIssuerName    string     `db:"token_issuer_name"`
	TokenCertValidFrom *Timestamp `db:"token_cert_valid_from"`
	TokenCertValidTo   *Timestamp `db:"token_cert_valid_to"`
	TokenCertContent   string     `db:"token_cert_content"`
	ClientID           int64      `db:"client_id" json:",string"`
}

// ErrEInvoiceClientNotFound indicates there was no EInvoiceClient
var ErrEInvoiceClientNotFound = errors.New("EInvoiceClient not found")

// ErrEInvoiceClientSerialNumberDuplicate indicates there was duplicate of code given by the user
var ErrEInvoiceClientSerialNumberDuplicate = errors.New("EInvoiceClient's Serial Number is duplicate")

// ErrEInvoiceClientFatal indicates there was fatal error
var ErrEInvoiceClientFatal = errors.New("EInvoiceClient has fatal error")

// ErrEInvoiceClientValidate indicates there was validate error
var ErrEInvoiceClientValidate = errors.New("EInvoiceClient has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceClient) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.TokenSerialNumber != "" {
		db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
		if err != nil {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceClientFatal.Error())
		}
		defer db.Close()
		var otherID string
		ID := int64(0)
		if c.ID != nil {
			ID = *c.ID
		}
		err = db.Get(&otherID, "SELECT id FROM ehd_client WHERE token_serial_number = $1 AND id != $2", c.TokenSerialNumber, ID)
		if err != nil && err != sql.ErrNoRows {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceClientFatal.Error())
		}
		if otherID != "" && err != sql.ErrNoRows {
			validationErrors["TokenSerialNumber"] = append(validationErrors["TokenSerialNumber"], ErrEInvoiceClientSerialNumberDuplicate.Error())
		}
	}
	return validationErrors
}

func PostEInvoiceClient(postData EInvoiceClient) (EInvoiceClient, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceClientValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_client(" +
			" token_serial_number, " +
			" token_issuer_name, " +
			" token_cert_valid_from, " +
			" token_cert_valid_to, " +
			" token_cert_content, " +
			" client_id) " +
			" VALUES ( " +
			" :token_serial_number, " +
			" :token_issuer_name, " +
			" :token_cert_valid_from, " +
			" :token_cert_valid_to, " +
			" :token_cert_content, " +
			" :client_id) RETURNING id ")
		id := int64(0)
		err := stmt.Get(&id, postData)
		if err != nil {
			log.Error(err)
			return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_client SET " +
			" token_serial_number = :token_serial_number, " +
			" token_issuer_name = :token_issuer_name, " +
			" token_cert_valid_from = :token_cert_valid_from, " +
			" token_cert_valid_to = :token_cert_valid_to, " +
			" token_cert_content = :token_cert_content WHERE id = :id")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceClientNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceClientByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceClientByID returns the EInvoiceClient that the given id corresponds to. If no EInvoiceClient is found, an error is thrown.
func GetEInvoiceClientByID(id int64) (EInvoiceClient, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceClient{}
	err = db.Get(&getData, "SELECT ehd_client.* "+
		"	FROM ehd_client "+
		"	WHERE ehd_client.id = $1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceClientNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceClientByClientID returns the EInvoiceClient that the given id corresponds to. If no EInvoiceClient is found, an error is thrown.
func GetEInvoiceClientByClientID(clientID int64) (EInvoiceClient, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceClient{}
	err = db.Get(&getData, "SELECT ehd_client.* "+
		"	FROM ehd_client "+
		"	WHERE ehd_client.client_id = $1", clientID)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}} //neu khong thay ehd_client tuong ung voi chua khai bao
	} else if err != nil {
		log.Error(err)
		return EInvoiceClient{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
