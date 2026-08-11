import os, json, httpx, asyncio, html
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, EmailStr, Field, ValidationError
from app.shared.twenty import push_to_twenty_proxy

router = APIRouter(prefix="/orders", tags=["orders"])

# ponytail: Validation schema for incoming form data
class OrderValidation(BaseModel):
    user_name: str = Field(..., min_length=2)
    user_contact: str = Field(..., min_length=1)
    user_email: Optional[EmailStr] = None
    description: str = Field(..., min_length=10)
    company_name: Optional[str] = None
    naming_help: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[str] = None
    services: List[str]

async def notify_telegram(order_data: dict, twenty_url: str):
    """
    Sends a summary and the CRM link to the configured Telegram chat.
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_NOTIFY_CHAT_ID")
    if not token or not chat_id:
        return
    
    text = (
        f"🚀 <b>Новый заказ в CRM!</b>\n\n"
        f"👤 <b>Клиент:</b> {html.escape(order_data['user_name'])}\n"
        f"🛠 <b>Услуги:</b> {html.escape(', '.join(order_data['services']))}\n"
        f"💰 <b>Бюджет:</b> {html.escape(order_data.get('budget', '—'))}\n\n"
        f"🔗 <a href='{twenty_url}'><b>ОТКРЫТЬ В TWENTY CRM</b></a>"
    )
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
            )
        except Exception as e:
            print(f"[ERROR] TG Notify Failed: {e}")

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
    files: List[UploadFile] = File([])
):
    """
    Proxy endpoint: Validates data and uploads everything to Twenty CRM.
    No local database storage used.
    """
    # 1. Parse and Validate
    try:
        s_list = json.loads(services)
        # Handle empty strings from frontend for optional EmailStr
        email = user_email.strip() if user_email and "@" in user_email else None
        
        valid_data = OrderValidation(
            services=s_list,
            company_name=company_name,
            naming_help=naming_help,
            description=description,
            deadline=deadline,
            budget=budget,
            user_name=user_name,
            user_contact=user_contact,
            user_email=email
        )
    except ValidationError as e:
        # Returns structured errors for frontend parsing
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=e.errors()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=[{"msg": "Invalid data format", "loc": ["body"]}]
        )

    # 2. Proxy to Twenty
    try:
        # We await proxy completion to ensure files and records are created
        twenty_url = await push_to_twenty_proxy(valid_data.model_dump(), files)
        
        # 3. Trigger notification in background
        asyncio.create_task(notify_telegram(valid_data.model_dump(), twenty_url))
        
        return {"status": "ok", "url": twenty_url}

    except httpx.HTTPStatusError as e:
        print(f"CRM API ERROR: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="CRM service returned an error."
        )
    except Exception as e:
        print(f"PROXY ERROR: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error during CRM sync."
        )
