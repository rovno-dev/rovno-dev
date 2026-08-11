import os
import httpx
import logging
from typing import List
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Fixed: Twenty internal REST API path is usually /rest
TWENTY_REST_URL = os.getenv("TWENTY_API_URL", "http://server:3000/rest")
TWENTY_PUBLIC_URL = os.getenv("SERVER_URL", "http://crm.localhost")
TWENTY_API_KEY = os.getenv("TWENTY_API_KEY")

async def push_to_twenty_proxy(order_data: dict, files: List[UploadFile]) -> str:
    headers = {"Authorization": f"Bearer {TWENTY_API_KEY}"}

    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1. Create Person
        person_res = await client.post(
            f"{TWENTY_REST_URL}/people",
            headers=headers,
            json={
                "name": {"firstName": order_data['user_name'], "lastName": ""},
                "emails": {"primaryEmail": order_data.get('user_email')},
                "phones": {"primaryPhone": order_data['user_contact']}
            }
        )
        person_res.raise_for_status() # Trigger error if 404/500
        person_id = person_res.json().get('data', {}).get('id')

        # 2. Upload Files (Directly from memory)
        twenty_file_ids = []
        for f in files:
            await f.seek(0) # Reset pointer
            content = await f.read()
            upload_files = {"file": (f.filename, content, f.content_type)}
            file_res = await client.post(f"{TWENTY_REST_URL}/files", headers=headers, files=upload_files)
            if file_res.is_success:
                fid = file_res.json().get('data', {}).get('id')
                if fid: twenty_file_ids.append(fid)

        # 3. Create Opportunity
        formatted_desc = (
            f"### 🛠 Services\n{', '.join(order_data['services'])}\n\n"
            f"### 📋 Details\n"
            f"- **Budget:** {order_data.get('budget', '—')}\n"
            f"- **Deadline:** {order_data.get('deadline', '—')}\n"
            f"- **Naming Help:** {order_data.get('naming_help', '—')}\n\n"
            f"### 📝 Project Description\n{order_data['description']}"
        )

        opportunity_payload = {
            "name": f"Order: {order_data.get('company_name') or order_data['user_name']}",
            "description": formatted_desc,
            "personId": person_id,
        }
        
        opp_res = await client.post(f"{TWENTY_REST_URL}/opportunities", headers=headers, json=opportunity_payload)
        opp_res.raise_for_status()
        opp_id = opp_res.json().get('data', {}).get('id')

        # 4. Link files via a Note
        if twenty_file_ids and opp_id:
            await client.post(
                f"{TWENTY_REST_URL}/notes",
                headers=headers,
                json={
                    "body": "📎 Attachments from Website Form",
                    "opportunityId": opp_id,
                    "fileIds": twenty_file_ids
                }
            )

        return f"{TWENTY_PUBLIC_URL}/object/opportunity/{opp_id}"