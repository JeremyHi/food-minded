from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"), nullable=True)

    # Cart data stored as JSON
    cart_data = Column(JSON, nullable=False)

    # Order status: 'pending', 'confirmed', 'completed', 'cancelled'
    status = Column(String, nullable=False, default="pending")

    # Commerce provider used: 'mock', 'ucp', 'acp'
    provider = Column(String, nullable=False, default="mock")

    # Order total
    total = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    meal_plan = relationship("MealPlan", back_populates="orders")
