package models

type Role struct {
	ID             int64  `db:"id" json:",string"`
	Description    string `db:"description"`
	ClientID       int64  `db:"client_id" json:",string"`
	Client         string `db:"client"`
	OrganizationID int64  `db:"organization_id" json:",string"`
	Organization   string `db:"organization"`
}
