import uuid
import os
import json
import secrets
import asyncio
import html
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator
from sqlalchemy.orm import Session
import phonenumbers
from app.models.user import User, UserRole, UserStatus
from app.models.company import Company, LifecycleStage
from app.models.contact import Contact
from app.models.order_request import OrderRequest, EstimateDeadline, EstimateBudget
from app.models.order_request_file import OrderRequestFile
from app.shared.auth import hash_password
from database.database import get_db

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

    @field_validator('user_phone')
    @classmethod
    def validate_phone(cls, v):
        try:
            cleaned = v.strip()
            if cleaned.startswith('8') and len(cleaned) == 11:
                cleaned = '+7' + cleaned[1:]
            elif not cleaned.startswith('+'):
                cleaned = '+' + cleaned
            parsed = phonenumbers.parse(cleaned, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number format")
            region = phonenumbers.region_code_for_number(parsed)
            if region not in ALLOWED_REGIONS:
                raise ValueError(f"Region {region} not supported. Use: {', '.join(ALLOWED_REGIONS)}")
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
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
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
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
    db: Session = Depends(get_db)
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
            user_email=email
        )
    except ValidationError as e:
        errors = [{"loc": err["loc"], "msg": str(err["msg"])} for err in e.errors()]
        raise HTTPException(status_code=422, detail=errors)

    # 2. Find or create User
    user = None
    if valid_data.user_email:
        user = db.query(User).filter(User.email == valid_data.user_email).first()
    if not user:
        # Create a new user with a random password
        random_pass = secrets.token_urlsafe(16)
        hashed = hash_password(random_pass)
        user = User(
            email=valid_data.user_email or "",
            password=hashed,
            name=valid_data.user_name,
            surname="",
            user_role=UserRole.client,
            user_status=UserStatus.pending_verification,
            verified=False,
            blocked=False,
            phone=valid_data.user_phone  # store phone on user too
        )
        db.add(user)
        db.flush()  # get user.id

    # 3. Create Company (if company_name provided)
    company = None
    if valid_data.company_name:
        company = Company(
            name=valid_data.company_name,
            lifecycle_stage=LifecycleStage.lead
        )
        db.add(company)
        db.flush()

    # 4. Create Contact with phone and telegram fields
    contact = Contact(
        user_id=user.id,
        company_id=company.id if company else None,
        role_title="Order contact",
        phone=valid_data.user_phone,
        telegram_username=valid_data.user_telegram,
        email=valid_data.user_email,  # store email on contact as well
        name=valid_data.user_name
    )
    db.add(contact)
    db.flush()

    # 5. Create OrderRequest
    order_request = OrderRequest(
        contact_id=contact.id,
        service_types_json=valid_data.services,
        about=valid_data.description or "",
        estimate_deadline=valid_data.deadline if valid_data.deadline else None,
        estimate_budget=valid_data.budget if valid_data.budget else None,
        naming_help=valid_data.naming_help
    )
    db.add(order_request)
    db.commit()
    db.refresh(order_request)

    # 6. Save uploaded files
    storage_path = os.getenv("STORAGE_PATH", "./storage/order_files")
    os.makedirs(storage_path, exist_ok=True)
    for file in files:
        if file.filename:
            file_path = os.path.join(storage_path, f"{uuid.uuid4()}_{file.filename}")
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            order_file = OrderRequestFile(
                order_request_id=order_request.id,
                file_path=file_path,
                filename=file.filename
            )
            db.add(order_file)
    db.commit()

    asyncio.create_task(notify_telegram(valid_data.model_dump(), str(order_request.id)))
    return {"status": "ok", "order_id": str(order_request.id)}
