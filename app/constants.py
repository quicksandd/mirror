import contextvars
import enum
import logging
import os
from pathlib import Path

from dotenv import load_dotenv

from app import tg_log

load_dotenv()


DEV_DEBUG = bool(os.getenv("DEV_DEBUG", False))

MIRROR_ENABLED = bool(os.getenv("MIRROR_ENABLED", True))

chat_id_var = contextvars.ContextVar("chat_id", default="-")


class ChatIDFilter(logging.Filter):
    def filter(self, record):
        record.chat_id = chat_id_var.get()
        return True


_handler = logging.StreamHandler()
_handler.addFilter(ChatIDFilter())

_handlers = [_handler]
if not DEV_DEBUG:
    _handlers.append(tg_log.tg_handler)

logging.basicConfig(
    level=logging.INFO,
    handlers=_handlers,
    format='%(asctime)s [%(levelname)s] %(filename)s:%(lineno)d [tg:%(chat_id)s]: %(message)s',
)

logging.getLogger("httpx").setLevel(logging.WARNING)


log = logging.getLogger(__name__)

SAVE_OPENAI_API_CALL = 1
MAX_ATTEMPTS_FOR_COMMAND_GENERATION = 3
TG_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", '0')
if not TG_BOT_TOKEN:
    log.error("TELEGRAM_BOT_TOKEN not found in environment variables")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


LOAD_LOCAL_TEMPLATES = int(os.getenv("LOAD_LOCAL_TEMPLATES", 0))

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / 'static/'
STATIC_UI_DIR = STATIC_DIR / 'ui'
SAMPLE_AVATAR_PATH = str(STATIC_UI_DIR / "pixel_art_tony_soprano.png")
PATIENT_TEMPLATES_PATH = STATIC_DIR / 'patient_templates'

APP_URL = os.getenv("APP_URL")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_key_here")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "pk_test_your_key_here")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")  # Empty default, will log an error if not set
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "price_your_price_id_here")


class ChatModel(enum.Enum):
    GPT4_1_mini = "gpt-4.1-mini"
    GPT4_1 = "gpt-4.1"


from django.db import models


class Lang(models.TextChoices):
    EN = "en", "English"
    RU = "ru", "Russian"
