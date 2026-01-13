from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.diet import Preferences
from app.schemas.diet import (
    DietType,
    Allergy,
    PreferencesCreate,
    PreferencesResponse,
    DietTypesResponse,
    AllergiesResponse,
)
from app.utils.security import get_current_user

router = APIRouter()

# Diet types configuration
DIET_TYPES = {
    "40-30-30": DietType(
        id="40-30-30",
        name="Zone Diet (40/30/30)",
        description="Balanced macro distribution for sustained energy and blood sugar control",
        carb_pct=40,
        protein_pct=30,
        fat_pct=30,
    ),
    "keto": DietType(
        id="keto",
        name="Ketogenic",
        description="Very low carb, high fat diet for ketosis and fat burning",
        carb_pct=5,
        protein_pct=25,
        fat_pct=70,
    ),
    "balanced": DietType(
        id="balanced",
        name="Balanced",
        description="Moderate distribution following standard dietary guidelines",
        carb_pct=50,
        protein_pct=25,
        fat_pct=25,
    ),
    "high-protein": DietType(
        id="high-protein",
        name="High Protein",
        description="Elevated protein for muscle building and recovery",
        carb_pct=30,
        protein_pct=40,
        fat_pct=30,
    ),
    "low-carb": DietType(
        id="low-carb",
        name="Low Carb",
        description="Reduced carbohydrates for weight management",
        carb_pct=20,
        protein_pct=35,
        fat_pct=45,
    ),
    "mediterranean": DietType(
        id="mediterranean",
        name="Mediterranean",
        description="Heart-healthy diet rich in olive oil, fish, and vegetables",
        carb_pct=45,
        protein_pct=20,
        fat_pct=35,
    ),
}

# Allergies configuration
ALLERGIES = [
    Allergy(id="tree_nut", name="Tree Nuts", examples="almonds, walnuts, cashews, pecans"),
    Allergy(id="peanut", name="Peanuts", examples="peanut butter, peanut oil"),
    Allergy(id="dairy", name="Dairy", examples="milk, cheese, yogurt, butter"),
    Allergy(id="egg", name="Eggs", examples="whole eggs, mayonnaise, baked goods"),
    Allergy(id="wheat", name="Wheat/Gluten", examples="bread, pasta, flour, cereals"),
    Allergy(id="soy", name="Soy", examples="tofu, soy sauce, edamame, soy milk"),
    Allergy(id="fish", name="Fish", examples="salmon, tuna, cod, sardines"),
    Allergy(id="shellfish", name="Shellfish", examples="shrimp, crab, lobster, mussels"),
]


@router.get("/types", response_model=DietTypesResponse)
async def get_diet_types():
    """Get all available diet types"""
    return DietTypesResponse(types=list(DIET_TYPES.values()))


@router.get("/allergies", response_model=AllergiesResponse)
async def get_allergies():
    """Get all allergy options"""
    return AllergiesResponse(allergies=ALLERGIES)


@router.post("/preferences", response_model=PreferencesResponse)
async def save_preferences(
    prefs: PreferencesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save or update user diet preferences"""
    # Get macro values from diet type if not provided
    diet_type = DIET_TYPES.get(prefs.diet_type)
    if not diet_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid diet type: {prefs.diet_type}",
        )

    carb_pct = prefs.carb_pct if prefs.carb_pct is not None else diet_type.carb_pct
    protein_pct = prefs.protein_pct if prefs.protein_pct is not None else diet_type.protein_pct
    fat_pct = prefs.fat_pct if prefs.fat_pct is not None else diet_type.fat_pct

    # Validate macros sum to 100
    if carb_pct + protein_pct + fat_pct != 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Macro percentages must sum to 100",
        )

    # Validate allergies
    valid_allergy_ids = {a.id for a in ALLERGIES}
    for allergy_id in prefs.allergies:
        if allergy_id not in valid_allergy_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid allergy: {allergy_id}",
            )

    # Check for existing preferences
    existing = db.query(Preferences).filter(Preferences.user_id == current_user.id).first()

    if existing:
        # Update existing
        existing.diet_type = prefs.diet_type
        existing.carb_pct = carb_pct
        existing.protein_pct = protein_pct
        existing.fat_pct = fat_pct
        existing.allergies = prefs.allergies
        existing.budget_min = prefs.budget_min
        existing.budget_max = prefs.budget_max
        existing.variety_level = prefs.variety_level
        existing.meal_days = prefs.meal_days
        existing.daily_calories = prefs.daily_calories
        db.commit()
        db.refresh(existing)
        return PreferencesResponse.model_validate(existing)
    else:
        # Create new
        preferences = Preferences(
            user_id=current_user.id,
            diet_type=prefs.diet_type,
            carb_pct=carb_pct,
            protein_pct=protein_pct,
            fat_pct=fat_pct,
            allergies=prefs.allergies,
            budget_min=prefs.budget_min,
            budget_max=prefs.budget_max,
            variety_level=prefs.variety_level,
            meal_days=prefs.meal_days,
            daily_calories=prefs.daily_calories,
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
        return PreferencesResponse.model_validate(preferences)


@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's diet preferences"""
    preferences = db.query(Preferences).filter(Preferences.user_id == current_user.id).first()

    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No preferences found. Please configure your diet preferences first.",
        )

    return PreferencesResponse.model_validate(preferences)
