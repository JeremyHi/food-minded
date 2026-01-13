from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_session_id = Column(String, unique=True)
    stripe_payment_intent_id = Column(String, nullable=True)
    amount_cents = Column(Integer, nullable=False)  # 299 for $2.99
    purchase_type = Column(String, default="single_plan")  # single_plan
    status = Column(String, default="pending")  # pending, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="purchases")
