import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from app.models.order import Order, OrderFile
import httpx
import json

router = APIRouter(prefix="/orders", tags=["orders"])

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_IDS = os.getenv("ADMIN_IDS", "").split(",")

async def notify_bot(order_id: str, name: str, contact: str, description: str):
    if not BOT_TOKEN: return
    text = f"🚀 *Новый заказ!*\n\n👤 *Имя:* {name}\n📞 *Контакт:* {contact}\n📝 *Описание:* {description[:200]}...\n\nID: `{order_id}`"
    async with httpx.AsyncClient() as client:
        for admin_id in ADMIN_IDS:
            if not admin_id: continue
            try:
                await client.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", 
                    json={"chat_id": admin_id, "text": text, "parse_mode": "Markdown"})
            except: pass

@router.post("/create")
async def create_order(
    services: str = Form(...), # JSON string
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
    try:
        services_list = json.loads(services)
    except:
        services_list = [services]

    order = Order(
        services=services_list,
        company_name=company_name,
        naming_help=naming_help,
        description=description,
        deadline=deadline,
        budget=budget,
        user_name=user_name,
        user_contact=user_contact,
        user_email=user_email,
        references=references
    )
    db.add(order)
    db.flush()

    year = datetime.now().year
    storage_base = f"storage/orders/{year}/{order.id}"
    os.makedirs(storage_base, exist_ok=True)

    for f in files:
        if not f.filename: continue
        file_id = uuid.uuid4()
        ext = os.path.splitext(f.filename)[1]
        path = f"{storage_base}/{file_id}{ext}"
        with open(path, "wb") as buffer:
            buffer.write(await f.read())
        
        db.add(OrderFile(order_id=order.id, file_path=path, filename=f.filename))

    db.commit()
    await notify_bot(str(order.id), user_name, user_contact, description)
    return {"status": "ok", "order_id": str(order.id)}
