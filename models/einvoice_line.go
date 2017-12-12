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
	"github.com/shopspring/decimal"
)

type EInvoiceLine struct {
	ID                *int64          `db:"id" json:",string"`
	InvoiceID         *int64          `db:"invoice_id" json:",string"`
	ItemID            *int64          `db:"item_id" json:",string"`
	ItemCode          string          `db:"item_code"`
	UomID             *int64          `db:"uom_id" json:",string"`
	UomCode           string          `db:"uom_code"`
	Description       string          `db:"description"`
	Quantity          decimal.Decimal `db:"quantity"`
	UnitPrice         decimal.Decimal `db:"unit_price"`
	Amount            decimal.Decimal `db:"amount"`
	Vat               int8            `db:"vat"`
	AmountVat         decimal.Decimal `db:"amount_vat"`
	Discount          int8            `db:"discount"`
	AmountDiscount    decimal.Decimal `db:"amount_discount"`
	AmountPayment     decimal.Decimal `db:"amount_payment"`
	RecCreatedByID    int64           `db:"rec_created_by" json:",string"`
	RecCreatedByUser  string          `db:"rec_created_by_user"`
	RecCreated        *Timestamp      `db:"rec_created_at"`
	RecModifiedByID   int64           `db:"rec_modified_by" json:",string"`
	RecModifiedByUser string          `db:"rec_modified_by_user"`
	RecModified       *Timestamp      `db:"rec_modified_at"`
	Status            int8            `db:"status"`
	Version           int16           `db:"version"`
	ClientID          int64           `db:"client_id" json:",string"`
	OrganizationID    int64           `db:"organization_id" json:",string"`
	Organization      string          `db:"organization"`
}

// ErrEInvoiceLineNotFound indicates there was no EInvoiceLine
var ErrEInvoiceLineNotFound = errors.New("EInvoiceLine not found")

// ErrEInvoiceLineDescriptionNotSpecified indicates there was no name given by the user
var ErrEInvoiceLineDescriptionNotSpecified = errors.New("EInvoiceLine's description not specified")

// ErrEInvoiceLineCodeNotSpecified indicates there was no code given by the user
var ErrEInvoiceLineCodeNotSpecified = errors.New("EInvoiceLine's code not specified")

// ErrEInvoiceLineCodeDuplicate indicates there was duplicate of code given by the user
var ErrEInvoiceLineCodeDuplicate = errors.New("EInvoiceLine's code is duplicate")

// ErrEInvoiceLineFatal indicates there was fatal error
var ErrEInvoiceLineFatal = errors.New("EInvoiceLine has fatal error")

// ErrEInvoiceLineValidate indicates there was validate error
var ErrEInvoiceLineValidate = errors.New("EInvoiceLine has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoiceLine) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.Description == "" {
		validationErrors["Description"] = append(validationErrors["Description"], ErrEInvoiceLineDescriptionNotSpecified.Error())
	}
	return validationErrors
}

func GetEInvoiceLines(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoiceLine, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_invoice_line.*, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.name as organization, " +
		" COALESCE(ehd_invoice_line_uom.code, '') as item_uom_code, " +
		" COALESCE(ehd_invoice_line_group.code, '') as item_group_code " +
		" FROM ehd_invoice_line " +
		" INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_invoice_line.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_invoice_line.organization_id = organization.id " +
		" LEFT JOIN ehd_invoice_line_group as ehd_invoice_line_group ON ehd_invoice_line.item_group_id = ehd_invoice_line_group.id " +
		" LEFT JOIN ehd_invoice_line_uom as ehd_invoice_line_uom ON ehd_invoice_line.item_uom_id = ehd_invoice_line_uom.id "

	sqlWhere := " WHERE ehd_invoice_line.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_invoice_line."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_invoice_line."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_invoice_line."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_invoice_line."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	getDatas := []EInvoiceLine{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoiceLine(postData EInvoiceLine) (EInvoiceLine, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceLineValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_invoice_line(code," +
			"description, " +
			"item_group_id, " +
			"item_uom_id, " +
			"vat, " +
			"discount, " +
			"unit_price, " +
			"quantity, " +
			"rec_created_by," +
			"rec_created_at," +
			"rec_modified_by," +
			"rec_modified_at," +
			"status," +
			"version," +
			"client_id," +
			"organization_id)" +
			" VALUES (:code, " +
			":description, " +
			":item_group_id, " +
			":item_uom_id, " +
			":vat, " +
			":discount, " +
			":unit_price, " +
			":quantity, " +
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
			return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_invoice_line SET " +
			" code			= :code," +
			" description	= :description," +
			" item_group_id	= :item_group_id, " +
			" item_uom_id	= :item_uom_id, " +
			" vat			= :vat, " +
			" discount		= :discount, " +
			" unit_price	= :unit_price, " +
			" quantity		= :quantity, " +
			" status		= :status," +
			" version		= :version + 1," +
			" rec_modified_by	= :rec_modified_by, " +
			" rec_modified_at	= :rec_modified_at " +
			" WHERE id = :id AND version = :version")

		result, err := stmt.Exec(postData)
		if err != nil {
			log.Error(err)
			return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceLineNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceLineByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceLineByID returns the EInvoiceLine that the given id corresponds to. If no EInvoiceLine is found, an
// error is thrown.
func GetEInvoiceLineByID(id int64) (EInvoiceLine, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoiceLine{}
	err = db.Get(&getData, "SELECT ehd_invoice_line.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.name as organization, "+
		" COALESCE(ehd_invoice_line_uom.code, '') as item_uom_code, "+
		" COALESCE(ehd_invoice_line_group.code, '') as item_group_code "+
		"	FROM ehd_invoice_line "+
		"		INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_invoice_line.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_invoice_line.organization_id = organization.id "+
		"		LEFT JOIN ehd_invoice_line_group as ehd_invoice_line_group ON ehd_invoice_line.item_group_id = ehd_invoice_line_group.id "+
		"		LEFT JOIN ehd_invoice_line_uom as ehd_invoice_line_uom ON ehd_invoice_line.item_uom_id = ehd_invoice_line_uom.id "+
		"	WHERE ehd_invoice_line.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceLineNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceLineByCode returns the EInvoiceLine that the given id corresponds to.
// If no EInvoiceLine is found, an error is thrown.
func GetEInvoiceLineByCode(code string, orgID int64) (EInvoiceLine, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoiceLine{}
	err = db.Get(&getData, "SELECT ehd_invoice_line.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.name as organization, "+
		" COALESCE(ehd_invoice_line_uom.code, '') as item_uom_code, "+
		" COALESCE(ehd_invoice_line_group.code, '') as item_group_code "+
		"	FROM ehd_invoice_line "+
		"		INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_invoice_line.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_invoice_line.organization_id = organization.id "+
		"		LEFT JOIN ehd_invoice_line_group as ehd_invoice_line_group ON ehd_invoice_line.item_group_id = ehd_invoice_line_group.id "+
		"		LEFT JOIN ehd_invoice_line_uom as ehd_invoice_line_uom ON ehd_invoice_line.item_uom_id = ehd_invoice_line_uom.id "+
		"	WHERE ehd_invoice_line.code=$1 and ehd_invoice_line.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceLineNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceLineById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_invoice_line "+
		" WHERE ehd_invoice_line.id IN (?) and ehd_invoice_line.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceLineNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
