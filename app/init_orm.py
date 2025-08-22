import logging
import os

import django
from dotenv import load_dotenv

log = logging.getLogger(__name__)


def setup_django(load_env=True):
    try:
        if load_env:
            load_dotenv()

        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
        django.setup()
        log.info("Django environment set up successfully.")
    except ImportError:
        log.error(
            "Django settings module not found. Ensure 'settings.py' exists and DJANGO_SETTINGS_MODULE is set correctly."
        )
        raise
    except Exception as e:
        log.error(f"Error setting up Django: {e}")
        raise
