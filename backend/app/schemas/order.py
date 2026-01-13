from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CartItem(BaseModel):
    product_id: str
    name: str
    quantity: float
    unit: str
    price: float


class CartCreate(BaseModel):
    meal_plan_id: int


class CartUpdate(BaseModel):
    items: List[CartItem]


class CartResponse(BaseModel):
    id: str
    items: List[CartItem]
    total: float


class CheckoutRequest(BaseModel):
    cart_id: str


class OrderResponse(BaseModel):
    id: int
    user_id: int
    meal_plan_id: Optional[int]
    cart_data: List[CartItem]
    status: str
    provider: str
    total: float
    created_at: datetime

    class Config:
        from_attributes = True
