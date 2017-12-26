
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied

CREATE SEQUENCE IF NOT EXISTS user_id_sequence;
CREATE SEQUENCE IF NOT EXISTS client_id_sequence MINVALUE 5 MAXVALUE 2000;
CREATE SEQUENCE IF NOT EXISTS global_id_sequence;

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION id_generator(OUT result bigint) AS
$BODY$
DECLARE
    --https://engineering.instagram.com/sharding-ids-at-instagram-1cf5a71e5a5c#.1entthc2d
    --http://rob.conery.io/2014/05/29/a-better-id-generator-for-postgresql/
    --https://www.depesz.com/2015/10/30/is-c-faster-for-instagram-style-id-generation/
    --shard_id : 5 ... 2000
    our_epoch bigint := 1314220021721;
    seq_id bigint;
    now_millis bigint;
    shard_id int := 1;
BEGIN
    SELECT nextval('global_id_sequence') % 1024 INTO seq_id;

    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
    result := (now_millis - our_epoch) << 23; -- <<(64-41)
    result := result | (shard_id <<10); --<<(64-41-13)
    result := result | (seq_id);
END

$BODY$
  LANGUAGE plpgsql;    
-- +goose StatementEnd

CREATE TABLE IF NOT EXISTS user_profile (
  password_question character varying NOT NULL,
  password_answer character varying NOT NULL,
  password character varying NOT NULL,
  salt character varying NOT NULL,
  organization_id bigint,
  name character varying NOT NULL,
  last_modified_date timestamp with time zone NOT NULL,
  last_login_ip character varying NOT NULL,
  last_login_date timestamp with time zone NOT NULL,
  last_locked_out_reason character varying NOT NULL,
  last_locked_out_date timestamp with time zone NOT NULL,
  is_locked_out boolean NOT NULL,
  is_activated boolean NOT NULL,
  id bigint NOT NULL DEFAULT id_generator(),
  full_name character varying NOT NULL,
  email character varying NOT NULL,
  created_date timestamp with time zone NOT NULL,
  comment character varying NOT NULL,
  client_id bigint,
  culture_ui_id character varying NOT NULL,
  CONSTRAINT pk_user_profile PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile USING btree (email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profile_name ON user_profile USING btree (name);

CREATE TABLE IF NOT EXISTS client
(
  id bigint NOT NULL DEFAULT id_generator(),
  description character varying NOT NULL,
  is_activated boolean NOT NULL,
  culture_id character varying NOT NULL,
  amount_decimal_places smallint NOT NULL,
  amount_rounding_precision numeric NOT NULL,
  "unit-amount_decimal_places" smallint NOT NULL,
  "unit-amount_rounding_precision" numeric NOT NULL,
  currency_lcy_id bigint,
  version bigint NOT NULL,
  rec_created_by bigint NOT NULL,
  rec_modified_by bigint NOT NULL,
  rec_created_at timestamp with time zone NOT NULL,
  rec_modified_at timestamp with time zone NOT NULL,
  CONSTRAINT pk_client PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_client_currency_lcy ON client USING btree (currency_lcy_id);

CREATE TABLE IF NOT EXISTS organization
(
  id bigint NOT NULL DEFAULT id_generator(),
  code character varying NOT NULL,
  description character varying NOT NULL,
  version bigint NOT NULL,
  status smallint NOT NULL,
  rec_modified_by bigint NOT NULL,
  rec_created_by bigint NOT NULL,
  rec_created_at timestamp with time zone NOT NULL,
  rec_modified_at timestamp with time zone NOT NULL,
  client_id bigint NOT NULL,
  CONSTRAINT pk_organization PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_organization_client_id ON organization USING btree (client_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_code ON organization USING btree (code, client_id);

CREATE TABLE IF NOT EXISTS role
(
  id bigint NOT NULL DEFAULT id_generator(), 
  description character varying NOT NULL,
  rec_created_by bigint NOT NULL,
  rec_modified_by bigint NOT NULL,
  status smallint NOT NULL,
  version bigint NOT NULL,
  rec_created_at timestamp with time zone NOT NULL,
  rec_modified_at timestamp with time zone NOT NULL,
  client_id bigint NOT NULL,
  organization_id bigint NOT NULL,
  CONSTRAINT pk_role PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user_in_role
(
  id bigint NOT NULL DEFAULT id_generator(),
  role_id bigint NOT NULL,
  user_id bigint NOT NULL,
  version bigint NOT NULL,
  CONSTRAINT pk_user_in_role PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "idx_userinrole_roleid" ON user_in_role USING btree (role_id);
CREATE INDEX IF NOT EXISTS "idx_userinrole_userid"  ON user_in_role USING btree (user_id);

CREATE TABLE IF NOT EXISTS number_sequence
(
  id bigint NOT NULL DEFAULT id_generator(),
  code character varying NOT NULL,
  description character varying NOT NULL,
  current_no integer NOT NULL,
  starting_no integer NOT NULL,
  ending_no integer NOT NULL,
  format_no character varying NOT NULL,
  is_default boolean NOT NULL,
  manual boolean NOT NULL,
  no_seq_name character varying NOT NULL,
  rec_created_by bigint NOT NULL,
  rec_modified_by bigint NOT NULL,
  status smallint NOT NULL,
  version bigint NOT NULL,
  rec_created_at timestamp with time zone NOT NULL,
  rec_modified_at timestamp with time zone NOT NULL,
  client_id bigint NOT NULL,
  organization_id bigint NOT NULL,
  CONSTRAINT pk_number_sequence PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_number_sequence_code ON number_sequence USING btree (code, client_id);

CREATE TABLE IF NOT EXISTS currency
(
  id bigint NOT NULL DEFAULT id_generator(),
  code character varying NOT NULL,
  description character varying NOT NULL,
  organization_id bigint NOT NULL,
  client_id bigint NOT NULL,
  version bigint NOT NULL,
  status smallint NOT NULL,
  rec_modified_by bigint NOT NULL,
  rec_created_by bigint NOT NULL,
  rec_created_at timestamp with time zone NOT NULL,
  rec_modified_at timestamp with time zone NOT NULL,
  CONSTRAINT pk_currency PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_currency_code ON currency USING btree (code, client_id);

CREATE TABLE IF NOT EXISTS currency_convert_rate
(
  id bigint NOT NULL DEFAULT id_generator(),
  currency_id bigint NOT NULL,
  valid_from date NOT NULL,
  currency_relational_id bigint NOT NULL,
  exchange_rate_amount bigint NOT NULL,
  relational_exch_rate_amount bigint NOT NULL,
  client_id bigint NOT NULL,
  organization_id bigint NOT NULL,
  status smallint NOT NULL,
  version bigint NOT NULL,
  rec_created_by bigint NOT NULL,
  rec_modified_by bigint NOT NULL,
  rec_created_at timestamp with time zone NOT NULL,
  rec_modified_at timestamp with time zone NOT NULL,
  CONSTRAINT pk_currency_convert_rate PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS session
(
    working_date date NOT NULL,
    warehouse_id bigint,
    user_id bigint NOT NULL,
    organization_id bigint,
    last_time timestamp with time zone NOT NULL,
    id bigint NOT NULL DEFAULT id_generator(),
    expire boolean,
    client_id bigint NOT NULL,
    CONSTRAINT pk_session PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_session_user ON session USING btree (user_id);

-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back
DROP TABLE user_profile;
DROP TABLE role;
DROP TABLE user_in_role;
DROP TABLE client;
DROP TABLE organization;
DROP TABLE number_sequence;
DROP TABLE currency;
DROP TABLE currency_convert_rate;
DROP TABLE session;
DROP SEQUENCE user_id_sequence;
DROP SEQUENCE client_id_sequence;
DROP SEQUENCE global_id_sequence;
DROP FUNCTION id_generator(OUT result bigint);