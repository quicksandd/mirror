import asyncio
import logging
import os
import threading
import time
from datetime import datetime, timedelta

import telegram
from telegram.constants import ParseMode
from telegram.error import TelegramError

log = logging.getLogger(__name__)


REPORTER_TG_BOT = os.getenv("REPORTER_TG_BOT")


FMT_STR = '%(asctime)s: %(levelname)s: %(filename)s:%(lineno)d: %(message)s'


class TgFormatter(logging.Formatter):
    def format(self, record):
        record.message = record.getMessage()
        if self.usesTime():
            record.asctime = self.formatTime(record, self.datefmt)
        s = escape(self.formatMessage(record))
        if record.exc_info:
            # Cache the traceback text to avoid converting it multiple times
            # (it's constant anyway)
            if not record.exc_text:
                record.exc_text = self.formatException(record.exc_info)
        if record.exc_text:
            if s[-1:] != "\n":
                s = f"{s}\n"
            s = f'{s}```{escape(record.exc_text)}```'
        if record.stack_info:
            if s[-1:] != "\n":
                s = s + "\n"
            s = s + self.formatStack(record.stack_info)
        return s


class TgHandler(logging.Handler):
    def emit(self, record):
        try:
            if record.module == 'tg':
                return
            msg = self.format(record)
            send_from_log(msg, False)
        except (KeyboardInterrupt, SystemExit):
            raise
        except:
            self.handleError(record)


last_fail = [datetime.now() - timedelta(days=1000)]


class Dest:
    SERG = (128725536, None)
    GROUP = (-1002802336393, 3)
    # GROUP = (-2802336393, 3)


def get_dest():
    return Dest.GROUP


def send_from_log(bot_message, encode=True):
    if datetime.now() - last_fail[0] < timedelta(minutes=10):
        return
    send_report(bot_message, skip_exc=True, encode=encode)


def escape(text):
    return telegram.helpers.escape_markdown(text, 2)


def send_report_sync(msg: str, dest=None, skip_exc=False, encode=True):
    try:
        dest = dest or get_dest()
        if encode:
            msg = escape(msg)

        bot = telegram.Bot(REPORTER_TG_BOT)
        coro = bot.send_message(
            chat_id=dest[0],
            text=msg,
            message_thread_id=dest[1],
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        asyncio.run(coro)
    except (telegram.error.NetworkError, TelegramError) as e:
        log.warning(f'TG exc: {type(e)} {e}, msg:{msg}')
    except Exception as e:
        if skip_exc:
            return

        last_fail[0] = datetime.now()
        log.exception(e)


def send_report(msg, dest=None, skip_exc=False, encode=True):
    threading.Thread(target=send_report_sync, args=(msg, dest, skip_exc, encode)).start()


tg_handler = TgHandler(logging.ERROR)
tg_handler.setFormatter(TgFormatter(FMT_STR))

if __name__ == '__main__':
    # msg = ' #delay: 00:35, start printing: ModelInfo(model_id=119, color_id=0, total_program_time=0), color 0'
    # msg = '#delay'
    # print(escape(msg))
    print('a')
    send_report_sync('hey2', dest=Dest.GROUP)
    print('b')

    send_report('hey yo', dest=Dest.GROUP)
    time.sleep(10)
    # _send_report(f"\\#asd \n```\nnsakdasmkm\n```",encode=False)
    pass
