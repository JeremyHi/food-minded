from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.diet import Preferences
from app.models.meal import MealPlan
from app.schemas.meal import MealPlanResponse, GenerateMealPlanRequest, MealPlanData
from app.services.meal_planner import generate_meal_plan
from app.utils.security import get_current_user

router = APIRouter()


@router.post("/generate", response_model=MealPlanResponse)
async def generate_new_meal_plan(
    request: GenerateMealPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new meal plan based on user preferences"""
    # Get preferences
    if request.preferences_id:
        preferences = (
            db.query(Preferences)
            .filter(
                Preferences.id == request.preferences_id,
                Preferences.user_id == current_user.id,
            )
            .first()
        )
    else:
        preferences = (
            db.query(Preferences)
            .filter(Preferences.user_id == current_user.id)
            .first()
        )

    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No preferences found. Please configure your diet preferences first.",
        )

    # Generate meal plan
    plan_data = generate_meal_plan(
        diet_type=preferences.diet_type,
        carb_pct=preferences.carb_pct,
        protein_pct=preferences.protein_pct,
        fat_pct=preferences.fat_pct,
        allergies=preferences.allergies,
        budget_min=preferences.budget_min,
        budget_max=preferences.budget_max,
        variety_level=preferences.variety_level,
        meal_days=preferences.meal_days,
        daily_calories=preferences.daily_calories,
    )

    # Save meal plan to database
    meal_plan = MealPlan(
        user_id=current_user.id,
        preferences_id=preferences.id,
        plan_data=plan_data,
        total_cost_estimate=plan_data.get("total_cost_estimate", 0.0),
    )
    db.add(meal_plan)
    db.commit()
    db.refresh(meal_plan)

    return MealPlanResponse(
        id=meal_plan.id,
        user_id=meal_plan.user_id,
        preferences_id=meal_plan.preferences_id,
        plan_data=MealPlanData(**meal_plan.plan_data),
        total_cost_estimate=meal_plan.total_cost_estimate,
        created_at=meal_plan.created_at,
    )


@router.get("/{plan_id}", response_model=MealPlanResponse)
async def get_meal_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific meal plan by ID"""
    meal_plan = (
        db.query(MealPlan)
        .filter(
            MealPlan.id == plan_id,
            MealPlan.user_id == current_user.id,
        )
        .first()
    )

    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found",
        )

    return MealPlanResponse(
        id=meal_plan.id,
        user_id=meal_plan.user_id,
        preferences_id=meal_plan.preferences_id,
        plan_data=MealPlanData(**meal_plan.plan_data),
        total_cost_estimate=meal_plan.total_cost_estimate,
        created_at=meal_plan.created_at,
    )


@router.get("/", response_model=list[MealPlanResponse])
async def list_meal_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10,
):
    """List user's meal plans (most recent first)"""
    meal_plans = (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        MealPlanResponse(
            id=mp.id,
            user_id=mp.user_id,
            preferences_id=mp.preferences_id,
            plan_data=MealPlanData(**mp.plan_data),
            total_cost_estimate=mp.total_cost_estimate,
            created_at=mp.created_at,
        )
        for mp in meal_plans
    ]
