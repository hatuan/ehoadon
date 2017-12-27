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
	InvoiceDate              *Timestamp      `db:"invoice_date"`
	InvoiceNo                string          `db:"invoice_no"`
	PayType                  string          `db:"pay_type"`
	CurrencyID               *int64          `db:"currency_id" json:",string"`
	ExchangeRateAmount       decimal.Decimal `db:"exchange_rate_amount"`
	RelationalExchRateAmount decimal.Decimal `db:"relational_exch_rate_amount"`
	CustomerID               *int64          `db:"customer_id" json:",string"`
	CustomerCode             string          `db:"customer_code"`
	CustomerVatNumber        string          `db:"customer_vat_number"`
	CustomerName             string          `db:"customer_name"`
	CustomerAddress          string          `db:"customer_address"`
	CustomerContactName      string          `db:"customer_contact_name"`
	CustomerContactMobile    string          `db:"customer_contact_mobile"`
	CustomerContactEmail     string          `db:"customer_contact_email"`
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
	InvoiceLines             []EInvoiceLine  `db:"-"`
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

	for key, line := range c.InvoiceLines {
		if lineValidateErrs := line.Validate(); len(lineValidateErrs) != 0 {
			validationErrors["InvoiceLine"+strconv.Itoa(key)] = append(validationErrors["InvoiceLine"+strconv.Itoa(key)], lineValidateErrs)
		}
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
		" ehd_customer.code as customer_code, " +
		" user_created.name as rec_created_by_user, " +
		" user_modified.name as rec_modified_by_user, " +
		" organization.description as organization " +
		" FROM ehd_invoice " +
		" INNER JOIN user_profile as user_created ON ehd_invoice.rec_created_by = user_created.id " +
		" INNER JOIN user_profile as user_modified ON ehd_invoice.rec_modified_by = user_modified.id " +
		" INNER JOIN organization as organization ON ehd_invoice.organization_id = organization.id " +
		" INNER JOIN ehd_customer as ehd_customer ON ehd_invoice.customer_id = ehd_customer.id "

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
	tx := db.MustBegin()

	stmt, _ := tx.PrepareNamed("INSERT INTO ehd_invoice as invoice(id, " +
		" form_release_id, " +
		" original_invoice_id, " +
		" invoice_date, " +
		" invoice_no, " +
		" pay_type, " +
		" currency_id, " +
		" exchange_rate_amount, " +
		" customer_id, " +
		" customer_vat_number, " +
		" customer_name, " +
		" customer_address, " +
		" customer_contact_name, " +
		" customer_contact_mobile, " +
		" customer_contact_email, " +
		" customer_bank_account, " +
		" customer_bank_name, " +
		" process_invoice_status, " +
		" process_adjusted_form, " +
		" process_adjusted_type, " +
		" total_amount, " +
		" total_amount_no_vat, " +
		" total_amount_vat0, " +
		" total_amount_vat5, " +
		" total_amount_vat10, " +
		" total_discount, " +
		" total_vat5, " +
		" total_vat10, " +
		" total_vat, " +
		" total_other, " +
		" total_payment, " +
		" total_payment_words, " +
		" rec_created_by, " +
		" rec_created_at, " +
		" rec_modified_by, " +
		" rec_modified_at, " +
		" status, " +
		" version, " +
		" client_id, " +
		" organization_id) " +
		" VALUES ( COALESCE(:id, id_generator()), " +
		" :form_release_id, " +
		" :original_invoice_id, " +
		" :invoice_date, " +
		" :invoice_no, " +
		" :pay_type, " +
		" :currency_id, " +
		" :exchange_rate_amount, " +
		" :customer_id, " +
		" :customer_vat_number, " +
		" :customer_name, " +
		" :customer_address, " +
		" :customer_contact_name, " +
		" :customer_contact_mobile, " +
		" :customer_contact_email, " +
		" :customer_bank_account, " +
		" :customer_bank_name, " +
		" :process_invoice_status, " +
		" :process_adjusted_form, " +
		" :process_adjusted_type, " +
		" :total_amount, " +
		" :total_amount_no_vat, " +
		" :total_amount_vat0, " +
		" :total_amount_vat5, " +
		" :total_amount_vat10, " +
		" :total_discount, " +
		" :total_vat5, " +
		" :total_vat10, " +
		" :total_vat, " +
		" :total_other, " +
		" :total_payment, " +
		" :total_payment_words, " +
		" :rec_created_by, " +
		" :rec_created_at, " +
		" :rec_modified_by, " +
		" :rec_modified_at, " +
		" :status, " +
		" :version, " +
		" :client_id, " +
		" :organization_id) " +
		" ON CONFLICT ON CONSTRAINT pk_ehd_invoice DO UPDATE SET " +
		" form_release_id		= EXCLUDED.form_release_id," +
		" original_invoice_id	= EXCLUDED.original_invoice_id, " +
		" invoice_date			= EXCLUDED.invoice_date, " +
		" invoice_no			= EXCLUDED.invoice_no, " +
		" pay_type				= EXCLUDED.pay_type, " +
		" currency_id			= EXCLUDED.currency_id, " +
		" exchange_rate_amount	= EXCLUDED.exchange_rate_amount, " +
		" customer_id			= EXCLUDED.customer_id, " +
		" customer_vat_number	= EXCLUDED.customer_vat_number, " +
		" customer_name			= EXCLUDED.customer_name, " +
		" customer_address		= EXCLUDED.customer_address, " +
		" customer_contact_name	= EXCLUDED.customer_contact_name, " +
		" customer_contact_mobile	= EXCLUDED.customer_contact_mobile, " +
		" customer_contact_email	= EXCLUDED.customer_contact_email, " +
		" customer_bank_account	= EXCLUDED.customer_bank_account, " +
		" customer_bank_name	= EXCLUDED.customer_bank_name, " +
		" process_invoice_status	= EXCLUDED.process_invoice_status, " +
		" process_adjusted_form	= EXCLUDED.process_adjusted_form, " +
		" process_adjusted_type	= EXCLUDED.process_adjusted_type, " +
		" total_amount			= EXCLUDED.total_amount, " +
		" total_amount_no_vat	= EXCLUDED.total_amount_no_vat, " +
		" total_amount_vat0		= EXCLUDED.total_amount_vat0, " +
		" total_amount_vat5		= EXCLUDED.total_amount_vat5, " +
		" total_amount_vat10	= EXCLUDED.total_amount_vat10, " +
		" total_discount		= EXCLUDED.total_discount, " +
		" total_vat5			= EXCLUDED.total_vat5, " +
		" total_vat10			= EXCLUDED.total_vat10, " +
		" total_vat				= EXCLUDED.total_vat, " +
		" total_other			= EXCLUDED.total_other, " +
		" total_payment			= EXCLUDED.total_payment, " +
		" total_payment_words	= EXCLUDED.total_payment_words, " +
		" status				= EXCLUDED.status," +
		" version				= :version + 1," +
		" rec_modified_by		= EXCLUDED.rec_modified_by, " +
		" rec_modified_at		= EXCLUDED.rec_modified_at " +
		" WHERE invoice.version = :version " +
		" RETURNING id")

	id := int64(0)
	err = stmt.Get(&id, postData)
	if err != nil {
		tx.Rollback()
		log.Error(err)
		return postData, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	postData.ID = &id

	_line_ids := []int64{}
	if postData.InvoiceLines != nil && len(postData.InvoiceLines) > 0 {
		for _, invoiceLine := range postData.InvoiceLines {
			invoiceLine.InvoiceID = postData.ID
			stmt, _ := tx.PrepareNamed("INSERT INTO ehd_invoice_line AS invoice_line(id, " +
				" invoice_id, " +
				" line_no, " +
				" item_id, " +
				" uom_id, " +
				" description, " +
				" quantity, " +
				" unit_price, " +
				" amount, " +
				" vat, " +
				" amount_vat, " +
				" discount, " +
				" amount_discount, " +
				" amount_payment, " +
				" rec_created_by, " +
				" rec_created_at, " +
				" rec_modified_by, " +
				" rec_modified_at, " +
				" status, " +
				" version, " +
				" client_id, " +
				" organization_id) " +
				" VALUES (COALESCE(:id, id_generator()), " +
				" :invoice_id, " +
				" :line_no, " +
				" :item_id, " +
				" :uom_id, " +
				" :description, " +
				" :quantity, " +
				" :unit_price, " +
				" :amount, " +
				" :vat, " +
				" :amount_vat, " +
				" :discount, " +
				" :amount_discount, " +
				" :amount_payment, " +
				" :rec_created_by, " +
				" :rec_created_at, " +
				" :rec_modified_by, " +
				" :rec_modified_at, " +
				" :status, " +
				" :version, " +
				" :client_id, " +
				" :organization_id) " +
				" ON CONFLICT ON CONSTRAINT pk_ehd_invoice_line DO UPDATE SET " +
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

			var line_id int64
			err := stmt.Get(&line_id, invoiceLine)

			if err != nil {
				tx.Rollback()
				log.Error(err)
				return postData, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
			}

			_line_ids = append(_line_ids, line_id)
		}

		if len(_line_ids) == 0 { //neu xoa het line thi phai gan gia tri mac dinh cho _ids => xoa het trong bang line
			_line_ids = append(_line_ids, 0)
		}

		query, args, err := sqlx.In("DELETE FROM ehd_invoice_line WHERE invoice_id = ? AND id NOT IN (?)", postData.ID, _line_ids)
		if err != nil {
			tx.Rollback()
			log.Error(err)
			return postData, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
		query = sqlx.Rebind(sqlx.DOLLAR, query)
		_, err = tx.Exec(query, args...)
		if err != nil {
			tx.Rollback()
			log.Error(err)
			return postData, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
		}
	}
	tx.Commit()

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
		" ehd_customer.code as customer_code, "+
		" user_created.name as rec_created_by_user, "+
		" user_modified.name as rec_modified_by_user, "+
		" organization.description as organization "+
		"	FROM ehd_invoice "+
		"		INNER JOIN user_profile as user_created ON ehd_invoice.rec_created_by = user_created.id "+
		"		INNER JOIN user_profile as user_modified ON ehd_invoice.rec_modified_by = user_modified.id "+
		"		INNER JOIN organization as organization ON ehd_invoice.organization_id = organization.id "+
		"		INNER JOIN ehd_customer as ehd_customer ON ehd_invoice.customer_id = ehd_customer.id "+
		"	WHERE ehd_invoice.id=$1", id)

	if err != nil && err == sql.ErrNoRows {
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrEInvoiceNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	invoiceLines, transInfo := GetEInvoiceLinesByHeaderID(id)
	if !transInfo.ReturnStatus {
		return EInvoice{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: transInfo.ReturnMessage}
	}

	getData.InvoiceLines = invoiceLines

	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}

func DeleteEInvoiceById(orgID int64, ids []string) TransactionalInformation {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	query, args, err := sqlx.In("DELETE FROM ehd_invoice WHERE ehd_invoice.id IN (?) and ehd_invoice.organization_id=?;"+
		"DELETE FROM ehd_invoice_line WHERE invoice_id IN (?)", ids, orgID, ids)

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
