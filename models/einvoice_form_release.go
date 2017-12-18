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

type EInvoiceFormRelease struct {
	ID                   *int64     `db:"id" json:",string"`
	FormTypeID           *int64     `db:"form_type_id" json:",string"`
	FormTypeInvoiceType  string     `db:"form_type_invoice_type"`
	FormTypeNumberForm   string     `db:"form_type_number_form"`
	FormTypeInvoiceForm  string     `db:"form_type_invoice_form"`
	FormTypeSymbol       string     `db:"form_type_symbol"`
	ReleaseTotal         *int32     `db:"release_total" json:",string"`
	ReleaseFrom          *int32     `db:"release_from" json:",string"`
	ReleaseTo            *int32     `db:"release_to" json:",string"`
	ReleaseUsed          *int32     `db:"release_used" json:",string"`
	ReleaseDate          *Timestamp `db:"release_date"`
	StartDate            *Timestamp `db:"start_date"`
	TaxAuthoritiesStatus int8       `db:"tax_authorities_status"`
	RecCreatedByID       int64      `db:"rec_created_by" json:",string"`
	RecCreatedByUser     string     `db:"rec_created_by_user"`
	RecCreated           *Timestamp `db:"rec_created_at"`
	RecModifiedByID      int64      `db:"rec_modified_by" json:",string"`
	RecModifiedByUser    string     `db:"rec_modified_by_user"`
	RecModified          *Timestamp `db:"rec_modified_at"`
	Status               int8       `db:"status"`
	Version              int16      `db:"version"`
	ClientID             int64      `db:"client_id" json:",string"`
	OrganizationID       int64      `db:"organization_id" json:",string"`
	Organization         string     `db:"organization"`
}

// ErrEInvoiceFormReleaseNotFound indicates there was no EInvoiceFormRelease
var ErrEInvoiceFormReleaseNotFound = errors.New("EInvoiceFormRelease not found")

// ErrEInvoiceFormReleaseFormTypeNotSpecified indicates there was no FormType given by the user
var ErrEInvoiceFormReleaseFormTypeNotSpecified = errors.New("EInvoiceFormRelease 's FormType not specified")

// ErrEInvoicFormReleaseReleaseTotalNotSpecified indicates there was no ReleaseTotal given by the user
var ErrEInvoicFormReleaseReleaseTotalNotSpecified = errors.New("EInvoice's ReleaseTotal not specified")

// ErrEInvoiceFormReleaseReleaseFromNotSpecified indicates there was no ReleaseFrom given by the user
var ErrEInvoiceFormReleaseReleaseFromNotSpecified = errors.New("EInvoice's ReleaseFrom not specified")

// ErrEInvoiceFormReleaseReleaseToNotSpecified indicates there was no ReleaseTo given by the user
var ErrEInvoiceFormReleaseReleaseToNotSpecified = errors.New("EInvoice's ReleaseTo not specified")

// ErrEInvoiceFormReleaseReleaseDateNotSpecified indicates there was no ReleaseDate given by the user
var ErrEInvoiceFormReleaseReleaseDateNotSpecified = errors.New("EInvoice's ReleaseDate not specified")

// ErrEInvoiceFormReleaseStartDateNotSpecified indicates there was no StartDate given by the user
var ErrEInvoiceFormReleaseStartDateNotSpecified = errors.New("EInvoice's StartDate not specified")

// ErrEInvoiceFormReleaseFatal indicates there was fatal error
var ErrEInvoiceFormReleaseFatal = errors.New("EInvoiceFormRelease has fatal error")

