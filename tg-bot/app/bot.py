"""
Rovno.dev Telegram bot.

Responsibilities:
  1. Deep-link account binding — `/start <code>` posts the chat_id to the
     main service so the account can receive order notifications via
     Telegram (in addition to email).
  2. Admin tooling — search orders by ID / name / phone / email, and dump
     recent orders to Excel.

Order notification delivery happens server-side in notification_service.py
using the same bot token; the bot itself does NOT need to know about new
orders in order to deliver them.
"""

import os
import sys
import html
import asyncio
import logging
from datetime import datetime

import httpx
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, CommandObject, BaseFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    FSInputFile,
    BotCommand,
)
from aiogram.client.default import DefaultBotProperties

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage

# ─────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("tg-bot")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USERS = [
    int(x.strip())
    for x in (os.getenv("TELEGRAM_BOT_ALLOWED_USERS") or "").split(",")
    if x.strip()
]

# Explicit driver: `postgresql+psycopg2://`. A bare `postgresql://` makes
# SQLAlchemy try psycopg2 first, then psycopg (v3), then raise if neither
# is importable — and the resulting ModuleNotFoundError names whichever
# it tried last, which is confusing when the real problem is a missing
# or half-installed driver package. Pinning the driver here means the
# error message, if any, is unambiguous.
DB_URL = (
    f"postgresql+psycopg2://{os.getenv('MAIN_DB_USER')}:{os.getenv('MAIN_DB_PASSWORD')}"
    f"@{os.getenv('MAIN_DB_HOST')}:{os.getenv('MAIN_DB_PORT')}/{os.getenv('MAIN_DB_NAME')}"
)
MAIN_SERVICE_URL = os.getenv("MAIN_SERVICE_URL", "http://main-service:8000").rstrip("/")
BOT_SECRET = os.getenv("TELEGRAM_BOT_WEBHOOK_SECRET", "")
ORDER_FILES_DIR = os.getenv("ORDER_FILES_DIR", "/app/storage/order_files")

engine = create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode="HTML"))
dp = Dispatcher(storage=MemoryStorage())

# ─────────────────────────────────────────────────────────────────────
# Filters & states
# ─────────────────────────────────────────────────────────────────────
class AdminFilter(BaseFilter):
    async def __call__(self, message: types.Message) -> bool:
        return message.from_user.id in ALLOWED_USERS

class SearchFSM(StatesGroup):
    waiting_query = State()

# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────
def esc(value) -> str:
    """Escape user-controlled text for Telegram's HTML parse mode."""
    return html.escape(str(value)) if value not in (None, "") else "—"

def get_main_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📊 Последние 10"), KeyboardButton(text="📅 Текущий месяц")],
            [KeyboardButton(text="🔍 Поиск заказа")],
        ],
        resize_keyboard=True,
    )

STATUS_LABELS = {
    "new": "Новая",
    "negotiating": "Обсуждение",
    "work": "В работе",
    "done": "Готово",
    "canceled": "Отменена",
}

# Shared SELECT — used by recent list, month filter, and search.
ORDERS_SELECT = """
    SELECT o.id, o.created_at, o.status, o.about,
           o.estimate_budget, o.estimate_deadline, o.naming_help,
           o.service_types_json,
           c.name AS client_name,
           c.phone AS client_phone,
           c.email AS client_email,
           c.telegram_username AS client_telegram
    FROM order_requests o
    LEFT JOIN clients c ON c.id = o.client_id
"""

def fetch_recent(limit: int):
    with SessionLocal() as s:
        return s.execute(
            text(f"{ORDERS_SELECT} ORDER BY o.created_at DESC LIMIT :lim"),
            {"lim": limit},
        ).fetchall()

def fetch_month(month: str):
    with SessionLocal() as s:
        return s.execute(
            text(
                f"{ORDERS_SELECT} "
                "WHERE to_char(o.created_at, 'YYYY-MM') = :m "
                "ORDER BY o.created_at DESC"
            ),
            {"m": month},
        ).fetchall()

