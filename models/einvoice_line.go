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
	LineNo            int64           `db:"line_no" json:",string"`
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
		" ehd_item.code as item_code, " +
		" ehd_item_uom.code as uom_code, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.description as organization, " +
		" FROM ehd_invoice_line " +
		" INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_invoice_line.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_invoice_line.organization_id = organization.id " +
		" INNER JOIN ehd_item as ehd_item ON ehd_invoice_line.item_id = ehd_item.id " +
		" INNER JOIN ehd_item_uom as ehd_item_uom ON ehd_invoice_line.uom_id = ehd_item_uom.id "

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

func PostEInvoiceLines(headerID int64, postDatas []EInvoiceLine) ([]EInvoiceLine, TransactionalInformation) {
	validationErrors := make(map[string]InterfaceArray)
	_ids := []int64{}

	for key, einvoiceLine := range postDatas {
		if lineValidateErrs := einvoiceLine.Validate(); len(lineValidateErrs) != 0 {
			validationErrors["EInvoiceLine"+strconv.Itoa(key)] = append(validationErrors["EInvoiceLine"+strconv.Itoa(key)], lineValidateErrs)
		}
	}
	if len(validationErrors) != 0 {
		return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceLineValidate.Error()}, ValidationErrors: validationErrors}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()
	tx := db.MustBegin()

	for _, postData := range postDatas {
		stmt, _ := tx.PrepareNamed("INSERT INTO ehd_invoice_line AS invoice_line(invoice_id," +
			" line_no, " +
			" item_id, " +
			" uom_id, " +
			" description," +
			" quantity, " +
			" unit_price, " +
			" amount, " +
			" vat, " +
			" amount_vat, " +
			" discount, " +
			" amount_discount, " +
			" amount_payment, " +
			" rec_created_by," +
			" rec_created_at," +
			" rec_modified_by," +
			" rec_modified_at," +
			" status," +
			" version," +
			" client_id," +
			" organization_id)" +
			" VALUES (:invoice_id," +
			" :line_no, " +
			" :item_id, " +
			" :uom_id, " +
			" :description," +
			" :quantity, " +
			" :unit_price, " +
			" :amount, " +
			" :vat, " +
			" :amount_vat, " +
			" :discount, " +
			" :amount_discount, " +
			" :amount_payment, " +
			" :rec_created_by," +
			" :rec_created_at," +
			" :rec_modified_by," +
			" :rec_modified_at," +
			" :status," +
			" :version," +
			" :client_id," +
			" :organization_id) " +
			"ON CONFLICT ON CONSTRAINT pk_ehd_invoice_line DO UPDATE SET " +
			" invoice_id	=	EXCLUDED.invoice_id, " +
			" line_no	=	EXCLUDED.line_no, " +
			" item_id	=	EXCLUDED.item_id, " +
			" uom_id	=	EXCLUDED.uom_id, " +
			" description	=	EXCLUDED.description," +
			" quantity	=	EXCLUDED.quantity, " +
			" unit_price	=	EXCLUDED.unit_price, " +
			" amount	=	EXCLUDED.amount, " +
			" vat	=	EXCLUDED.vat, " +
			" amount_vat	=	EXCLUDED.amount_vat, " +
			" discount	=	EXCLUDED.discount, " +
			" amount_discount	=	EXCLUDED.amount_discount, " +
			" amount_payment	=	EXCLUDED.amount_payment, " +
			" rec_modified_by	=	EXCLUDED.rec_modified_by," +
			" rec_modified_at	=	EXCLUDED.rec_modified_at," +
			" status	=	EXCLUDED.status," +
			" version	=	:version + 1" +
			" WHERE invoice_line.version = :version RETURNING id")

		var id int64
		err := stmt.Get(&id, postData)

		if err != nil {
			tx.Rollback()
			return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}

		_ids = append(_ids, id)
	}
	if len(_ids) == 0 { //neu xoa het line thi phai gan gia tri mac dinh cho _ids => xoa het trong bang line
		_ids = append(_ids, 0)
	}

	query, args, err := sqlx.In("DELETE FROM ehd_invoice_line WHERE invoice_id = ? AND id NOT IN (?)", headerID, _ids)
	if err != nil {
		tx.Rollback()
		return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	query = sqlx.Rebind(sqlx.DOLLAR, query)
	_, err = tx.Exec(query, args...)
	if err != nil {
		tx.Rollback()
		return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	tx.Commit()

	postDatas, _ = GetEInvoiceLinesByHeaderID(headerID)
	return postDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

func GetEInvoiceLinesByHeaderID(headerID int64) ([]EInvoiceLine, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoiceLine{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_invoice_line.*, " +
		" ehd_item.code as item_code, " +
		" ehd_item_uom.code as uom_code, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.description as organization " +
		" FROM ehd_invoice_line " +
		" INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_invoice_line.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_invoice_line.organization_id = organization.id " +
		" INNER JOIN ehd_item as ehd_item ON ehd_invoice_line.item_id = ehd_item.id " +
		" INNER JOIN ehd_item_uom as ehd_item_uom ON ehd_invoice_line.uom_id = ehd_item_uom.id " +
		" INNER JOIN ehd_invoice as ehd_invoice ON ehd_invoice_line.invoice_id = ehd_invoice.id " +
		" WHERE ehd_invoice.id = $1 " +
		" ORDER BY ehd_invoice_line.line_no"

	getDatas := []EInvoiceLine{}
	err = db.Select(&getDatas, sqlString, headerID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
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
		" ehd_item.code as item_code, "+
		" ehd_item_uom.code as uom_code, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.description as organization, "+
		"	FROM ehd_invoice_line "+
		"		INNER JOIN user_profile as user_created ON ehd_invoice_line.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_invoice_line.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_invoice_line.organization_id = organization.id "+
		"		INNER JOIN ehd_item as ehd_item ON ehd_invoice_line.item_id = ehd_item.id "+
		"		INNER JOIN ehd_item_uom as ehd_item_uom ON ehd_invoice_line.uom_id = ehd_item_uom.id "+
		"	WHERE ehd_invoice_line.id=$1", id)
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
