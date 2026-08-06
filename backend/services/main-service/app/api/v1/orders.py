import os, uuid, json, httpx, asyncio
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.database import get_db
from app.models.order import Order, OrderFile

router = APIRouter(prefix="/orders", tags=["orders"])

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def notify_bot(order_id: str, name: str, contact: str, description: str, file_paths: List[str]):
    print(f"[DEBUG] Notification trigger for order {order_id}")
    if not BOT_TOKEN:
        print("[ERROR] TELEGRAM_BOT_TOKEN is missing!")
        return
    
    # Try to find admin IDs from both common env names
    raw_ids = os.getenv("ADMIN_IDS") or os.getenv("TELEGRAM_BOT_ALLOWED_USERS") or ""
    admin_ids = [uid.strip() for uid in raw_ids.split(",") if uid.strip()]
    
    if not admin_ids:
        print("[ERROR] No admin IDs found in ADMIN_IDS or TELEGRAM_BOT_ALLOWED_USERS")
        return

    text = (f"🚀 Новый заказ!\n\n"
            f"👤 Имя: {name}\n"
            f"📞 Контакт: {contact}\n"
            f"📝 Описание: {description}\n\n"
            f"ID: {order_id}")

    # Use a longer timeout and explicit DNS-friendly client
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        for admin_id in admin_ids:
            # 1. Send Text
            try:
                url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
                resp = await client.post(url, json={"chat_id": admin_id, "text": text})
                print(f"[DEBUG] Text to {admin_id}: {resp.status_code}")
                resp.raise_for_status()
            except Exception as e:
                print(f"[ERROR] Failed text to {admin_id}: {str(e)[:100]}")

            # 2. Send Files
            for path in file_paths:
                if not os.path.exists(path): continue
                try:
                    doc_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
                    with open(path, "rb") as f:
                        resp = await client.post(
                            doc_url,
                            data={"chat_id": admin_id},
                            files={"document": f}
                        )
                    print(f"[DEBUG] File {os.path.basename(path)} to {admin_id}: {resp.status_code}")
                except Exception as e:
                    print(f"[ERROR] Failed file to {admin_id}: {str(e)[:100]}")

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
    
    # Run notification in background so the user doesn't wait for TG API
    asyncio.create_task(notify_bot(str(order.id), user_name, user_contact, description, saved_paths))
    
    return {"status": "ok", "order_id": str(order.id)}
