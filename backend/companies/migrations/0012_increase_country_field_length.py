# Migration to increase country field length from 2 to 100 characters
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0011_allow_null_contact_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='country',
            field=models.CharField(default='Belgique', max_length=30, verbose_name='country'),
        ),
    ]
