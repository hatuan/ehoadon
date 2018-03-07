package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/jmoiron/sqlx"
)

type EInvoiceFormType struct {
	ID                *int64     `db:"id" json:",string"`
	InvoiceType       string     `db:"invoice_type"` //01GTKT : Hoa don GTGT, 02GTTT : Hoa don ban hang, 03XNKNB : Xuat kho noi bo , 04HGDL : Hang gui dai ly , 07KPTQ : Khu phi thue quan
	NumberForm        string     `db:"number_form"`  //01GTKT0/000
	InvoiceForm       string     `db:"invoice_form"` //E
	Symbol            string     `db:"symbol"`       //EY/17E
	FormFileName      string     `db:"form_file_name"`
	FormFile          string     `db:"form_file"`
	FormVars          string     `db:"form_vars"`
	RecCreatedByID    int64      `db:"rec_created_by" json:",string"`
	RecCreatedByUser  string     `db:"rec_created_by_user"`
	RecCreated        *Timestamp `db:"rec_created_at"`
	RecModifiedByID   int64      `db:"rec_modified_by" json:",string"`
	RecModifiedByUser string     `db:"rec_modified_by_user"`
	RecModified       *Timestamp `db:"rec_modified_at"`
	Status            int8       `db:"status"`
	Version           int16      `db:"version"`
	ClientID          int64      `db:"client_id" json:",string"`
	OrganizationID    int64      `db:"organization_id" json:",string"`
	Organization      string     `db:"organization"`
}

// ErrEInvoiceFormTypeNotFound indicates there was no EInvoiceFormType
var ErrEInvoiceFormTypeNotFound = errors.New("EInvoiceFormType not found")

// ErrEInvoiceTypeNotSpecified indicates there was no FormType given by the user
var ErrEInvoiceTypeNotSpecified = errors.New("EInvoice 's FormType not specified")

// ErrEInvoiceNumberFormNotSpecified indicates there was no NumberForm given by the user
var ErrEInvoiceNumberFormNotSpecified = errors.New("EInvoice's NumberForm not specified")

// ErrEInvoiceFormNotSpecified indicates there was no InvoiceForm given by the user
var ErrEInvoiceFormNotSpecified = errors.New("EInvoice's InvoiceForm not specified")

// ErrEInvoiceSymbolNotSpecified indicates there was no Symbol given by the user
var ErrEInvoiceSymbolNotSpecified = errors.New("EInvoice's Symbol not specified")

// ErrEInvoiceNumberFormDuplicate indicates there was duplicate of NumberForm given by the user
var ErrEInvoiceNumberFormDuplicate = errors.New("EInvoiceFormType's NumberForm is duplicate")

// ErrEInvoiceFormTypeFatal indicates there was fatal error
var ErrEInvoiceFormTypeFatal = errors.New("EInvoiceFormType has fatal error")

// ErrEInvoiceFormTypeValidate indicates there was validate error
var ErrEInvoiceFormTypeValidate = errors.New("EInvoiceFormType has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceFormType) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.InvoiceType == "" {
		validationErrors["InvoiceType"] = append(validationErrors["InvoiceType"], ErrEInvoiceTypeNotSpecified.Error())
	}
	if c.NumberForm == "" {
		validationErrors["NumberForm"] = append(validationErrors["NumberForm"], ErrEInvoiceNumberFormNotSpecified.Error())
	}
	if c.InvoiceForm == "" {
		validationErrors["InvoiceForm"] = append(validationErrors["InvoiceForm"], ErrEInvoiceFormNotSpecified.Error())
	}
	if c.Symbol == "" {
		validationErrors["Symbol"] = append(validationErrors["Symbol"], ErrEInvoiceSymbolNotSpecified.Error())
	}

	if c.NumberForm != "" {
		db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
		if err != nil {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceFormTypeFatal.Error())
		}
		defer db.Close()
		var otherID string
		ID := int64(0)
		if c.ID != nil {
			ID = *c.ID
		}
		err = db.Get(&otherID, "SELECT id FROM ehd_form_type WHERE number_form = $1 AND id != $2 AND client_id = $3", c.NumberForm, ID, c.ClientID)
		if err != nil && err != sql.ErrNoRows {
			log.Error(err)
			validationErrors["Fatal"] = append(validationErrors["Fatal"], ErrEInvoiceFormTypeFatal.Error())
		}
		if otherID != "" && err != sql.ErrNoRows {
			validationErrors["NumberForm"] = append(validationErrors["NumberForm"], ErrEInvoiceNumberFormDuplicate.Error())
		}
	}
	return validationErrors
}

