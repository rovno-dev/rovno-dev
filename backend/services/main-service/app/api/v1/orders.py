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

async def notify_bot(order_id: str, name: str, contact: str, description: str, file_paths: List[str]):
    if not BOT_TOKEN: return
    
    # Construction of plain text message to avoid 400 Bad Request formatting errors
    text = (f"🚀 Новый заказ!\n\n"
            f"👤 Имя: {name}\n"
            f"📞 Контакт: {contact}\n"
            f"📝 Описание: {description}\n\n"
            f"ID: {order_id}")

    async with httpx.AsyncClient() as client:
        for admin_id in ADMIN_IDS:
            admin_id = admin_id.strip()
            if not admin_id: continue
            
            # 1. Send Text Info
            try:
                url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
                resp = await client.post(url, json={
                    "chat_id": admin_id,
                    "text": text
                }, timeout=10.0)
                resp.raise_for_status()
            except httpx.HTTPStatusError as e:
                # ponytail: hide token by not printing the exception object which contains the URL
                print(f"[LOG] TG Text Error: Admin {admin_id} received {e.response.status_code}")
            except Exception as e:
                print(f"[LOG] TG Text Connection Error: {type(e).__name__}")

            # 2. Send Files
            for path in file_paths:
                if not os.path.exists(path): continue
                try:
                    doc_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
                    with open(path, "rb") as f:
                        resp = await client.post(
                            doc_url,
                            data={"chat_id": admin_id},
                            files={"document": f},
                            timeout=20.0
                        )
                    resp.raise_for_status()
                except Exception as e:
                    print(f"[LOG] TG File Error: Could not send {os.path.basename(path)}")

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
    
    # Notify admins with text and the actual files
    await notify_bot(str(order.id), user_name, user_contact, description, saved_paths)
    
    return {"status": "ok", "order_id": str(order.id)}
