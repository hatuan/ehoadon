package models

import (
	"database/sql"
	"erpvietnam/ehoadon/log"
	"erpvietnam/ehoadon/settings"
	"errors"
	"strings"

	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type UserClaim struct {
	ID             int64 `json:",string"`
	Name           string
	Comment        string
	FullName       string
	Email          string
	ClientID       int64 `json:",string"`
	OrganizationID int64 `json:",string"`
	CultureUIID    string
	Roles          []Role
}

// User represents the user model
type User struct {
	ID                  *int64        `db:"id" json:",string"`
	Name                string        `db:"name"`
	Password            string        `json:"-" db:"password"`
	Salt                string        `json:"-" db:"salt"`
	Comment             string        `db:"comment"`
	FullName            string        `db:"full_name"`
	PasswordAnswer      string        `json:"-" db:"password_answer"`
	PasswordQuestion    string        `json:"-" db:"password_question"`
	Email               string        `json:"email"`
	CreatedDate         *Timestamp    `json:"omitempty" db:"created_date"`
	IsActivated         bool          `json:"is_activated" db:"is_activated"`
	IsLockedOut         bool          `json:"is_locked_out" db:"is_locked_out"`
	LastLockedOutDate   *Timestamp    `json:"omitempty" db:"last_locked_out_date"`
	LastLockedOutReason string        `db:"last_locked_out_reason"`
	LastLoginDate       *Timestamp    `json:"omitempty" db:"last_login_date"`
	LastLoginIP         string        `db:"last_login_ip"`
	LastModifiedDate    *Timestamp    `json:"omitempty" db:"last_modified_date"`
	ClientID            int64         `db:"client_id" json:",string"`
	Client              *Client       `db:"-"`
	OrganizationID      int64         `db:"organization_id" json:",string"`
	Organization        *Organization `db:"-"`
	CultureUIID         string        `db:"culture_ui_id"`
	Roles               []Role        `db:"-"`
}

type PreferenceDTO struct {
	OrganizationID int64 `json:",string"`
	CultureUIID    string
	WorkingDate    *Timestamp
}

// ErrUsernameTaken is thrown when a user attempts to register a username that is taken.
var ErrUsernameTaken = errors.New("username already taken")

var ErrUsernameNotFound = errors.New("Error User's name Not Found")

// GetUser returns the user that the given id corresponds to. If no user is found, an
// error is thrown.
func GetUser(id int64) (User, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	u := User{}
	err = db.Get(&u, "SELECT * FROM user_profile WHERE id=$1", id)
	if err != nil {
		return u, err
	}
	return u, nil
}

// GetUserByUsername returns the user that the given username corresponds to. If no user is found, an
// error is thrown.
func GetUserByUsername(name string) (User, error) {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	u := User{}
	err = db.Get(&u, "SELECT * FROM user_profile WHERE name=$1", strings.ToUpper(name))
	// No issue if we don't find a record
	if err == sql.ErrNoRows {
		return u, ErrUsernameNotFound
	} else if err == nil {
		return u, ErrUsernameTaken
	}
	return u, err
}

func (u User) GetPreference() (PreferenceDTO, error) {
	preference := PreferenceDTO{}

	//TODO: check if u.OrganizationID == "" => load rootOrganization
	preference.OrganizationID = u.OrganizationID

	preference.WorkingDate = &Timestamp{time.Now()}

	if u.CultureUIID == "" {
		u.CultureUIID = "vi-VN"
	}
	preference.CultureUIID = u.CultureUIID

	return preference, nil
}

func (u *User) SetPreference(preference PreferenceDTO) error {
	db, err := sqlx.Connect(settings.Settings.Database.DriverName, settings.Settings.GetDbConn())
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, err = db.NamedExec(`UPDATE user_profile SET organization_id = :organization_id, culture_ui_id = :culture_ui_id WHERE id = :id`,
		map[string]interface{}{
			"organization_id": preference.OrganizationID,
			"culture_ui_id":   preference.CultureUIID,
			"id":              u.ID,
		})
	if err != nil {
		return err
	}
	u.OrganizationID = preference.OrganizationID
	u.CultureUIID = preference.CultureUIID

	return nil
}
