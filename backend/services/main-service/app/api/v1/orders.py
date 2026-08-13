import os, json, httpx, asyncio, html
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator
import phonenumbers
from app.shared.twenty import push_to_twenty_proxy

router = APIRouter(prefix="/orders", tags=["orders"])

# ponytail: Restricted regions for international lead gen
ALLOWED_REGIONS = ["RU", "US", "BY", "KZ", "UZ", "TJ", "KG", "AE", "CN"]

class OrderValidation(BaseModel):
    user_name: str = Field(..., min_length=2)
    user_contact: str = Field(..., min_length=1)
    user_email: Optional[EmailStr] = None
    description: Optional[str] = None # ponytail: made optional as requested
    company_name: Optional[str] = None
    naming_help: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[str] = None
    services: List[str]

    @field_validator('user_contact')
    @classmethod
    def validate_phone(cls, v):
        try:
            cleaned = v.strip()
            # Standardizing CIS local formats (8 -> +7)
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

async def notify_telegram(order_data: dict, twenty_url: str):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_NOTIFY_CHAT_ID")
    if not token or not chat_id: return
    text = (
        f"🚀 <b>Новый заказ!</b>\n\n"
        f"👤 <b>Клиент:</b> {html.escape(order_data['user_name'])}\n"
        f"🛠 <b>Услуги:</b> {html.escape(', '.join(order_data['services']))}\n"
        f"💰 <b>Бюджет:</b> {html.escape(order_data.get('budget', '—'))}\n\n"
        f"🔗 <a href='{twenty_url}'><b>TWENTY CRM</b></a>"
    )
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
            )
        except Exception: pass

@router.post("/create")
async def create_order(
    services: str = Form(...),
    company_name: Optional[str] = Form(None),
    naming_help: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    deadline: Optional[str] = Form(None),
    budget: Optional[str] = Form(None),
    user_name: str = Form(...),
    user_contact: str = Form(...),
    user_email: Optional[str] = Form(None),
    files: List[UploadFile] = File([])
):
    try:
        s_list = json.loads(services)
        email = user_email.strip() if user_email and "@" in user_email else None
        valid_data = OrderValidation(
            services=s_list, company_name=company_name, naming_help=naming_help,
            description=description, deadline=deadline, budget=budget,
            user_name=user_name, user_contact=user_contact, user_email=email
        )
    except ValidationError as e:
        # map to serializable dict
        errors = [{"loc": err["loc"], "msg": str(err["msg"])} for err in e.errors()]
        raise HTTPException(status_code=422, detail=errors)

    try:
        twenty_url = await push_to_twenty_proxy(valid_data.model_dump(), files)
        asyncio.create_task(notify_telegram(valid_data.model_dump(), twenty_url))
        return {"status": "ok", "url": twenty_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
