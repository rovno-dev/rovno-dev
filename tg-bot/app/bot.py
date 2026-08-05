import os
import sys
import logging
import asyncio
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, FSInputFile, BotCommand
from aiogram.utils.markdown import hbold
from aiogram.client.default import DefaultBotProperties
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage

# 1. Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USERS = [int(uid.strip()) for uid in os.getenv("TELEGRAM_BOT_ALLOWED_USERS", "").split(",") if uid.strip()]

DB_URL = f"postgresql://{os.getenv('MAIN_DB_USER')}:{os.getenv('MAIN_DB_PASSWORD')}@{os.getenv('MAIN_DB_HOST')}:{os.getenv('MAIN_DB_PORT')}/{os.getenv('MAIN_DB_NAME')}"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)

bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode="HTML"))
dp = Dispatcher()

# 2. Excel Logic (No Pandas)
def generate_report(rows, filename):
    wb = Workbook()
    ws = wb.active
    headers = ["ID", "Created At", "Name", "Contact", "Budget", "Description", "Images"]
    ws.append(headers)

    for i, row in enumerate(rows, start=2):
        # row is a result of db.execute
        ws.append([str(row.id), row.created_at.strftime("%Y-%m-%d"), row.user_name, row.user_contact, row.budget, row.description])
        
        # Add images from local storage
        with SessionLocal() as session:
            files = session.execute(text("SELECT file_path FROM order_files WHERE order_id = :id"), {"id": row.id}).fetchall()
        
        for idx, f in enumerate(files):
            path = f[0]
            if os.path.exists(path) and path.lower().endswith(('.png', '.jpg', '.jpeg')):
                try:
                    img = XLImage(path)
                    img.width, img.height = 70, 70
                    # Place images in columns starting from 'G'
                    ws.add_image(img, ws.cell(row=i, column=7 + idx).coordinate)
                except: continue
        ws.row_dimensions[i].height = 60

    wb.save(filename)

# 3. Handlers
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(f"🤖 {hbold('Rovno.dev Admin')}\n\n/dump_last [N]\n/dump_month [YYYY-MM]")

@dp.message(Command("dump_last"))
async def dump_last(message: types.Message, command: CommandObject):
    limit = int(command.args) if command.args and command.args.isdigit() else 10
    with SessionLocal() as session:
        res = session.execute(text("SELECT * FROM orders ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
    
    if not res: return await message.answer("Заказов нет.")
    
    fname = f"last_{limit}_orders.xlsx"
    generate_report(res, fname)
    await message.reply_document(FSInputFile(fname), caption=f"Последние {limit} заказов")
    os.remove(fname)

@dp.message(Command("dump_month"))
async def dump_month(message: types.Message, command: CommandObject):
    month = command.args if command.args else datetime.now().strftime("%Y-%m")
    with SessionLocal() as session:
        res = session.execute(text("SELECT * FROM orders WHERE to_char(created_at, 'YYYY-MM') = :m"), {"m": month}).fetchall()

    if not res: return await message.answer(f"Нет данных за {month}")
    
    fname = f"orders_{month}.xlsx"
    generate_report(res, fname)
    await message.reply_document(FSInputFile(fname))
    os.remove(fname)

@dp.callback_query(F.data.startswith("accept_"))
async def accept_callback(callback: types.CallbackQuery):
    await callback.message.edit_caption(caption=callback.message.caption + f"\n\n✅ Взял: {callback.from_user.first_name}")
    await callback.answer()

async def main():
    # Set command menu
    await bot.set_my_commands([
        BotCommand(command="dump_last", description="Последние N заказов"),
        BotCommand(command="dump_month", description="Заказы за месяц (YYYY-MM)")
    ])
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
