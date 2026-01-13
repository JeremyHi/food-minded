from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stripe_invoice_id = Column(String, unique=True, nullable=True)
    stripe_payment_intent_id = Column(String, nullable=True)
    amount_paid = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String, default="usd")
    status = Column(String, nullable=False)  # paid, failed, refunded
    description = Column(String, nullable=True)
    invoice_url = Column(String, nullable=True)
    invoice_pdf = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="payments")
