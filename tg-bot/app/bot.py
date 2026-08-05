import os
import asyncio
import pandas as pd
from datetime import datetime
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from sqlalchemy import create_all, create_engine, select, desc, extract
from sqlalchemy.orm import sessionmaker
from backend.services.main_service.app.models.order import Order # Path hack or re-define
import sys

# Simplified model re-definition for bot to avoid complex path imports
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID, primary_key=True)
    services = Column(JSON)
    company_name = Column(String)
    description = Column(Text)
    budget = Column(String)
    user_name = Column(String)
    user_contact = Column(String)
    created_at = Column(DateTime)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_IDS = [int(i) for i in os.getenv("ADMIN_IDS", "").split(",") if i]
DB_URL = f"postgresql://{os.getenv('MAIN_DB_USER')}:{os.getenv('MAIN_DB_PASSWORD')}@{os.getenv('MAIN_DB_HOST')}:{os.getenv('MAIN_DB_PORT')}/{os.getenv('MAIN_DB_NAME')}"

bot = Bot(token=TOKEN)
dp = Dispatcher()
engine = create_engine(DB_URL)
Session = sessionmaker(bind=engine)

def is_admin(message: types.Message):
    return message.from_user.id in ADMIN_IDS

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    if not is_admin(message): return
    await message.answer("🤖 Админ-панель Rovno.dev\n\n/last10 - Последние 10 заказов\n/monthly - Отчет за месяц (XLSX)\n/dump - Полный дамп")

@dp.message(Command("last10"))
async def last_10(message: types.Message):
    if not is_admin(message): return
    with Session() as session:
        orders = session.query(Order).order_by(desc(Order.created_at)).limit(10).all()
        if not orders:
            return await message.answer("Заказов нет")
        
        resp = "📅 *Последние 10 заказов:*\n\n"
        for o in orders:
            resp += f"🔹 {o.created_at.strftime('%d.%m')} | {o.user_name} | {o.budget}\n`{o.id}`\n\n"
        await message.answer(resp, parse_mode="Markdown")

@dp.message(Command("monthly"))
async def monthly_report(message: types.Message):
    if not is_admin(message): return
    now = datetime.now()
    with Session() as session:
        orders = session.query(Order).filter(
            extract('month', Order.created_at) == now.month,
            extract('year', Order.created_at) == now.year
        ).all()
        
        if not orders: return await message.answer("В этом месяце еще нет заказов")
        
        data = []
        for o in orders:
            data.append({
                "Дата": o.created_at,
                "Услуги": ", ".join(o.services) if isinstance(o.services, list) else o.services,
                "Имя": o.user_name,
                "Контакт": o.user_contact,
                "Бюджет": o.budget,
                "Описание": o.description
            })
        
        df = pd.DataFrame(data)
        path = f"report_{now.month}_{now.year}.xlsx"
        df.to_excel(path, index=False)
        
        await message.answer_document(types.FSInputFile(path))
        os.remove(path)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
