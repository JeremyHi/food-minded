from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Subscription fields
    plan = Column(String, default="free")  # 'free', 'pro'
    stripe_customer_id = Column(String, nullable=True)
    is_first_plan = Column(Boolean, default=True)  # For first-flow-free

    # Usage tracking
    plans_created_this_month = Column(Integer, default=0)
    last_plan_reset = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    preferences = relationship("Preferences", back_populates="user", uselist=False)
    meal_plans = relationship("MealPlan", back_populates="user")
    orders = relationship("Order", back_populates="user")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    purchases = relationship("Purchase", back_populates="user")
    payments = relationship("PaymentHistory", back_populates="user")
