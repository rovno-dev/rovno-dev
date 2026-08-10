import os, uuid, json, httpx, asyncio, html
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from app.models.order import Order, OrderFile

router = APIRouter(prefix="/orders", tags=["orders"])
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

def truncate(text: str, limit: int = 1000) -> str:
    if not text: return "—"
    return (text[:limit] + '...') if len(text) > limit else text

async def notify_bot(order_data: dict, file_paths: List[str]):
    if not BOT_TOKEN: return
    raw_ids = os.getenv("ADMIN_IDS") or os.getenv("TELEGRAM_BOT_ALLOWED_USERS") or ""
    admin_ids = [uid.strip() for uid in raw_ids.split(",") if uid.strip()]
    if not admin_ids: return

    services_str = ", ".join(order_data.get('services', []))
    text = (
        f"🚀 <b>Новый заказ!</b>\n\n"
        f"🆔 <b>ID:</b> <code>{order_data['id']}</code>\n"
        f"🛠 <b>Услуги:</b> {html.escape(truncate(services_str))}\n"
        f"🏢 <b>Компания:</b> {html.escape(truncate(order_data.get('company_name') or '—'))}\n"
        f"❓ <b>Нужен ли нейминг:</b> {html.escape(truncate(order_data.get('naming_help') or '—'))}\n"
        f"📝 <b>Описание:</b> {html.escape(truncate(order_data.get('description') or '—'))}\n"
        f"📅 <b>Сроки:</b> {html.escape(truncate(order_data.get('deadline') or '—'))}\n"
        f"💰 <b>Бюджет:</b> {html.escape(truncate(order_data.get('budget') or '—'))}\n\n"
        f"👤 <b>Имя:</b> {html.escape(truncate(order_data.get('user_name')))}\n"
        f"📞 <b>Контакт:</b> {html.escape(truncate(order_data.get('user_contact')))}\n"
        f"📧 <b>Email:</b> {html.escape(truncate(order_data.get('user_email') or '—'))}\n"
    )

    async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=30.0), follow_redirects=True) as client:
        for admin_id in admin_ids:
            try:
                await client.post(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                    json={"chat_id": admin_id, "text": text, "parse_mode": "HTML"}
                )
            except Exception as e:
                print(f"[ERROR] TG Notify Text Error: {str(e)}")

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
                    print(f"[ERROR] TG Notify File Error: {str(e)}")

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
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db)
):
    for f in files:
        if f.size and f.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File {f.filename} is too large")

    try: s_list = json.loads(services)
    except: s_list = [services]

    order = Order(
        services=s_list, 
        company_name=company_name, 
        naming_help=naming_help,
        description=description, 
        deadline=deadline, 
        budget=budget,
        user_name=user_name, 
        user_contact=user_contact,
        user_email=user_email
    )
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
        "user_email": user_email
    }
    asyncio.create_task(notify_bot(order_info, saved_paths))
    return {"status": "ok", "order_id": str(order.id)}
