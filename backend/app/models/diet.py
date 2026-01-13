from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Diet configuration
    diet_type = Column(String, nullable=False, default="40-30-30")
    carb_pct = Column(Integer, nullable=False, default=40)
    protein_pct = Column(Integer, nullable=False, default=30)
    fat_pct = Column(Integer, nullable=False, default=30)

    # Allergies stored as JSON array
    allergies = Column(JSON, nullable=False, default=list)

    # Budget range in dollars
    budget_min = Column(Integer, nullable=False, default=50)
    budget_max = Column(Integer, nullable=False, default=150)

    # Variety: 'minimal', 'moderate', 'high'
    variety_level = Column(String, nullable=False, default="moderate")

    # Number of days to plan meals for
    meal_days = Column(Integer, nullable=False, default=7)

    # Daily calorie target
    daily_calories = Column(Integer, nullable=False, default=2000)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="preferences")
