import os
import httpx
import logging
from typing import List, Any, Optional
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Twenty internal REST API path
TWENTY_REST_URL = os.getenv("TWENTY_API_URL", "http://server:3000/rest")
TWENTY_PUBLIC_URL = os.getenv("SERVER_URL", "http://crm.localhost")
TWENTY_API_KEY = os.getenv("TWENTY_API_KEY")

def safe_get_id(data: Any) -> Optional[str]:
    """Extremely safe ID extraction from various Twenty response shapes."""
    if not isinstance(data, dict):
        return None
    inner = data.get("data")
    if isinstance(inner, dict):
        return str(inner.get("id")) if inner.get("id") else None
    obj_id = data.get("id")
    return str(obj_id) if obj_id else None

async def push_to_twenty_proxy(order_data: dict, files: List[UploadFile]) -> str:
    headers = {"Authorization": f"Bearer {TWENTY_API_KEY}"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        person_id = None
        email = (order_data.get('user_email') or "").lower().strip()

        # 1. Person Logic: Find or Create
        # First, try to find by email using the exact filter syntax for Twenty
        if email:
            try:
                # filter[emails][primaryEmail][eq] is the standard REST filter for Twenty
                search_res = await client.get(
                    f"{TWENTY_REST_URL}/people", 
                    headers=headers, 
                    params={"filter[emails][primaryEmail][eq]": email}
                )
                if search_res.is_success:
                    results = search_res.json().get("data", [])
                    if results and len(results) > 0:
                        person_id = str(results[0].get("id"))
                        logger.info(f"Found existing person via filter: {person_id}")
            except Exception as e:
                logger.warning(f"Initial search failed: {e}")

        # If not found via filter, try creating
        if not person_id:
            person_payload = {
                "name": {"firstName": order_data['user_name'], "lastName": ""},
                "emails": {"primaryEmail": email} if email else None,
            }
            person_res = await client.post(f"{TWENTY_REST_URL}/people", headers=headers, json=person_payload)
            
            if person_res.is_success:
                person_id = safe_get_id(person_res.json())
            elif person_res.status_code == 400 and "duplicate" in person_res.text.lower():
                # If POST says duplicate but GET missed it, perform an exhaustive scan
                logger.info(f"Duplicate detected but not filtered. Scanning all...")
                scan_res = await client.get(f"{TWENTY_REST_URL}/people", headers=headers, params={"limit": 200})
                if scan_res.is_success:
                    for p in scan_res.json().get("data", []):
                        if not isinstance(p, dict): continue
                        p_emails = str(p.get("emails", "")).lower()
                        if email in p_emails:
                            person_id = str(p.get("id"))
                            break
            else:
                logger.error(f"CRM Person creation failed: {person_res.text}")
                person_res.raise_for_status()

        if not person_id:
            raise ValueError(f"CRM Sync Error: Could not resolve person for {email}")

        # 2. Upload Files
        twenty_file_ids = []
        for f in files:
            try:
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
            except Exception as e:
                logger.warning(f"File upload error: {e}")

        # 3. Create Opportunity
        opp_res = await client.post(
            f"{TWENTY_REST_URL}/opportunities", 
            headers=headers, 
            json={"name": f"Order: {order_data.get('company_name') or order_data['user_name']}"}
        )
        opp_res.raise_for_status()
        opp_id = safe_get_id(opp_res.json())

        # 4. Create Note (The detailed summary)
        note_body = (
            f"# 📝 Project Details\n\n"
            f"### 👤 Contact\n"
            f"- **Name:** {order_data['user_name']}\n"
            f"- **Method:** {order_data['user_contact']}\n"
            f"- **Email:** {email or '—'}\n\n"
            f"### 🛠 Services\n{', '.join(order_data['services'])}\n\n"
            f"### 📋 Details\n"
            f"- **Budget:** {order_data.get('budget', '—')}\n"
            f"- **Deadline:** {order_data.get('deadline', '—')}\n"
            f"- **Naming:** {order_data.get('naming_help', '—')}\n\n"
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
