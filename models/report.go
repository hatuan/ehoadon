package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"
	"fmt"
	"strconv"

	"github.com/jmoiron/sqlx"
)

type Report struct {
	ReportID     string `db:"report_id"`
	ReportNo     string `db:"report_no"`
	ReportText   string `db:"report_text"`
	ReportText2  string `db:"report_text2"`
	ReportTitle  string `db:"report_title"`
	ReportTitle2 string `db:"report_title2"`
	ReportFile   string `db:"report_file"`
	ReportBlob   string `db:"report_blob"`
	Status       int8   `db:"status"`
}

// ErrReportNotFound indicates there was no Report
var ErrReportNotFound = errors.New("Report not found")

// ErrReportDescriptionNotSpecified indicates there was no name given by the user
var ErrReportDescriptionNotSpecified = errors.New("Report's description not specified")

// ErrReportCodeNotSpecified indicates there was no code given by the user
var ErrReportCodeNotSpecified = errors.New("Report's code not specified")

// ErrReportDuplicate indicates there was duplicate of code given by the user
var ErrReportDuplicate = errors.New("Report's is duplicate")

// ErrReportFatal indicates there was fatal error
var ErrReportFatal = errors.New("Report has fatal error")

// ErrReportValidate indicates there was validate error
var ErrReportValidate = errors.New("Report has validate error")

func GetReports(searchCondition string) ([]Report, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return []Report{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	sqlString := "SELECT report.* " +
		" FROM report "

	sqlWhere := " WHERE status <> 0 "
	if len(searchCondition) > 0 {
		sqlWhere += fmt.Sprintf(" AND %s", searchCondition)
	}

	sqlString += sqlWhere

	getDatas := []Report{}
	err = db.Select(&getDatas, sqlString)

	if err != nil {
		log.Error(err)
		return getDatas, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}

	return getDatas, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{strconv.Itoa(len(getDatas)) + " records found"}}
}

// GetReportByCode returns the Report that the given id corresponds to.
// If no Report is found, an error is thrown.
func GetReportByCode(reportID string, reportNo string) (Report, TransactionalInformation) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Error(err)
		return Report{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	defer db.Close()

	getData := Report{}
	err = db.Get(&getData, "SELECT report.*"+
		"	FROM report "+
		"	WHERE report.report_id=$1 and report.report_no=$2", reportID, reportNo)

	if err != nil && err == sql.ErrNoRows {
		return Report{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{ErrReportNotFound.Error()}}
	} else if err != nil {
		log.Error(err)
		return Report{}, TransactionalInformation{ReturnStatus: false, ReturnMessage: []string{err.Error()}}
	}
	return getData, TransactionalInformation{ReturnStatus: true, ReturnMessage: []string{"Successfully"}}
}
