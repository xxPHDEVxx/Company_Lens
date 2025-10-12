# Custom migration to allow NULL values for contact fields
# Uses SQL to avoid Django's table recreation issues on SQLite

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0010_update_company_indexes"),
    ]

    operations = [
        migrations.RunSQL(
            # SQLite requires table recreation to modify columns
            sql="""
                CREATE TABLE companies_new (
                    id varchar(50) NOT NULL PRIMARY KEY,
                    vat varchar(20) NOT NULL UNIQUE,
                    name varchar(255) NOT NULL,
                    status varchar(20) NOT NULL,
                    legal_form varchar(20) NOT NULL,
                    creation_date date,
                    fiscal_year varchar(20) NOT NULL,
                    last_update datetime NOT NULL,
                    capital varchar(50) NOT NULL,
                    employees integer,
                    company_type varchar(50) NOT NULL,
                    company_size varchar(20) NOT NULL,
                    address_id bigint,
                    website varchar(200),
                    phone varchar(20),
                    email varchar(254),
                    created_at datetime NOT NULL,
                    updated_at datetime NOT NULL,
                    FOREIGN KEY (address_id) REFERENCES addresses (id) DEFERRABLE INITIALLY DEFERRED
                );

                INSERT INTO companies_new SELECT * FROM companies;

                DROP TABLE companies;

                ALTER TABLE companies_new RENAME TO companies;

                CREATE INDEX companies_vat_7bdce_idx ON companies (vat);
                CREATE INDEX companies_status_2cde5e_idx ON companies (status);
                CREATE INDEX companies_name_c7a1b3_idx ON companies (name);
            """,
            reverse_sql="""
                -- Reversal would require making fields NOT NULL again
                -- Not implementing reverse since it would lose data
                SELECT 1;
            """
        ),
    ]