// ErrEInvoiceFormReleaseValidate indicates there was validate error
var ErrEInvoiceFormReleaseValidate = errors.New("EInvoiceFormRelease has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceFormRelease) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.FormTypeID == nil {
		validationErrors["FormTypeID"] = append(validationErrors["FormTypeID"], ErrEInvoiceFormReleaseFormTypeNotSpecified.Error())
	}
	if c.ReleaseTotal == nil {
		validationErrors["ReleaseTotal"] = append(validationErrors["ReleaseTotal"], ErrEInvoicFormReleaseReleaseTotalNotSpecified.Error())
	}
	if c.ReleaseFrom == nil {
		validationErrors["ReleaseFrom"] = append(validationErrors["NumberForm"], ErrEInvoiceFormReleaseReleaseFromNotSpecified.Error())
	}
	if c.ReleaseTo == nil {
		validationErrors["ReleaseTo"] = append(validationErrors["ReleaseTo"], ErrEInvoiceFormReleaseReleaseToNotSpecified.Error())
	}
	if c.ReleaseDate == nil {
		validationErrors["ReleaseDate"] = append(validationErrors["ReleaseDate"], ErrEInvoiceFormReleaseReleaseDateNotSpecified.Error())
	}
	if c.StartDate == nil {
		validationErrors["StartDate"] = append(validationErrors["StartDate"], ErrEInvoiceFormReleaseStartDateNotSpecified.Error())
	}
	return validationErrors
}

func GetEInvoiceFormReleases(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoiceFormRelease, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_form_release.*, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.name as organization " +
		" FROM ehd_form_release " +
		" INNER JOIN user_profile as user_created ON ehd_form_release.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_created ON ehd_form_release.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_form_release.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_form_release.organization_id = organization.id "

	sqlWhere := " WHERE ehd_form_release.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_form_release."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_form_release."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_form_release."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_form_release."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	getDatas := []EInvoiceFormRelease{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoiceFormRelease(postData EInvoiceFormRelease) (EInvoiceFormRelease, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormReleaseValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_form_release(form_type_id," +
			"release_total, " +
			"release_from, " +
			"release_to, " +
			"release_used, " +
			"release_date, " +
			"start_date," +
			"tax_authorities_status," +
			"rec_created_by," +
			"rec_created_at," +
			"rec_modified_by," +
			"rec_modified_at," +
			"status," +
			"version," +
			"client_id," +
			"organization_id)" +
			" VALUES (:form_type_id," +
			":release_total, " +
			":release_from, " +
			":release_to, " +
			":release_used, " +
			":release_date, " +
			":start_date," +
			":tax_authorities_status," +
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
			return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_form_release SET " +
			" form_type_id = :form_type_id, " +
			" release_total = :release_total, " +
			" release_from = :release_from, " +
			" release_to = :release_to, " +
			" release_used = :release_used, " +
			" release_date = :release_date, " +
			" start_date = :start_date, " +
			" tax_authorities_status = :tax_authorities_status, " +
			" status		= :status, " +
			" version		= :version + 1, " +
			" rec_modified_by	= :rec_modified_by, " +
			" rec_modified_at	= :rec_modified_at " +
			" WHERE id = :id AND version = :version")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormReleaseNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceFormReleaseByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceFormReleaseByID returns the EInvoiceFormRelease that the given id corresponds to. If no EInvoiceFormRelease is found, an
// error is thrown.
func GetEInvoiceFormReleaseByID(id int64) (EInvoiceFormRelease, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceFormRelease{}
	err = db.Get(&getData, "SELECT ehd_form_release.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.name as organization "+
		"	FROM ehd_form_release "+
		"		INNER JOIN user_profile as user_created ON ehd_form_release.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_form_release.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_form_release.organization_id = organization.id "+
		"	WHERE ehd_form_release.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormReleaseNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceFormReleaseByCode returns the EInvoiceFormRelease that the given id corresponds to.
// If no EInvoiceFormRelease is found, an error is thrown.
func GetEInvoiceFormReleaseByCode(code string, orgID int64) (EInvoiceFormRelease, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoiceFormRelease{}
	err = db.Get(&getData, "SELECT ehd_form_release.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.name as organization "+
		"	FROM ehd_form_release "+
		"		INNER JOIN user_profile as user_created ON ehd_form_release.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_form_release.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_form_release.organization_id = organization.id "+
		"	WHERE ehd_form_release.code=$1 and ehd_form_release.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormReleaseNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceFormRelease{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceFormReleaseById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_form_release "+
		" WHERE ehd_form_release.id IN (?) and ehd_form_release.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceFormReleaseNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}