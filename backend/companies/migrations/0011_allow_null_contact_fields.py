# Custom migration to allow NULL values for contact fields

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0010_update_company_indexes"),
    ]

    operations = [
        migrations.RunSQL(
            # PostgreSQL allows ALTER COLUMN
            sql="""
                ALTER TABLE companies ALTER COLUMN website DROP NOT NULL;
                ALTER TABLE companies ALTER COLUMN phone DROP NOT NULL;
                ALTER TABLE companies ALTER COLUMN email DROP NOT NULL;
            """,
            reverse_sql="""
                ALTER TABLE companies ALTER COLUMN website SET NOT NULL;
                ALTER TABLE companies ALTER COLUMN phone SET NOT NULL;
                ALTER TABLE companies ALTER COLUMN email SET NOT NULL;
            """
        ),
    ]
