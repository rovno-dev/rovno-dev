import uuid
import os
import json
import asyncio
import html
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import phonenumbers
import httpx
import logging
from app.models.company import Company, LifecycleStage
from app.models.contact import Contact
from app.models.order_request import OrderRequest, EstimateDeadline, EstimateBudget
from app.models.order_request_file import OrderRequestFile
from database.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["orders"])

# ponytail: Restricted regions for international lead gen
ALLOWED_REGIONS = ["RU", "US", "BY", "KZ", "UZ", "TJ", "KG", "AE", "CN"]


class OrderValidation(BaseModel):
    user_name: str = Field(..., min_length=2)
    user_phone: str = Field(..., min_length=1)
    user_telegram: Optional[str] = None
    user_email: Optional[EmailStr] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    naming_help: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[str] = None
    services: List[str]

    @field_validator("user_phone")
    @classmethod
    def validate_phone(cls, v):
        try:
            cleaned = v.strip()
            if cleaned.startswith("8") and len(cleaned) == 11:
                cleaned = "+7" + cleaned[1:]
            elif not cleaned.startswith("+"):
                cleaned = "+" + cleaned
            parsed = phonenumbers.parse(cleaned, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number format")
            region = phonenumbers.region_code_for_number(parsed)
            if region not in ALLOWED_REGIONS:
                raise ValueError(
                    f"Region {region} not supported. Use: {', '.join(ALLOWED_REGIONS)}"
                )
            return phonenumbers.format_number(
                parsed, phonenumbers.PhoneNumberFormat.E164
            )
        except Exception as e:
            raise ValueError(str(e))


async def notify_telegram(order_data: dict, order_id: str):
    """Send a Telegram notification about the new order."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_NOTIFY_CHAT_ID")
    if not token or not chat_id:
        return
    text = (
        f"🚀 <b>Новый заказ!</b>\n\n"
        f"👤 <b>Клиент:</b> {html.escape(order_data['user_name'])}\n"
        f"🛠 <b>Услуги:</b> {html.escape(', '.join(order_data['services']))}\n"
        f"💰 <b>Бюджет:</b> {html.escape(order_data.get('budget', '—'))}\n"
        f"📋 <b>ID заказа:</b> {order_id}\n"
    )
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            )
        except Exception:
            pass


@router.post("/create")
async def create_order(
    services: str = Form(...),
    company_name: Optional[str] = Form(None),
    naming_help: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    deadline: Optional[str] = Form(None),
    budget: Optional[str] = Form(None),
    user_name: str = Form(...),
    user_phone: str = Form(...),
    user_telegram: Optional[str] = Form(None),
    user_email: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
):
    # 1. Validate input
    try:
        s_list = json.loads(services)
        email = user_email.strip() if user_email and "@" in user_email else None
        valid_data = OrderValidation(
            services=s_list,
            company_name=company_name,
            naming_help=naming_help,
            description=description,
            deadline=deadline,
            budget=budget,
            user_name=user_name,
            user_phone=user_phone,
            user_telegram=user_telegram,
            user_email=email,
        )
    except ValidationError as e:
        errors = [{"loc": err["loc"], "msg": str(err["msg"])} for err in e.errors()]
        raise HTTPException(status_code=422, detail=errors)

    # 2. Company (optional, only if company_name provided)
    company = None
    if valid_data.company_name:
        company = Company(
            name=valid_data.company_name, lifecycle_stage=LifecycleStage.lead
        )
        db.add(company)
        db.flush()

    # 3. Find or create Contact — order clients are contacts, NOT users.
    # ponytail: unique constraints on phone/telegram/email mean a returning client
    # must reuse their existing contact row. Lookup-or-create across all three so
    # any match wins, and the order still records against the existing contact.
    lookup_conditions = []
    if valid_data.user_telegram:
        lookup_conditions.append(Contact.telegram_username == valid_data.user_telegram)
    if valid_data.user_phone:
        lookup_conditions.append(Contact.phone == valid_data.user_phone)
    if valid_data.user_email:
        lookup_conditions.append(Contact.email == valid_data.user_email)

    contact = None
    if lookup_conditions:
        contact = db.query(Contact).filter(or_(*lookup_conditions)).first()

    if contact:
        # fill in any fields the existing contact was missing, don't overwrite
        if company and not contact.company_id:
            contact.company_id = company.id
        contact.name = contact.name or valid_data.user_name
        contact.role_title = contact.role_title or "Order contact"
    else:
        contact = Contact(
            company_id=company.id if company else None,
            role_title="Order contact",
            phone=valid_data.user_phone,
            telegram_username=valid_data.user_telegram,
            email=valid_data.user_email,
            name=valid_data.user_name,
        )
        db.add(contact)

    # Backstop: if two concurrent requests race to create two different contacts
    # that collide on a unique field, surface a 422 instead of a 500 traceback.
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=422,
            detail="Contact with this phone, email or telegram already exists",
        )

    # 4. Create OrderRequest
    order_request = OrderRequest(
        contact_id=contact.id,
        service_types_json=valid_data.services,
        about=valid_data.description or "",
        estimate_deadline=valid_data.deadline if valid_data.deadline else None,
        estimate_budget=valid_data.budget if valid_data.budget else None,
        naming_help=valid_data.naming_help,
    )
    db.add(order_request)
    db.commit()
    db.refresh(order_request)

    # 5. Save uploaded files
    # ponytail: the filesystem path is a shared volume bind-mounted into the
    # website container at public/order_files. The DB stores the web-accessible
    # URL (/order_files/xxx), never the on-disk path, so the frontend can <img> it.
    storage_dir = os.getenv("ORDER_FILES_DIR", "/app/storage/order_files")
    os.makedirs(storage_dir, exist_ok=True)
    logger.info(
        "Order %s: received %d file(s), storage_dir=%s",
        order_request.id, len(files), storage_dir,
    )
    saved = 0
    for file in files:
        if not file.filename:
            logger.warning(
                "Order %s: skipping file with empty filename",
                order_request.id,
            )
            continue
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        disk_path = os.path.join(storage_dir, unique_name)
        content = await file.read()
        with open(disk_path, "wb") as f:
            f.write(content)
        db.add(OrderRequestFile(
            order_request_id=order_request.id,
            file_path=f"/order_files/{unique_name}",
            filename=file.filename,
        ))
        saved += 1
        logger.info(
            "Order %s: queued %s -> %s (%d bytes)",
            order_request.id, file.filename, disk_path, len(content),
        )
    db.commit()
    logger.info(
        "Order %s: committed %d file row(s) to order_request_files",
        order_request.id, saved,
    )

    asyncio.create_task(notify_telegram(valid_data.model_dump(), str(order_request.id)))
    return {"status": "ok", "order_id": str(order_request.id)}

# ponytail: serve uploaded order files. Backend wrote them, so it can read them
# back. Frontend hits this through the Next.js proxy at /order_files/<name>.
from fastapi.responses import FileResponse
import mimetypes as _mimetypes

@router.get("/files/{filename}")
async def get_order_file(filename: str):
    storage_dir = os.getenv("ORDER_FILES_DIR", "/app/storage/order_files")
    # ponytail: basename() strips any path separators — blocks traversal.
    safe = os.path.basename(filename)
    if not safe or safe != filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    full = os.path.join(storage_dir, safe)
    if not os.path.isfile(full):
        logger.warning("order file miss: %s (looked in %s)", safe, storage_dir)
        raise HTTPException(status_code=404, detail="File not found")
    media_type, _ = _mimetypes.guess_type(safe)
    return FileResponse(
        full,
        media_type=media_type or "application/octet-stream",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
