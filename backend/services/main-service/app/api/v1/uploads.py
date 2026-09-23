import os
import uuid
import mimetypes
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from app.shared.auth import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_DIR = os.getenv("UPLOADS_DIR", "/app/storage/uploads")
ALLOWED_IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB


@router.post("/images")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(400, "Missing filename")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(400, f"Unsupported image type: {ext}")
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(413, f"File too large (max {MAX_BYTES // 1024 // 1024} MB)")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    unique = f"{uuid.uuid4().hex}{ext}"
    disk = os.path.join(UPLOAD_DIR, unique)
    with open(disk, "wb") as f:
        f.write(content)

    url = f"/uploads/images/{unique}"
    logger.info("upload: %s -> %s (%d bytes)", file.filename, disk, len(content))
    return {"url": url, "filename": file.filename}


@router.get("/images/{filename}")
async def get_uploaded_image(filename: str):
    safe = os.path.basename(filename)
    if not safe or safe != filename:
        raise HTTPException(400, "Invalid filename")
    full = os.path.join(UPLOAD_DIR, safe)
    if not os.path.isfile(full):
        raise HTTPException(404, "Not found")
    media_type, _ = mimetypes.guess_type(safe)
    return FileResponse(
        full,
        media_type=media_type or "application/octet-stream",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
