import os
import sys
import logging
import asyncio
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, CommandObject
from aiogram.types import (
    InlineKeyboardMarkup, InlineKeyboardButton, 
    ReplyKeyboardMarkup, KeyboardButton,
    FSInputFile, BotCommand
)
from aiogram.utils.markdown import hbold
from aiogram.client.default import DefaultBotProperties
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage

# 1. Config
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DB_URL = f"postgresql://{os.getenv('MAIN_DB_USER')}:{os.getenv('MAIN_DB_PASSWORD')}@{os.getenv('MAIN_DB_HOST')}:{os.getenv('MAIN_DB_PORT')}/{os.getenv('MAIN_DB_NAME')}"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode="HTML"))
dp = Dispatcher()

# 2. Keyboards
def get_main_menu():
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📊 Последние 10"), KeyboardButton(text="📅 Текущий месяц")]
        ],
        resize_keyboard=True
    )

# 3. Excel Logic
def create_excel_report(rows, filename):
    wb = Workbook()
    ws = wb.active
    ws.append(["ID", "Дата", "Клиент", "Контакт", "Бюджет", "Описание", "Изображения"])
    for i, row in enumerate(rows, start=2):
        ws.append([str(row.id), row.created_at.strftime("%d.%m.%Y"), row.user_name, row.user_contact, row.budget, row.description])
        ws.row_dimensions[i].height = 70
        with SessionLocal() as session:
            files = session.execute(text("SELECT file_path FROM order_files WHERE order_id = :id"), {"id": row.id}).fetchall()
        for idx, f in enumerate(files):
            path = f[0]
            if os.path.exists(path) and path.lower().endswith(('.png', '.jpg', '.jpeg')):
                try:
                    img = XLImage(path)
                    img.width, img.height = 80, 80
                    ws.add_image(img, ws.cell(row=i, column=7 + idx).coordinate)
                except: continue
    wb.save(filename)

# 4. Handlers
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(f"🤖 {hbold('Админ-панель Rovno.dev')}\nИспользуйте меню или команды.", reply_markup=get_main_menu())

@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    text = (
        "<b>Доступные команды:</b>\n\n"
        "/dump_last [N] - Выгрузить последние N заказов\n"
        "/dump_month [YYYY-MM] - Выгрузить заказы за месяц\n"
        "/start - Перезапустить меню"
    )
    await message.answer(text)

@dp.message(F.text == "📊 Последние 10")
@dp.message(Command("dump_last"))
async def dump_last(message: types.Message, command: CommandObject = None):
    limit = 10
    if command and command.args and command.args.isdigit():
        limit = int(command.args)
    
    with SessionLocal() as session:
        res = session.execute(text("SELECT * FROM orders ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
    
    if not res: return await message.answer("Заказов нет.")
    
    fname = f"last_{limit}_orders.xlsx"
    await message.answer("⏳ Генерирую отчет...")
    create_excel_report(res, fname)
    await message.reply_document(FSInputFile(fname), caption=f"Выгрузка: {limit} шт.")
    os.remove(fname)

@dp.message(F.text == "📅 Текущий месяц")
@dp.message(Command("dump_month"))
async def dump_month(message: types.Message, command: CommandObject = None):
    month = command.args if command and command.args else datetime.now().strftime("%Y-%m")
    with SessionLocal() as session:
        res = session.execute(text("SELECT * FROM orders WHERE to_char(created_at, 'YYYY-MM') = :m"), {"m": month}).fetchall()
    
    if not res: return await message.answer(f"За {month} ничего не найдено.")
    
    fname = f"orders_{month}.xlsx"
    create_excel_report(res, fname)
    await message.reply_document(FSInputFile(fname))
    os.remove(fname)

@dp.callback_query(F.data.startswith("accept_"))
async def accept_callback(callback: types.CallbackQuery):
    current_caption = callback.message.caption or ""
    await callback.message.edit_caption(caption=current_caption + f"\n\n✅ Взял: {callback.from_user.first_name}")
    await callback.answer("Заказ принят!")

async def main():
    # ponytail: ensure commands are registered in the global bot menu
    await bot.set_my_commands([
        BotCommand(command="start", description="Главное меню"),
        BotCommand(command="help", description="Помощь и список команд"),
        BotCommand(command="dump_last", description="Выгрузить последние N заказов"),
        BotCommand(command="dump_month", description="Выгрузить за месяц (YYYY-MM)")
    ])
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
