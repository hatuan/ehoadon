
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied
CREATE TABLE IF NOT EXISTS textsearch
(
    id bigint NOT NULL DEFAULT id_generator(),
    textsearch_object character varying NOT NULL,
    textsearch_value tsvector NOT NULL,
    client_id bigint NOT NULL,
    organization_id bigint NOT NULL,
    CONSTRAINT pk_textsearch PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_textsearch_object
    ON textsearch USING btree
    (textsearch_object, id);

CREATE INDEX IF NOT EXISTS idx_textsearch_object_organization_id
    ON textsearch USING btree
    (textsearch_object, organization_id, client_id);

CREATE INDEX IF NOT EXISTS idx_textsearch_value
    ON textsearch USING gist
    (textsearch_value);

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION textsearch_udate_trigger()
  RETURNS trigger AS
$BODY$
DECLARE
BEGIN
    CASE TG_TABLE_NAME
        WHEN 'xxx' THEN
            RETURN NEW;
        ELSE
            IF (TG_OP = 'DELETE') THEN
                DELETE FROM textsearch WHERE textsearch_object = TG_TABLE_NAME AND id = OLD.id;
                RETURN OLD;
            ELSE
                INSERT INTO textsearch(id, textsearch_object, textsearch_value, client_id, organization_id) VALUES
                (NEW.id, TG_TABLE_NAME, to_tsvector('simple', coalesce(NEW.code, '') || ' ' || coalesce(NEW.description, '')), NEW.client_id, NEW.organization_id)
                ON CONFLICT ON CONSTRAINT pk_textsearch DO UPDATE SET textsearch_value = to_tsvector('simple', coalesce(NEW.code, '') || ' ' || coalesce(NEW.description, ''));   
                
                RETURN NEW;
            END IF;    
    END CASE;
	RETURN NULL; -- result is ignored since this is an AFTER trigger
END

$BODY$
  LANGUAGE plpgsql;
-- +goose StatementEnd

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON currency
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

UPDATE currency SET description = description;

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON number_sequence
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

UPDATE number_sequence SET description = description;

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON ehd_customer
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON ehd_tax_authorities
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON ehd_item_uom
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON ehd_item
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

CREATE TRIGGER textsearch_udate
  AFTER INSERT OR UPDATE OR DELETE
  ON ehd_item_group
  FOR EACH ROW
  EXECUTE PROCEDURE textsearch_udate_trigger();

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE textsearch;
DROP TRIGGER IF EXISTS textsearch_udate ON client;
DROP TRIGGER IF EXISTS textsearch_udate ON organization;
DROP TRIGGER IF EXISTS textsearch_udate ON currency;
DROP TRIGGER IF EXISTS textsearch_udate ON number_sequence;
DROP TRIGGER IF EXISTS textsearch_udate ON ehd_customer;
DROP TRIGGER IF EXISTS textsearch_udate ON ehd_tax_authorities;
DROP TRIGGER IF EXISTS textsearch_udate ON ehd_item_uom;
DROP TRIGGER IF EXISTS textsearch_udate ON ehd_item;
DROP TRIGGER IF EXISTS textsearch_udate ON ehd_item_group;
DROP FUNCTION textsearch_udate_trigger;

