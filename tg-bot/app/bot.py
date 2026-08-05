import os
import sys
import logging
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.markdown import hbold, hcode

# 1. Настройка логов
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 2. Загрузка переменных
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USERS_RAW = os.getenv("TELEGRAM_BOT_ALLOWED_USERS", "")

# Парсим список ID
try:
    ALLOWED_USERS = [int(uid.strip()) for uid in ALLOWED_USERS_RAW.split(",") if uid.strip()]
except ValueError:
    logger.error("TELEGRAM_BOT_ALLOWED_USERS содержит некорректные данные (не числа)!")
    sys.exit(1)

if not TOKEN or not ALLOWED_USERS:
    logger.error("BOT_TOKEN или TELEGRAM_BOT_ALLOWED_USERS не установлены!")
    sys.exit(1)

bot = Bot(token=TOKEN, parse_mode="HTML")
dp = Dispatcher()

# 3. Middleware для ограничения доступа к командам
@dp.message.outer_middleware()
async def access_middleware(handler, event, data):
    if event.from_user.id not in ALLOWED_USERS:
        return # Игнорируем всех посторонних
    return await handler(event, data)

# 4. Клавиатура управления заказом
def get_order_keyboard(order_id, contact_info):
    # Если контакт начинается с @, делаем ссылку на ТГ, иначе на телефон
    if contact_info.startswith('@'):
        contact_url = f"https://t.me/{contact_info.replace('@', '')}"
    else:
        contact_url = f"tel:{contact_info}"

    buttons = [
        [InlineKeyboardButton(text="✅ Принять", callback_data=f"accept_{order_id}")],
        [InlineKeyboardButton(text="📞 Связаться", url=contact_url)],
        [InlineKeyboardButton(text="❌ В архив", callback_data=f"archive_{order_id}")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

# 5. Команды бота
@dp.message(Command("start", "help"))
async def send_welcome(message: types.Message):
    await message.reply(
        f"🤖 {hbold('Менеджер Заказов')}\n\n"
        f"Вы в списке разрешенных пользователей ({len(ALLOWED_USERS)} чел.).\n"
        "Уведомления о новых заказах будут приходить сюда."
    )

@dp.callback_query(F.data.startswith("accept_"))
async def accept_order(callback: types.CallbackQuery):
    await callback.answer("Заказ принят!")
    # Обновляем сообщение у того, кто нажал, чтобы было видно, кто взял заказ
    await callback.message.edit_caption(
        caption=callback.message.caption + f"\n\n✅ {hbold('ПРИНЯЛ:')} {callback.from_user.first_name}",
        parse_mode="HTML"
    )

# 6. ФУНКЦИЯ РАССЫЛКИ (Вызывается вашим бэкендом)
async def broadcast_new_order(order_data: dict):
    """Отправляет уведомление всем пользователям из списка ALLOWED_USERS"""
    text = (
        f"🚀 {hbold('Новый заказ!')}\n\n"
        f"👤 {hbold('Имя:')} {order_data.get('user_name')}\n"
        f"📞 {hbold('Контакт:')} {hcode(order_data.get('user_contact'))}\n"
        f"🏢 {hbold('Компания:')} {order_data.get('company_name')}\n"
        f"🛠 {hbold('Услуги:')} {order_data.get('services')}\n"
        f"📝 {hbold('Описание:')} {order_data.get('description')}\n"
        f"💰 {hbold('Бюджет:')} {order_data.get('budget') or '—'}\n\n"
        f"ID: {hcode(order_data.get('id'))}"
    )
    
    keyboard = get_order_keyboard(order_data.get('id'), order_data.get('user_contact'))

    for user_id in ALLOWED_USERS:
        try:
            await bot.send_message(user_id, text, reply_markup=keyboard)
        except Exception as e:
            logger.error(f"Не удалось отправить сообщение пользователю {user_id}: {e}")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())