# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("groups", "0005_update_icon_choices"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="companygroup",
            name="color",
        ),
        migrations.RemoveField(
            model_name="groupmembership",
            name="notes",
        ),
        migrations.RemoveField(
            model_name="groupmembership",
            name="position",
        ),
    ]