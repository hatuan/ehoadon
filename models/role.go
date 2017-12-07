package models

type Role struct {
	ID             int64  `db:"id" json:",string"`
	Name           string `db:"name"`
	ClientID       int64  `db:"client_id" json:",string"`
	Client         string `db:"client"`
	OrganizationID int64  `db:"organization_id" json:",string"`
	Organization   string `db:"organization"`
}
