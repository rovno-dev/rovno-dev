import math
import os
import uuid
import shutil
from typing import Optional, List
from fastapi import APIRouter, Path, HTTPException, status, File, UploadFile, Form
from app.models.product import Product, ProductStatus
from app.models.product_image import ProductImage
from app.models.category import Category
from app.models.user import User
from fastapi.params import Depends, Query
from app.shared.auth import get_current_user
from app.schemas.product.requests import CreateProduct, UpdateProduct
from sqlalchemy.orm import Session
from database.database import get_db
from app.schemas.product.responses import ProductResponse, ProductListResponse
from uuid import UUID
from typing import Annotated

router = APIRouter(prefix="/products", tags=["products"])

# Helper to save uploaded file and return URL
def save_uploaded_file(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    storage_dir = os.path.join(os.getcwd(), "storage", "public", "products")
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    base_url = os.getenv("STORAGE_URL", "http://localhost:8000/storage")
    return f"{base_url}/products/{filename}"

@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1),
    sort: str = Query("desc", pattern="^(asc|desc)$"),
    status: Optional[str] = Query(None),
    category_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
):
    PER_PAGE = 20

    query = db.query(Product)

    if status:
        query = query.filter(Product.status == status)
    if category_id:
        query = query.filter(Product.category_id == category_id)

    total = query.count()

    if sort == "asc":
        query = query.order_by(Product.created_at.asc())
    else:
        query = query.order_by(Product.created_at.desc())

    products = (
        query
        .offset((page - 1) * PER_PAGE)
        .limit(PER_PAGE)
        .all()
    )

    return {
        "items": [
            ProductResponse.model_validate(product)
            for product in products
        ],
        "paginate": {
            "page": page,
            "per_page": PER_PAGE,
            "total": total,
            "last_page": math.ceil(total / PER_PAGE),
        }
    }

@router.get("/{id}", response_model=ProductResponse)
async def get_product(
    id: Annotated[UUID, Path(title="uuid продукта")],
    db: Session = Depends(get_db),
):
    db_product = db.query(Product).filter(Product.id == id).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    return ProductResponse.model_validate(db_product)

@router.post("/", response_model=ProductResponse)
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    status: str = Form("draft"),
    category_id: Optional[UUID] = Form(None),
    files: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate status
    if status not in [e.value for e in ProductStatus]:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    # Validate category
    if category_id:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    # Create product
    new_product = Product(
        name=name,
        description=description,
        price=price,
        status=status or ProductStatus.DRAFT,
        category_id=category_id,
        created_by=current_user.id,
    )
    db.add(new_product)
    db.flush()

    # Upload images and create ProductImage records
    for idx, file in enumerate(files):
        if file.filename:
            image_url = save_uploaded_file(file)
            new_image = ProductImage(
                product_id=new_product.id,
                image_url=image_url,
                is_cover=(idx == 0),
                order=idx,
            )
            db.add(new_image)

    db.commit()
    db.refresh(new_product)

    return ProductResponse.model_validate(new_product)

@router.patch("/{id}", response_model=ProductResponse)
async def update_product(
    id: Annotated[UUID, Path(title="uuid продукта")],
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    status: Optional[str] = Form(None),
    category_id: Optional[UUID] = Form(None),
    files: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_product = db.query(Product).filter(Product.id == id).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    if current_user.id != db_product.created_by:
        raise HTTPException(status_code=401, detail="Доступ к данному ресурсу запрещен")

    # Validate status
    if status and status not in [e.value for e in ProductStatus]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    # Validate category
    if category_id:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")

    # Update fields
    if name is not None:
        db_product.name = name
    if description is not None:
        db_product.description = description
    if price is not None:
        db_product.price = price
    if status is not None:
        db_product.status = status
    if category_id is not None:
        db_product.category_id = category_id

    # Handle images: if new files are provided, replace all images
    if files and any(f.filename for f in files):
        # Delete existing images
        db.query(ProductImage).filter(ProductImage.product_id == db_product.id).delete()
        # Upload new files
        for idx, file in enumerate(files):
            if file.filename:
                image_url = save_uploaded_file(file)
                new_image = ProductImage(
                    product_id=db_product.id,
                    image_url=image_url,
                    is_cover=(idx == 0),
                    order=idx,
                )
                db.add(new_image)

    db.commit()
    db.refresh(db_product)

    return ProductResponse.model_validate(db_product)

@router.delete("/{id}")
async def delete_product(
    id: Annotated[UUID, Path(title="uuid продукта")],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_product = db.query(Product).filter(Product.id == id).first()

    if not db_product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    if current_user.id != db_product.created_by:
        raise HTTPException(status_code=401, detail="Доступ к данному ресурсу запрещен")

    # Cascade delete images automatically via cascade
    db.delete(db_product)
    db.commit()

    return {
        "detail": "Продукт успешно удалён"
    }
