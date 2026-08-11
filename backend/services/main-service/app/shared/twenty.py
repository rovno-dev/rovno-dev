import os
import httpx
import logging
import json
from typing import List, Any, Optional
from fastapi import UploadFile

logger = logging.getLogger(__name__)

TWENTY_REST_URL = os.getenv("TWENTY_API_URL", "http://server:3000/rest")
TWENTY_PUBLIC_URL = os.getenv("SERVER_URL", "http://crm.localhost")
TWENTY_API_KEY = os.getenv("TWENTY_API_KEY")

def safe_get_id(data: Any) -> Optional[str]:
    if not isinstance(data, dict): return None
    inner = data.get("data")
    if isinstance(inner, dict): return inner.get("id")
    return data.get("id")

async def find_person_by_email(client: httpx.AsyncClient, email: str, headers: dict) -> Optional[str]:
    """Tries multiple filter formats to find a person by email."""
    # Format 1: Nested object filter
    # Format 2: Flat string filter
    # Format 3: Array search
    variants = [
        {"filter[emails][primaryEmail][eq]": email},
        {"filter[emails][some][email][eq]": email},
    ]
    
    for params in variants:
        try:
            res = await client.get(f"{TWENTY_REST_URL}/people", headers=headers, params=params)
            if res.is_success:
                data = res.json().get("data", [])
                if data and len(data) > 0:
                    return data[0].get("id")
        except: continue
    
    # Fallback: Manual scan of recent people if filters fail
    try:
        res = await client.get(f"{TWENTY_REST_URL}/people", headers=headers, params={"limit": 50})
        if res.is_success:
            for p in res.json().get("data", []):
                emails = p.get("emails")
                if isinstance(emails, dict) and emails.get("primaryEmail") == email:
                    return p.get("id")
                if isinstance(emails, list):
                    for e in emails:
                        if isinstance(e, dict) and e.get("email") == email:
                            return p.get("id")
    except: pass
    return None

async def push_to_twenty_proxy(order_data: dict, files: List[UploadFile]) -> str:
    headers = {"Authorization": f"Bearer {TWENTY_API_KEY}"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        email = order_data.get('user_email')
        person_id = await find_person_by_email(client, email, headers) if email else None

        if not person_id:
            person_payload = {
                "name": {"firstName": order_data['user_name'], "lastName": ""},
                "emails": {"primaryEmail": email} if email else None,
            }
            person_res = await client.post(f"{TWENTY_REST_URL}/people", headers=headers, json=person_payload)
            
            if person_res.is_success:
                person_id = safe_get_id(person_res.json())
            elif "duplicate" in person_res.text.lower():
                # One last try to find them if POST says they exist but GET missed them
                person_id = await find_person_by_email(client, email, headers)
            
            if not person_id:
                logger.error(f"CRM Person Error: {person_res.text}")
                person_res.raise_for_status()

        # 2. Upload Files
        twenty_file_ids = []
        for f in files:
            await f.seek(0)
            content = await f.read()
            file_res = await client.post(
                f"{TWENTY_REST_URL}/files", 
                headers=headers, 
                files={"file": (f.filename, content, f.content_type)}
            )
            if file_res.is_success:
                fid = safe_get_id(file_res.json())
                if fid: twenty_file_ids.append(fid)

        # 3. Create Opportunity
        opp_res = await client.post(
            f"{TWENTY_REST_URL}/opportunities", 
            headers=headers, 
            json={"name": f"Order: {order_data.get('company_name') or order_data['user_name']}"}
        )
        opp_res.raise_for_status()
        opp_id = safe_get_id(opp_res.json())

        # 4. Create Note (Links everything)
        note_body = (
            f"# 📝 Project Details\n\n"
            f"### 👤 Contact\n- **Name:** {order_data['user_name']}\n- **Contact:** {order_data['user_contact']}\n- **Email:** {email or '—'}\n\n"
            f"### 🛠 Services\n{', '.join(order_data['services'])}\n\n"
            f"### 💬 Description\n{order_data['description']}"
        )

        await client.post(
            f"{TWENTY_REST_URL}/notes",
            headers=headers,
            json={
                "body": note_body,
                "opportunityId": opp_id,
                "personId": person_id,
                "fileIds": twenty_file_ids
            }
        )

        return f"{TWENTY_PUBLIC_URL}/object/opportunity/{opp_id}"
