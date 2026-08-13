import os, httpx, logging, time, json
from typing import List, Optional, Any
from fastapi import UploadFile

logger = logging.getLogger(__name__)

TWENTY_REST_URL = os.getenv("TWENTY_API_URL", "http://server:3000/rest")
TWENTY_API_KEY = os.getenv("TWENTY_API_KEY")

def safe_get_id(res_json: Any) -> Optional[str]:
    if not res_json or not isinstance(res_json, dict): return None
    data = res_json.get("data")
    if isinstance(data, dict): return str(data.get("id"))
    if isinstance(data, list) and len(data) > 0: return str(data[0].get("id"))
    return str(res_json.get("id")) if res_json.get("id") else None

async def push_to_twenty_proxy(order_data: dict, files: List[UploadFile]) -> str:
    headers = {"Authorization": f"Bearer {TWENTY_API_KEY}"}
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1. PERSON
        person_id = None
        email = (order_data.get('user_email') or "").lower().strip()
        if email:
            try:
                res = await client.get(f"{TWENTY_REST_URL}/people", headers=headers, params={"filter[emails][primaryEmail][eq]": email})
                person_id = safe_get_id(res.json())
            except Exception: pass
        
        if not person_id:
            p_res = await client.post(f"{TWENTY_REST_URL}/people", headers=headers, json={
                "name": {"firstName": order_data['user_name'], "lastName": "(Web)"},
                "emails": {"primaryEmail": email} if email else None,
                "phones": {"primaryPhone": order_data['user_contact']}
            })
            person_id = safe_get_id(p_res.json())

        # 2. OPPORTUNITY
        # ponytail: If amount object causes 400, fallback to plain name and move data to Note
        opp_payload = {
            "name": f"Project: {order_data.get('company_name') or order_data['user_name']}"
        }
        if person_id:
            opp_payload["pointOfContactId"] = person_id

        opp_res = await client.post(f"{TWENTY_REST_URL}/opportunities", headers=headers, json=opp_payload)
        
        # Fallback for complex relation/amount errors
        if not opp_res.is_success:
            logger.warning(f"Opp creation failed, retrying minimal: {opp_res.text}")
            opp_res = await client.post(f"{TWENTY_REST_URL}/opportunities", headers=headers, json={
                "name": f"Deal: {order_data.get('company_name') or order_data['user_name']}"
            })
            
        opp_id = safe_get_id(opp_res.json())
        if not opp_id:
            raise Exception(f"CRM Opportunity Error: {opp_res.text}")

        # 3. NOTE (Probing for correct field name: content vs body)
        note_text = (
            f"### 🚀 New Website Order\n\n"
            f"**Services:** {', '.join(order_data['services'])}\n"
            f"**Budget:** {order_data.get('budget', '—')}\n"
            f"**Deadline:** {order_data.get('deadline', '—')}\n"
            f"**Naming:** {order_data.get('naming_help', '—')}\n\n"
            f"**Description:**\n{order_data.get('description') or 'No description provided.'}"
        )
        
        # ponytail: try 'content' first, fallback to 'body'
        n_res = await client.post(f"{TWENTY_REST_URL}/notes", headers=headers, json={
            "content": note_text,
            "opportunityId": opp_id
        })
        if not n_res.is_success:
            logger.warning(f"Note 'content' failed, trying 'body': {n_res.text}")
            await client.post(f"{TWENTY_REST_URL}/notes", headers=headers, json={
                "body": note_text,
                "opportunityId": opp_id
            })

        # 4. FILES (Correcting Multipart for /rest/files)
        for f in files:
            try:
                f_bytes = await f.read()
                # ponytail: field name MUST be 'file'. Ensure no manual Content-Type in headers.
                f_res = await client.post(
                    f"{TWENTY_REST_URL}/files", 
                    headers={"Authorization": f"Bearer {TWENTY_API_KEY}"},
                    files={"file": (f.filename, f_bytes, f.content_type)}
                )
                
                file_id = safe_get_id(f_res.json())
                if file_id:
                    await client.post(f"{TWENTY_REST_URL}/attachments", headers=headers, json={
                        "opportunityId": opp_id,
                        "fileId": file_id
                    })
                else:
                    logger.error(f"File upload fail: {f_res.text}")
            except Exception as e:
                logger.error(f"File process error: {e}")
            finally:
                await f.seek(0)

        server_url = os.getenv("SERVER_URL", "http://crm.localhost")
        return f"{server_url}/object/opportunity/{opp_id}"
