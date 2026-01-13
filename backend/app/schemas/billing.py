from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Request schemas
class BillingCheckoutRequest(BaseModel):
    mode: str  # 'subscription' or 'payment'


# Response schemas
class PlanFeatures(BaseModel):
    plans_per_month: int | str  # int or "unlimited"
    max_days: int
    diet_types: str  # "basic" or "all"
    can_customize_macros: bool
    can_regenerate: bool
    can_export_pdf: bool
    smart_pricing: bool
    priority_support: bool


class PricingPlan(BaseModel):
    name: str
    price_cents: int
    interval: Optional[str] = None  # 'month' for subscription, None for one-time
    features: PlanFeatures


class PricingPlansResponse(BaseModel):
    free: PricingPlan
    pro: PricingPlan
    single: PricingPlan


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str


class PortalSessionResponse(BaseModel):
    portal_url: str


class SubscriptionResponse(BaseModel):
    plan: str  # 'free', 'pro'
    status: str  # 'none', 'active', 'canceled', 'expired'
    stripe_subscription_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False


class UsageResponse(BaseModel):
    plan: str
    is_first_plan: bool
    plans_created_this_month: int
    plans_limit: int | str  # int or "unlimited"
    can_create_plan: bool
    max_days: int
    message: Optional[str] = None


class PaymentHistoryItem(BaseModel):
    id: int
    amount_paid: int
    currency: str
    status: str
    description: Optional[str]
    invoice_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentHistoryResponse(BaseModel):
    payments: List[PaymentHistoryItem]


class CancelSubscriptionResponse(BaseModel):
    success: bool
    message: str
    cancel_at_period_end: bool
    current_period_end: Optional[datetime] = None
