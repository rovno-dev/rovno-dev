import os, uuid, json, httpx, asyncio, html
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.database import get_db
from app.models.order import Order, OrderFile

router = APIRouter(prefix="/orders", tags=["orders"])

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def notify_bot(order_data: dict, file_paths: List[str]):
    if not BOT_TOKEN: return
    
    raw_ids = os.getenv("ADMIN_IDS") or os.getenv("TELEGRAM_BOT_ALLOWED_USERS") or ""
    admin_ids = [uid.strip() for uid in raw_ids.split(",") if uid.strip()]
    if not admin_ids: return

    # Constructing detailed HTML message
    # We use html.escape to prevent user input from breaking the Telegram API
    services_str = ", ".join(order_data.get('services', []))
    
    text = (
        f"🚀 <b>Новый заказ!</b>\n\n"
        f"🆔 <b>ID:</b> <code>{order_data['id']}</code>\n"
        f"🛠 <b>Услуги:</b> {html.escape(services_str)}\n"
        f"🏢 <b>Наименование компании:</b> {html.escape(order_data.get('company_name') or '—')}\n"
        f"❓ <b>Нужен ли нейминг:</b> {html.escape(order_data.get('naming_help') or '—')}\n"
        f"📝 <b>Описание:</b> {html.escape(order_data.get('description') or '—')}\n"
        f"📅 <b>Ориентировочные сроки:</b> {html.escape(order_data.get('deadline') or '—')}\n"
        f"💰 <b>Ориентировочный бюджет:</b> {html.escape(order_data.get('budget') or '—')}\n\n"
        f"👤 <b>Имя заказчика:</b> {html.escape(order_data['user_name'])}\n"
        f"📞 <b>Контакт:</b> {html.escape(order_data['user_contact'])}\n"
    )

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        for admin_id in admin_ids:
            # 1. Send Full Text
            try:
                await client.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": admin_id, "text": text, "parse_mode": "HTML"}
                )
            except Exception as e:
                print(f"[ERROR] TG Notify Text Error: {str(e)[:100]}")

            # 2. Send Files
            for path in file_paths:
                if not os.path.exists(path): continue
                try:
                    with open(path, "rb") as f:
                        await client.post(
                            f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument",
                            data={"chat_id": admin_id, "caption": f"Файл к заказу {order_data['id']}"},
                            files={"document": f}
                        )
                except Exception as e:
                    print(f"[ERROR] TG Notify File Error: {str(e)[:100]}")

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
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db)
):
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
    
    saved_paths = []
    for f in files:
        if not f.filename: continue
        path = f"{storage_base}/{uuid.uuid4()}{os.path.splitext(f.filename)[1]}"
        content = await f.read()
        with open(path, "wb") as buf:
            buf.write(content)
        db.add(OrderFile(order_id=order.id, file_path=path, filename=f.filename))
        saved_paths.append(path)
    
    db.commit()
    
    # Prepare data for background task
    order_info = {
        "id": str(order.id),
        "services": s_list,
        "company_name": company_name,
        "naming_help": naming_help,
        "description": description,
        "deadline": deadline,
        "budget": budget,
        "user_name": user_name,
        "user_contact": user_contact,
        "user_email": user_email,
        "references": references
    }
    
    asyncio.create_task(notify_bot(order_info, saved_paths))
    
    return {"status": "ok", "order_id": str(order.id)}