def search_orders(query: str, limit: int = 20):
    """Single-field search across order id, client name, phone, email, telegram."""
    q = (query or "").strip()
    if not q:
        return []
    like = f"%{q}%"
    with SessionLocal() as s:
        return s.execute(
            text(
                f"{ORDERS_SELECT} "
                "WHERE o.id::text ILIKE :like "
                "   OR c.name ILIKE :like "
                "   OR c.phone ILIKE :like "
                "   OR c.email ILIKE :like "
                "   OR c.telegram_username ILIKE :like "
                "ORDER BY o.created_at DESC "
                "LIMIT :lim"
            ),
            {"like": like, "lim": limit},
        ).fetchall()

def format_order(row) -> str:
    m = row._mapping
    short_id = str(m["id"])[:8]
    date_str = m["created_at"].strftime("%d.%m.%Y %H:%M") if m["created_at"] else "—"
    services = m["service_types_json"]
    services_str = ", ".join(services) if isinstance(services, list) and services else ""

    parts = [
        f"<b>#{esc(short_id)}</b> · {esc(STATUS_LABELS.get(m['status'], m['status']))}",
        f"📅 {esc(date_str)}",
        f"👤 {esc(m['client_name'])}",
    ]
    if m["client_phone"]:
        parts.append(f"📞 {esc(m['client_phone'])}")
    if m["client_email"]:
        parts.append(f"✉️ {esc(m['client_email'])}")
    if m["client_telegram"]:
        parts.append(f"💬 @{esc(str(m['client_telegram']).lstrip('@'))}")
    if services_str:
        parts.append(f"🛠 {esc(services_str)}")
    if m["estimate_budget"]:
        parts.append(f"💰 {esc(m['estimate_budget'])}")
    if m["estimate_deadline"]:
        parts.append(f"⏱ {esc(m['estimate_deadline'])}")
    if m["about"]:
        body = m["about"]
        if len(body) > 200:
            body = body[:200] + "…"
        parts.append(f"📝 {esc(body)}")
    parts.append(f"<code>{esc(m['id'])}</code>")
    return "\n".join(parts)

async def send_order_results(message: types.Message, rows, header: str) -> None:
    """Send order blocks in chunks small enough for Telegram's 4 KB message cap."""
    if not rows:
        await message.answer(header)
        return
    chunk = header + "\n\n"
    for row in rows:
        block = format_order(row) + "\n\n———\n\n"
        if len(chunk) + len(block) > 4000:
            await message.answer(chunk)
            chunk = ""
        chunk += block
    if chunk.strip():
        await message.answer(chunk)

def create_excel_report(rows, filename: str) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Orders"
    ws.append(
        [
            "ID", "Дата", "Статус", "Клиент", "Телефон", "Email",
            "Telegram", "Бюджет", "Срок", "Услуги", "Описание",
        ]
    )
    for i, row in enumerate(rows, start=2):
        m = row._mapping
        services = m["service_types_json"]
        ws.append(
            [
                str(m["id"]),
                m["created_at"].strftime("%d.%m.%Y %H:%M") if m["created_at"] else "—",
                STATUS_LABELS.get(m["status"], m["status"] or "—"),
                m["client_name"] or "—",
                m["client_phone"] or "—",
                m["client_email"] or "—",
                m["client_telegram"] or "—",
                m["estimate_budget"] or "—",
                m["estimate_deadline"] or "—",
                ", ".join(services) if isinstance(services, list) else "—",
                (m["about"] or "")[:200],
            ]
        )
        # Attach images from the shared storage volume.
        with SessionLocal() as s:
            files = s.execute(
                text(
                    "SELECT file_path FROM order_request_files "
                    "WHERE order_request_id = :id"
                ),
                {"id": m["id"]},
            ).fetchall()
        for idx, (path,) in enumerate(files):
            disk_name = os.path.basename(path)
            disk_path = os.path.join(ORDER_FILES_DIR, disk_name)
            if not os.path.exists(disk_path):
                continue
            if not disk_path.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            try:
                img = XLImage(disk_path)
                img.width, img.height = 60, 60
                ws.add_image(img, ws.cell(row=i, column=12 + idx).coordinate)
                ws.row_dimensions[i].height = 50
            except Exception as e:
                log.warning("image attach failed for %s: %s", disk_path, e)
    wb.save(filename)
    wb.close()

