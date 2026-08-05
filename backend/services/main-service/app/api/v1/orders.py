import os, uuid, json, httpx
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.database import get_db
from app.models.order import Order, OrderFile

router = APIRouter(prefix="/orders", tags=["orders"])
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_IDS = os.getenv("ADMIN_IDS", "").split(",")

async def notify_bot(order_id: str, name: str, contact: str, description: str, f_count: int):
    if not BOT_TOKEN: return
    
    # Inline keyboard structure
    contact_url = f"https://t.me/{contact.replace('@','')}" if contact.startswith('@') else f"tel:{contact}"
    markup = {"inline_keyboard": [
        [{"text": "✅ Принять", "callback_data": f"accept_{order_id}"}],
        [{"text": "📞 Связаться", "url": contact_url}]
    ]}

    text = (f"🚀 {name} оставил заказ!\n\n"
            f"📞 Контакт: {contact}\n"
            f"📎 Файлов: {f_count}\n"
            f"📝 Описание: {description[:250]}...\n\n"
            f"ID: `{order_id}`")

    async with httpx.AsyncClient() as client:
        for admin_id in ADMIN_IDS:
            if not admin_id: continue
            try:
                await client.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": admin_id, "text": text, "parse_mode": "Markdown", "reply_markup": markup}
                )
            except: pass

@router.post("/create")
async def create_order(
    services: str = Form(...),
    company_name: Optional[str] = Form(None),
    naming_help: Optional[str] = Form(None),
    description: str = Form(...),
    deadline: Optional[str] = Form(None),
    budget: Optional[str] = Form(None),
    user_name: str = Form(...),
    user_contact: str = Form(...),
    user_email: Optional[str] = Form(None),
    references: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db)
):
    # services can be JSON string or single string
    try: s_list = json.loads(services)
    except: s_list = [services]

    order = Order(services=s_list, company_name=company_name, naming_help=naming_help,
                  description=description, deadline=deadline, budget=budget,
                  user_name=user_name, user_contact=user_contact, user_email=user_email,
                  references=references)
    db.add(order)
    db.flush()

    storage_base = f"storage/orders/{datetime.now().year}/{order.id}"
    os.makedirs(storage_base, exist_ok=True)
    
    saved_files = 0
    for f in files:
        if not f.filename: continue
        ext = os.path.splitext(f.filename)[1]
        path = f"{storage_base}/{uuid.uuid4()}{ext}"
        content = await f.read()
        with open(path, "wb") as buffer:
            buffer.write(content)
        db.add(OrderFile(order_id=order.id, file_path=path, filename=f.filename))
        saved_files += 1

    db.commit()
    await notify_bot(str(order.id), user_name, user_contact, description, saved_files)
    return {"status": "ok", "order_id": str(order.id)}
