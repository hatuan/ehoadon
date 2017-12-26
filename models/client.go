package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"

	"github.com/shopspring/decimal"

	"erpvietnam/ehoadon/settings"
	"errors"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// Client represents the client model
type Client struct {
	ClientID                    *int64          `db:"id" json:",string"`
	Description                 string          `db:"description"`
	Version                     int16           `db:"version"`
	IsActivated                 bool            `db:"is_activated"`
	RecCreatedBy                int64           `db:"rec_created_by" json:",string"`
	RecCreatedByUser            string          `db:"-"`
	RecCreatedAt                *Timestamp      `db:"rec_created_at"`
	RecModifiedBy               int64           `db:"rec_modified_by" json:",string"`
	RecModifiedByUser           string          `db:"-"`
	RecModifiedAt               *Timestamp      `db:"rec_modified_at"`
	CultureID                   string          `db:"culture_id"`
	AmountDecimalPlaces         int16           `db:"amount_decimal_places"`
	AmountRoundingPrecision     decimal.Decimal `db:"amount_rounding_precision" json:",string"`
	UnitAmountDecimalPlaces     int16           `db:"unit-amount_decimal_places"`
	UnitAmountRoundingPrecision decimal.Decimal `db:"unit-amount_rounding_precision" json:",string"`
	CurrencyLCYId               int64           `db:"currency_lcy_id" json:",string"`
	CurrencyLCY                 Currency        `db:"-"`
	Organizations               []Organization  `db:"-"`
}

// ErrOrganizationsIsEmpty is thrown when do not found any Organization.
var ErrOrganizationsIsEmpty = errors.New("Organizations is empty")

// ErrClientNotFound is thrown when do not found any Client.
var ErrClientNotFound = errors.New("Client not found")

func (c *Client) GetOrganizations() ([]Organization, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
		return []Organization{}, err
	}
	defer db.Close()

	organizations := []Organization{}
	err = db.Select(&organizations, "SELECT * FROM organization WHERE client_id = $1", c.ClientID)
	if err != nil && err == sql.ErrNoRows {
		log.Error(err)
		return organizations, ErrOrganizationsIsEmpty
	} else if err != nil {
		log.Error(err)
		return organizations, err
	}
	c.Organizations = organizations

	return organizations, nil
}

func (c *Client) Get(id int64) error {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	err = db.QueryRowx("SELECT *  FROM client WHERE id=$1", id).StructScan(c)
	if err == sql.ErrNoRows {
		return ErrClientNotFound
	} else if err != nil {
		return err
	}

	return nil
}