async def link_chat(code: str, chat_id: int, username: str | None) -> tuple[bool, str]:
    """POST the link code to the main service and bind this chat_id to the user."""
    if not BOT_SECRET:
        return False, "Мост с ботом не настроен на сервере (нет TELEGRAM_BOT_WEBHOOK_SECRET)."
    url = f"{MAIN_SERVICE_URL}/api/v1/bot/link"
    payload = {"code": code, "chat_id": str(chat_id), "telegram_username": username}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                url, headers={"X-Bot-Secret": BOT_SECRET}, json=payload
            )
    except Exception as e:
        log.error("link request failed: %s", e)
        return False, f"Не удалось связаться с сервером: {e}"
    if r.status_code == 200:
        return True, "ok"
    if r.status_code == 410:
        return False, "Код устарел или уже был использован. Создайте новый в настройках на сайте."
    if r.status_code == 403:
        return False, "Сервер отклонил секрет бота. Проверьте TELEGRAM_BOT_WEBHOOK_SECRET."
    if r.status_code == 503:
        return False, "Привязка через бота временно недоступна на сервере."
    return False, f"Сервер вернул ошибку {r.status_code}."

# ─────────────────────────────────────────────────────────────────────
# Handlers
# ─────────────────────────────────────────────────────────────────────
@dp.message(Command("start"))
async def cmd_start(message: types.Message, command: CommandObject):
    # Deep-link binding — the /start <code> path takes priority.
    if command.args:
        code = command.args.strip()
        ok, msg = await link_chat(code, message.from_user.id, message.from_user.username)
        if ok:
            await message.answer(
                "✅ <b>Уведомления подключены</b>\n\n"
                "Ваш Telegram привязан к аккаунту. Теперь сюда будут "
                "приходить уведомления о новых заказах, если Telegram-канал "
                "включён в настройках профиля на сайте.",
            )
        else:
            await message.answer(
                f"❌ <b>Не удалось привязать аккаунт</b>\n\n{esc(msg)}\n\n"
                "Откройте личный кабинет → Настройки → «Подключить Telegram», "
                "чтобы получить свежую ссылку.",
            )
        return

    if message.from_user.id in ALLOWED_USERS:
        await message.answer(
            "🤖 <b>Админ-панель Rovno.dev</b>\n\n"
            "<b>Команды:</b>\n"
            "/search &lt;запрос&gt; — поиск заказа по ID, имени, телефону, email\n"
            "/dump_last [N] — последние N заказов (Excel)\n"
            "/dump_month [YYYY-MM] — заказы за месяц (Excel)\n"
            "/notifications — как настроить уведомления\n"
            "/cancel — отменить действие\n\n"
            "Или выберите действие кнопкой ниже.",
            reply_markup=get_main_menu(),
        )
    else:
        await message.answer(
            "🤖 Привет! Я бот Rovno.dev.\n\n"
            "Чтобы подключить уведомления о заказах, откройте личный кабинет "
            "на сайте: <b>Профиль → Настройки → «Подключить Telegram»</b>.\n\n"
            "Проверить, какие уведомления вы получаете: /notifications",
        )

@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    if message.from_user.id in ALLOWED_USERS:
        await cmd_start(message, None)
    else:
        await message.answer(
            "🤖 <b>Rovno.dev бот</b>\n\n"
            "/start — приветствие\n"
            "/start &lt;код&gt; — привязать Telegram для уведомлений\n"
            "/notifications — как настроить уведомления\n"
        )

@dp.message(Command("notifications"))
async def cmd_notifications(message: types.Message):
    await message.answer(
        "🔔 <b>Настройка уведомлений</b>\n\n"
        "Управление уведомлениями — в личном кабинете на сайте:\n\n"
        "<b>Профиль → Настройки</b>\n\n"
        "Там вы можете:\n"
        "• Включить / выключить email-уведомления\n"
        "• Включить / выключить Telegram-уведомления\n"
        "• Подключить Telegram (получить ссылку с кодом)\n"
        "• Отключить Telegram\n"
    )

