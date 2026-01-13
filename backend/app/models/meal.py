from sqlalchemy import Column, Integer, Float, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    preferences_id = Column(Integer, ForeignKey("preferences.id"), nullable=True)

    # Full meal plan data stored as JSON
    plan_data = Column(JSON, nullable=False)

    # Calculated cost estimate
    total_cost_estimate = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="meal_plans")
    orders = relationship("Order", back_populates="meal_plan")
