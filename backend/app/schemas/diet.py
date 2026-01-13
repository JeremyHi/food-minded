from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime


class DietType(BaseModel):
    id: str
    name: str
    description: str
    carb_pct: int
    protein_pct: int
    fat_pct: int


class Allergy(BaseModel):
    id: str
    name: str
    examples: str


class DietTypesResponse(BaseModel):
    types: List[DietType]


class AllergiesResponse(BaseModel):
    allergies: List[Allergy]


class PreferencesCreate(BaseModel):
    diet_type: str
    carb_pct: Optional[int] = None
    protein_pct: Optional[int] = None
    fat_pct: Optional[int] = None
    allergies: List[str] = []
    budget_min: int = 50
    budget_max: int = 150
    variety_level: str = "moderate"
    meal_days: int = 7
    daily_calories: int = 2000

    @field_validator("variety_level")
    @classmethod
    def validate_variety(cls, v: str) -> str:
        if v not in ["minimal", "moderate", "high"]:
            raise ValueError("variety_level must be 'minimal', 'moderate', or 'high'")
        return v

    @field_validator("meal_days")
    @classmethod
    def validate_days(cls, v: int) -> int:
        if v < 1 or v > 14:
            raise ValueError("meal_days must be between 1 and 14")
        return v

    @field_validator("budget_min", "budget_max")
    @classmethod
    def validate_budget(cls, v: int) -> int:
        if v < 0 or v > 1000:
            raise ValueError("budget must be between 0 and 1000")
        return v


class PreferencesResponse(BaseModel):
    id: int
    user_id: int
    diet_type: str
    carb_pct: int
    protein_pct: int
    fat_pct: int
    allergies: List[str]
    budget_min: int
    budget_max: int
    variety_level: str
    meal_days: int
    daily_calories: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
