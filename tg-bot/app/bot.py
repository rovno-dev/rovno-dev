import os, logging, asyncio, sys
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command, CommandObject, BaseFilter
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, FSInputFile, BotCommand
from aiogram.utils.markdown import hbold
from aiogram.client.default import DefaultBotProperties
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage

# 1. Config
logging.basicConfig(level=logging.INFO)
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USERS = [int(id.strip()) for id in (os.getenv("TELEGRAM_BOT_ALLOWED_USERS") or "").split(",") if id.strip()]
DB_URL = f"postgresql://{os.getenv('MAIN_DB_USER')}:{os.getenv('MAIN_DB_PASSWORD')}@{os.getenv('MAIN_DB_HOST')}:{os.getenv('MAIN_DB_PORT')}/{os.getenv('MAIN_DB_NAME')}"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)
bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode="HTML"))
dp = Dispatcher()

# 2. Access Control
class AdminFilter(BaseFilter):
    async def __call__(self, message: types.Message) -> bool:
        return message.from_user.id in ALLOWED_USERS

# 3. Helpers
def get_main_menu():
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📊 Последние 10"), KeyboardButton(text="📅 Текущий месяц")]],
        resize_keyboard=True
    )

def create_excel_report(rows, filename):
    wb = Workbook()
    ws = wb.active
    ws.append(["ID", "Дата", "Клиент", "Контакт", "Бюджет", "Описание"])
    
    for i, row in enumerate(rows, start=2):
        # row is a tuple from session.execute(text(...))
        # SQL order: id, services, company_name, naming_help, description, deadline, budget, user_name, user_contact, user_email, references, created_at
        r_id = str(row[0])
        r_date = row[11].strftime("%d.%m.%Y") if row[11] else "—"
        r_user = row[7]
        r_contact = row[8]
        r_budget = row[6]
        r_desc = row[4]
        
        ws.append([r_id, r_date, r_user, r_contact, r_budget, r_desc])
        
        # Attach images if exists
        with SessionLocal() as session:
            files = session.execute(text("SELECT file_path FROM order_files WHERE order_id = :id"), {"id": row[0]}).fetchall()
            for idx, f in enumerate(files):
                path = f[0]
                if os.path.exists(path) and path.lower().endswith(('.png', '.jpg', '.jpeg')):
                    try:
                        img = XLImage(path)
                        img.width, img.height = 60, 60
                        ws.add_image(img, ws.cell(row=i, column=7 + idx).coordinate)
                        ws.row_dimensions[i].height = 50
                    except: continue
    wb.save(filename)
    wb.close()

# 4. Handlers
@dp.message(Command("start"), AdminFilter())
async def cmd_start(message: types.Message):
    await message.answer(f"🤖 {hbold('Админ-панель Rovno.dev')}", reply_markup=get_main_menu())

@dp.message(F.text == "📊 Последние 10", AdminFilter())
@dp.message(Command("dump_last"), AdminFilter())
async def dump_last(message: types.Message, command: CommandObject = None):
    limit = 10
    if command and command.args and command.args.isdigit(): limit = int(command.args)
    
    with SessionLocal() as session:
        res = session.execute(text("SELECT * FROM orders ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
    
    if not res: return await message.answer("Заказов нет.")
    
    fname = f"dump_last_{limit}.xlsx"
    create_excel_report(res, fname)
    await message.reply_document(FSInputFile(fname), caption=f"Выгрузка: {len(res)} шт.")
    if os.path.exists(fname): os.remove(fname)

@dp.message(F.text == "📅 Текущий месяц", AdminFilter())
@dp.message(Command("dump_month"), AdminFilter())
async def dump_month(message: types.Message, command: CommandObject = None):
    m = command.args if command and command.args else datetime.now().strftime("%Y-%m")
    with SessionLocal() as session:
        res = session.execute(text("SELECT * FROM orders WHERE to_char(created_at, 'YYYY-MM') = :m"), {"m": m}).fetchall()
    
    if not res: return await message.answer(f"За {m} ничего не найдено.")
    
    fname = f"orders_{m}.xlsx"
    create_excel_report(res, fname)
    await message.reply_document(FSInputFile(fname))
    if os.path.exists(fname): os.remove(fname)

async def main():
    await bot.set_my_commands([
        BotCommand(command="start", description="Меню"),
        BotCommand(command="dump_last", description="Последние N заказов"),
        BotCommand(command="dump_month", description="За месяц (YYYY-MM)")
    ])
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
