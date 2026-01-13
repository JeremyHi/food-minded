from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Ingredient(BaseModel):
    name: str
    amount: str
    estimated_price: float


class Macros(BaseModel):
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class Meal(BaseModel):
    type: str  # breakfast, lunch, dinner, snack
    name: str
    ingredients: List[Ingredient]
    macros: Macros


class DayPlan(BaseModel):
    day: int
    meals: List[Meal]
    daily_totals: Macros


class ShoppingItem(BaseModel):
    name: str
    total_amount: str
    estimated_price: float


class MealPlanData(BaseModel):
    days: List[DayPlan]
    total_cost_estimate: float
    shopping_list: List[ShoppingItem]


class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    preferences_id: Optional[int]
    plan_data: MealPlanData
    total_cost_estimate: float
    created_at: datetime

    class Config:
        from_attributes = True


class GenerateMealPlanRequest(BaseModel):
    preferences_id: Optional[int] = None
