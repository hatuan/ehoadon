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

type EInvoice struct {
	ID                       *int64          `db:"id" json:",string"`
	FormReleaseID            int64           `db:"form_release_id" json:",string"`
	OriginalInvoiceID        *int64          `db:"original_invoice_id" json:",string"`
	CreatedDate              *Timestamp      `db:"created_date"`
	InvoiceDate              *Timestamp      `db:"invoice_date"`
	InvoiceNo                string          `db:"invoice_no"`
	PayType                  string          `db:"pay_type"`
	CurrencyID               int64           `db:"currency_id" json:",string"`
	ExchangeRateAmount       decimal.Decimal `db:"exchange_rate_amount"`
	RelationalExchRateAmount decimal.Decimal `db:"relational_exch_rate_amount"`
	CustomerID               *int64          `db:"customer_id"`
	CustomerVatNumber        string          `db:"customer_vat_number"`
	CustomerName             string          `db:"customer_name"`
	CustomerAddress          string          `db:"customer_address"`
	CustomerContactName      string          `db:"customer_contact_name"`
	CustomerBankAccount      string          `db:"customer_bank_account"`
	CustomerBankName         string          `db:"customer_bank_name"`
	ProcessInvoiceStatus     int8            `db:"process_invoice_status"`
	ProcessAdjustedForm      int8            `db:"process_adjusted_form"`
	ProcessAdjustedType      int8            `db:"process_adjusted_type"`
	TotalAmount              decimal.Decimal `db:"total_amount"`
	TotalAmountNoVat         decimal.Decimal `db:"total_amount_no_vat"`
	TotalAmountVat0          decimal.Decimal `db:"total_amount_vat0"`
	TotalAmountVat5          decimal.Decimal `db:"total_amount_vat5"`
	TotalAmountVat10         decimal.Decimal `db:"total_amount_vat10"`
	TotalDiscount            decimal.Decimal `db:"total_discount"`
	TotalVat5                decimal.Decimal `db:"total_vat5"`
	TotalVat10               decimal.Decimal `db:"total_vat10"`
	TotalVat                 decimal.Decimal `db:"total_vat"`
	TotalOther               decimal.Decimal `db:"total_other"`
	TotalPayment             decimal.Decimal `db:"total_payment"`
	TotalPaymentWords        decimal.Decimal `db:"total_payment_words"`
	RecCreatedByID           int64           `db:"rec_created_by" json:",string"`
	RecCreatedByUser         string          `db:"rec_created_by_user"`
	RecCreated               *Timestamp      `db:"rec_created_at"`
	RecModifiedByID          int64           `db:"rec_modified_by" json:",string"`
	RecModifiedByUser        string          `db:"rec_modified_by_user"`
	RecModified              *Timestamp      `db:"rec_modified_at"`
	Status                   int8            `db:"status"`
	Version                  int16           `db:"version"`
	ClientID                 int64           `db:"client_id" json:",string"`
	OrganizationID           int64           `db:"organization_id" json:",string"`
	Organization             string          `db:"organization"`
}

// ErrEInvoiceNotFound indicates there was no EInvoice
var ErrEInvoiceNotFound = errors.New("EInvoice not found")

// ErrEInvoiceCustomerAddressNotSpecified indicates there was no name given by the user
var ErrEInvoiceCustomerAddressNotSpecified = errors.New("EInvoice's Customer Address Not Specified")

// ErrEInvoiceCustomerNameNotSpecified indicates there was no Customer Name given by the user
var ErrEInvoiceCustomerNameNotSpecified = errors.New("EInvoice's Customer Name Not Specified")

// ErrEInvoiceFatal indicates there was fatal error
var ErrEInvoiceFatal = errors.New("EInvoice has fatal error")

// ErrEInvoiceValidate indicates there was validate error
var ErrEInvoiceValidate = errors.New("EInvoice has validate error")

// Validate checks to make sure there are no invalid fields in a submitted
func (c *EInvoice) Validate() map[string]InterfaceArray {
	validationErrors := make(map[string]InterfaceArray)

	if c.CustomerName == "" {
		validationErrors["CustomerName"] = append(validationErrors["CustomerName"], ErrEInvoiceCustomerNameNotSpecified.Error())
	}
	if c.CustomerAddress == "" {
		validationErrors["CustomerAddress"] = append(validationErrors["CustomerAddress"], ErrEInvoiceCustomerAddressNotSpecified.Error())
	}
	return validationErrors
}

