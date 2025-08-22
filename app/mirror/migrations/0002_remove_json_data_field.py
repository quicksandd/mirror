# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mirror', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mirroranalysis',
            name='json_data',
        ),
    ]
