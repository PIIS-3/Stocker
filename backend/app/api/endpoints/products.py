from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from ... import models
from ...api.deps import get_current_user
from ...crud import products as crud_products
from ...database import get_db
from ...models.employee import Employee

router = APIRouter()


@router.get("/", response_model=List[models.ProductTemplateResponse])
def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    products = crud_products.get_product_templates(db, skip=skip, limit=limit)
    return products
