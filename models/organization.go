package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Organization struct {
	ID                *int64     `db:"id" json:",string"`
	Code              string     `db:"code"`
	Description       string     `db:"description"`
	RecCreatedByID    int64      `db:"rec_created_by" json:",string"`
	RecCreatedByUser  string     `db:"-"`
	RecCreatedAt      *Timestamp `db:"rec_created_at"`
	RecModifiedByID   int64      `db:"rec_modified_by" json:",string"`
	RecModifiedByUser string     `db:"-"`
	RecModifiedAt     *Timestamp `db:"rec_modified_at"`
	Status            int8       `db:"status"`
	Version           int16      `db:"version"`
	ClientID          int64      `db:"client_id" json:",string"`
}

var ErrRootOrganizationNotFound = errors.New("Error RootOrganization Not Found")
var ErrOrganizationNotFound = errors.New("Error Organization Not Found")

func (o Organization) GetRootOrganization() (Organization, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)

		return Organization{}, err
	}
	defer db.Close()

	rootOrganization := Organization{}

	err = db.Get(&rootOrganization, "SELECT * FROM organization WHERE client_id=$1 AND code='*'", o.ClientID)
	if err == sql.ErrNoRows {
		return rootOrganization, ErrRootOrganizationNotFound
	} else if err != nil {
		log.Error(err)
		return rootOrganization, err
	}
	return rootOrganization, nil
}

// Get returns the Organization that the given id corresponds to. If no Organization is found, an error is thrown.
func (o *Organization) Get(id int64) error {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Get(&o, "SELECT * FROM organization WHERE id=$1", id)
	if err == sql.ErrNoRows {
		return ErrOrganizationNotFound
	} else if err != nil {
		return err
	}
	return nil
}

// GetOrganizationByID returns the Organization that the given id corresponds to. If no Organization is found, an error is thrown.
func GetOrganizationByID(id int64) (Organization, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	organization := Organization{}
	err = db.Get(&organization, "SELECT * FROM organization WHERE id=$1", id)
	if err == sql.ErrNoRows {
		return organization, ErrOrganizationNotFound
	} else if err != nil {
		return organization, err
	}
	return organization, nil
}

// GetOrgAndRootByID returns the Organization that the given id and RootOrganization. If no Organization is found, an error is thrown.
func GetOrgAndRootByID(id int64) ([]Organization, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	organizations := []Organization{}
	err = db.Select(&organizations, "SELECT * FROM organization WHERE id = $1 UNION SELECT * FROM organization WHERE code = '*' AND client_id = (SELECT client_id FROM organization WHERE id = $1)", id)
	if err == sql.ErrNoRows {
		return organizations, ErrOrganizationNotFound
	} else if err != nil {
		return organizations, err
	}
	return organizations, nil
}