func GetEInvoices(orgID int64, searchCondition string, infiniteScrollingInformation InfiniteScrollingInformation) ([]EInvoice, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT ehd_invoice.*, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.name as organization, " +
		" COALESCE(ehd_invoice_uom.code, '') as item_uom_code, " +
		" COALESCE(ehd_invoice_group.code, '') as item_group_code " +
		" FROM ehd_invoice " +
		" INNER JOIN user_profile as user_created ON ehd_invoice.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_created ON ehd_invoice.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_invoice.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_invoice.organization_id = organization.id " +
		" LEFT JOIN ehd_invoice_group as ehd_invoice_group ON ehd_invoice.item_group_id = ehd_invoice_group.id " +
		" LEFT JOIN ehd_invoice_uom as ehd_invoice_uom ON ehd_invoice.item_uom_id = ehd_invoice_uom.id "

	sqlWhere := " WHERE ehd_invoice.organization_id = $1"
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	var sqlOrder string
	if len(infiniteScrollingInformation.SortDirection) == 0 || infiniteScrollingInformation.SortDirection == "ASC" {
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortExpression) > 0 {
		///	sqlWhere += fmt.Sprintf(" AND %s > $2", "ehd_invoice."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s ASC", "ehd_invoice."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	} else { //sort DESC
		//if len(infiniteScrollingInformation.After) >= 0 && len(infiniteScrollingInformation.SortDirection) > 0 {
		//	sqlWhere += fmt.Sprintf(" AND %s < $2", "ehd_invoice."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		//}
		if len(infiniteScrollingInformation.SortExpression) > 0 {
			sqlOrder = fmt.Sprintf(" ORDER BY %s DESC", "ehd_invoice."+strings.ToLower(infiniteScrollingInformation.SortExpression))
		}
	}
	sqlLimit := ""
	if len(infiniteScrollingInformation.FetchSize) > 0 {
		sqlLimit += fmt.Sprintf(" LIMIT %s ", infiniteScrollingInformation.FetchSize)
	}
	sqlString += sqlWhere + sqlOrder + sqlLimit
	log.Debug(sqlString)

	getDatas := []EInvoice{}
	err = db.Select(&getDatas, sqlString, orgID)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

func PostEInvoice(postData EInvoice) (EInvoice, TransactionalInformation) {
	if validateErrs := postData.Validate(); len(validateErrs) != 0 {
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceValidate.Error()}, ValidationErrors: validateErrs}
	}

	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	if postData.ID == nil {
		postData.Version = 1
		stmt, _ := db.PrepareNamed("INSERT INTO ehd_invoice(code," +
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
			return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		postData.ID = &id
	} else {
		stmt, _ := db.PrepareNamed("UPDATE ehd_invoice SET " +
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
			return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		changes, err := result.RowsAffected()
		if err != nil {
			log.Error(err)
			return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		if changes == 0 {
			return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceNotFound.Error()}}
		}
	}
	postData, _ = GetEInvoiceByID(*postData.ID)
	return postData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Updated/Created successfully"}}
}

// GetEInvoiceByID returns the EInvoice that the given id corresponds to. If no EInvoice is found, an
// error is thrown.
func GetEInvoiceByID(id int64) (EInvoice, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := EInvoice{}
	err = db.Get(&getData, "SELECT ehd_invoice.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.name as organization, "+
		" COALESCE(ehd_invoice_uom.code, '') as item_uom_code, "+
		" COALESCE(ehd_invoice_group.code, '') as item_group_code "+
		"	FROM ehd_invoice "+
		"		INNER JOIN user_profile as user_created ON ehd_invoice.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_invoice.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_invoice.organization_id = organization.id "+
		"		LEFT JOIN ehd_invoice_group as ehd_invoice_group ON ehd_invoice.item_group_id = ehd_invoice_group.id "+
		"		LEFT JOIN ehd_invoice_uom as ehd_invoice_uom ON ehd_invoice.item_uom_id = ehd_invoice_uom.id "+
		"	WHERE ehd_invoice.id=$1", id)
	if err != nil && err == sql.ErrNoRows {
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

// GetEInvoiceByCode returns the EInvoice that the given id corresponds to.
// If no EInvoice is found, an error is thrown.
func GetEInvoiceByCode(code string, orgID int64) (EInvoice, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	org, _ := GetOrganizationByID(orgID)

	getData := EInvoice{}
	err = db.Get(&getData, "SELECT ehd_invoice.*, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.name as organization, "+
		" COALESCE(ehd_invoice_uom.code, '') as item_uom_code, "+
		" COALESCE(ehd_invoice_group.code, '') as item_group_code "+
		"	FROM ehd_invoice "+
		"		INNER JOIN user_profile as user_created ON ehd_invoice.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_invoice.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_invoice.organization_id = organization.id "+
		"		LEFT JOIN ehd_invoice_group as ehd_invoice_group ON ehd_invoice.item_group_id = ehd_invoice_group.id "+
		"		LEFT JOIN ehd_invoice_uom as ehd_invoice_uom ON ehd_invoice.item_uom_id = ehd_invoice_uom.id "+
		"	WHERE ehd_invoice.code=$1 and ehd_invoice.client_id=$2", code, org.ClientID)

	if err != nil && err == sql.ErrNoRows {
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_invoice "+
		" WHERE ehd_invoice.id IN (?) and ehd_invoice.organization_id=?", ids, orgID)

	query = sqlx.Rebind(sqlx.DOLLAR, query)

	_, err = db.Exec(query, args...)

	if err != nil && err == sql.ErrNoRows {
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