func GetEInvoiceFormTypes(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoiceFormType, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_form_type.*, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.description as organization " +
		" FROM ehd_form_type " +
		" INNER JOIN user_profile as user_created ON ehd_form_type.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_form_type.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_form_type.organization_id = organization.id "

	sqlWhere := " WHERE ehd_form_type.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_form_type."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_form_type."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_form_type."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_form_type."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.WithFields(log.Fields{"sql": map[string]interface{}{"string": sqlString, "$1": orgID}}).Debug("GetEInvoiceFormTypes")

	getDatas := []EInvoiceFormType{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoiceFormType(postData EInvoiceFormType) (EInvoiceFormType, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormTypeValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_form_type(invoice_type," +
			"number_form, " +
			"invoice_form, " +
			"symbol, " +
			"form_file_name, " +
			"form_file, " +
			"form_vars, " +
			"rec_created_by," +
			"rec_created_at," +
			"rec_modified_by," +
			"rec_modified_at," +
			"status," +
			"version," +
			"client_id," +
			"organization_id)" +
			" VALUES (:invoice_type, " +
			":number_form, " +
			":invoice_form, " +
			":symbol, " +
			":form_file_name, " +
			":form_file, " +
			":form_vars, " +
			":rec_created_by," +
			":rec_created_at," +
			":rec_modified_by," +
			":rec_modified_at," +
			":status," +
			":version," +
			":client_id," +
			":organization_id) RETURNING id")
		id := int64(0)
		err := stmt.Get(&id, postData)
		if err != nil {
			log.Error(err)
			return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_form_type SET " +
			" invoice_type	= :invoice_type," +
			" number_form	= :number_form," +
			" invoice_form	= :invoice_form, " +
			" symbol		= :symbol, " +
			" form_file_name	= :form_file_name, " +
			" form_file		= :form_file, " +
			" form_vars		= :form_vars, " +
			" status		= :status," +
			" version		= :version + 1," +
			" rec_modified_by	= :rec_modified_by, " +
			" rec_modified_at	= :rec_modified_at " +
			" WHERE id = :id AND version = :version")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormTypeNotFound.Error()}}
		}
	}

	postData, _ = GetEInvoiceFormTypeByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceFormTypeByID returns the EInvoiceFormType that the given id corresponds to. If no EInvoiceFormType is found, an
// error is thrown.
func GetEInvoiceFormTypeByID(id int64) (EInvoiceFormType, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceFormType{}
	err = db.Get(&getData, "SELECT ehd_form_type.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.description as organization "+
		"	FROM ehd_form_type "+
		"		INNER JOIN user_profile as user_created ON ehd_form_type.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_form_type.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_form_type.organization_id = organization.id "+
		"	WHERE ehd_form_type.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormTypeNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceFormTypeByCode returns the EInvoiceFormType that the given id corresponds to.
// If no EInvoiceFormType is found, an error is thrown.
func GetEInvoiceFormTypeByCode(code string, orgID int64) (EInvoiceFormType, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoiceFormType{}
	err = db.Get(&getData, "SELECT ehd_form_type.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.description as organization "+
		"	FROM ehd_form_type "+
		"		INNER JOIN user_profile as user_created ON ehd_form_type.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_form_type.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_form_type.organization_id = organization.id "+
		"	WHERE ehd_form_type.code=$1 and ehd_form_type.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormTypeNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceFormType{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceFormTypeById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_form_type "+
		" WHERE ehd_form_type.id IN (?) and ehd_form_type.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormTypeNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func GetEInvoiceNumberForms(orgID int64) ([]string, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []string{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT DISTINCT ehd_form_type.number_form " +
		" FROM ehd_form_type " +
		" WHERE ehd_form_type.organization_id = $1 " +
		" ORDER BY ehd_form_type.number_form "

	getDatas := []string{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func GetEInvoiceSymbols(orgID int64) ([]string, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []string{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT DISTINCT ehd_form_type.symbol " +
		" FROM ehd_form_type " +
		" WHERE ehd_form_type.organization_id = $1 " +
		" ORDER BY ehd_form_type.symbol"

	getDatas := []string{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}