@dp.message(Command("cancel"), AdminFilter())
async def cmd_cancel(message: types.Message, state: FSMContext):
    if await state.get_state() is not None:
        await state.clear()
        await message.answer("Отменено.", reply_markup=get_main_menu())
    else:
        await message.answer("Нечего отменять.", reply_markup=get_main_menu())

# ── Search ────────────────────────────────────────────────────────────
# The FSM state handler MUST be registered before the button handler so
# that while in `waiting_query` every incoming message routes here.
@dp.message(SearchFSM.waiting_query, AdminFilter())
async def handle_search_query(message: types.Message, state: FSMContext):
    await state.clear()
    query = (message.text or "").strip()
    if not query:
        await message.answer("Пустой запрос.", reply_markup=get_main_menu())
        return
    rows = search_orders(query)
    header = f"🔍 Найдено {len(rows)} заказ(ов) по «{esc(query)}»"
    if not rows:
        header += " — ничего не найдено."
    await send_order_results(message, rows, header)
    await message.answer("Вернуться в меню:", reply_markup=get_main_menu())

@dp.message(F.text == "🔍 Поиск заказа", AdminFilter())
async def ask_search(message: types.Message, state: FSMContext):
    await state.set_state(SearchFSM.waiting_query)
    await message.answer(
        "Введите запрос: ID заказа, имя клиента, телефон, email или Telegram.\n\n"
        "Отмена — /cancel",
    )

@dp.message(Command("search"), AdminFilter())
async def cmd_search(message: types.Message, command: CommandObject):
    query = (command.args or "").strip()
    if not query:
        await message.answer(
            "Использование: <code>/search &lt;запрос&gt;</code>\n\n"
            "Поиск идёт по ID заказа, имени клиента, телефону, email "
            "или Telegram-нику.",
        )
        return
    rows = search_orders(query)
    header = f"🔍 Найдено {len(rows)} заказ(ов) по «{esc(query)}»"
    if not rows:
        header += " — ничего не найдено."
    await send_order_results(message, rows, header)

# ── Dumps ─────────────────────────────────────────────────────────────
@dp.message(F.text == "📊 Последние 10", AdminFilter())
@dp.message(Command("dump_last"), AdminFilter())
async def dump_last(message: types.Message, command: CommandObject = None):
    limit = 10
    if command and command.args and command.args.isdigit():
        limit = min(int(command.args), 100)
    rows = fetch_recent(limit)
    if not rows:
        await message.answer("Заказов нет.")
        return
    fname = f"dump_last_{limit}.xlsx"
    create_excel_report(rows, fname)
    await message.reply_document(FSInputFile(fname), caption=f"Выгрузка: {len(rows)} шт.")
    if os.path.exists(fname):
        os.remove(fname)

@dp.message(F.text == "📅 Текущий месяц", AdminFilter())
@dp.message(Command("dump_month"), AdminFilter())
async def dump_month(message: types.Message, command: CommandObject = None):
    month = command.args if command and command.args else datetime.now().strftime("%Y-%m")
    rows = fetch_month(month)
    if not rows:
        await message.answer(f"За {month} заказов нет.")
        return
    fname = f"orders_{month}.xlsx"
    create_excel_report(rows, fname)
    await message.reply_document(FSInputFile(fname), caption=f"За {month}: {len(rows)} шт.")
    if os.path.exists(fname):
        os.remove(fname)

# ─────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────
async def main():
    if not TOKEN:
        log.error("TELEGRAM_BOT_TOKEN is not set")
        sys.exit(1)
    await bot.set_my_commands([
        BotCommand(command="start", description="Меню / привязка уведомлений"),
        BotCommand(command="search", description="Найти заказ по ID или имени"),
        BotCommand(command="dump_last", description="Последние N заказов (Excel)"),
        BotCommand(command="dump_month", description="Заказы за месяц (Excel)"),
        BotCommand(command="notifications", description="Как настроить уведомления"),
        BotCommand(command="cancel", description="Отменить действие"),
    ])
    log.info("Bot started. Admin IDs: %s", ALLOWED_USERS)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
