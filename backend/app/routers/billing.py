"""
Billing API Router

Handles pricing plans, Stripe checkout, subscription management, and webhooks.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import stripe

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.models.purchase import Purchase
from app.models.payment import PaymentHistory
from app.utils.security import get_current_user
from app.services import stripe_service
from app.schemas.billing import (
    BillingCheckoutRequest,
    PricingPlan,
    PlanFeatures,
    CheckoutSessionResponse,
    PortalSessionResponse,
    SubscriptionResponse,
    UsageResponse,
    PaymentHistoryItem,
    PaymentHistoryResponse,
    CancelSubscriptionResponse,
)

router = APIRouter()


# Pricing plan definitions
FREE_FEATURES = PlanFeatures(
    plans_per_month=1,
    max_days=3,
    diet_types="basic",
    can_customize_macros=False,
    can_regenerate=False,
    can_export_pdf=False,
    smart_pricing=False,
    priority_support=False,
)

PRO_FEATURES = PlanFeatures(
    plans_per_month="unlimited",
    max_days=14,
    diet_types="all",
    can_customize_macros=True,
    can_regenerate=True,
    can_export_pdf=True,
    smart_pricing=True,
    priority_support=True,
)

SINGLE_FEATURES = PlanFeatures(
    plans_per_month=1,
    max_days=14,
    diet_types="all",
    can_customize_macros=True,
    can_regenerate=False,  # Only 1 regenerate included
    can_export_pdf=True,
    smart_pricing=True,
    priority_support=False,
)


@router.get("/plans")
async def get_pricing_plans():
    """Return available pricing plans (public endpoint)"""
    return {
        "free": PricingPlan(
            name="Free",
            price_cents=0,
            interval=None,
            features=FREE_FEATURES,
        ),
        "pro": PricingPlan(
            name="Pro",
            price_cents=999,
            interval="month",
            features=PRO_FEATURES,
        ),
        "single": PricingPlan(
            name="Single Plan",
            price_cents=299,
            interval=None,
            features=SINGLE_FEATURES,
        ),
    }


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: BillingCheckoutRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create Stripe Checkout session for subscription or one-time payment"""
    if not stripe_service.is_stripe_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment system is not configured",
        )

    # Get or create Stripe customer
    customer = await stripe_service.get_or_create_customer(
        user_id=user.id,
        email=user.email,
        existing_customer_id=user.stripe_customer_id,
    )

    # Save customer ID if new
    if user.stripe_customer_id != customer.id:
        user.stripe_customer_id = customer.id
        db.commit()

    # Create appropriate checkout session
    if request.mode == "subscription":
        session = await stripe_service.create_subscription_checkout_session(
            customer_id=customer.id,
            user_id=user.id,
        )
    elif request.mode == "payment":
        session = await stripe_service.create_payment_checkout_session(
            customer_id=customer.id,
            user_id=user.id,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mode. Use 'subscription' or 'payment'",
        )

    return CheckoutSessionResponse(
        checkout_url=session.url,
        session_id=session.id,
    )


@router.post("/create-portal-session", response_model=PortalSessionResponse)
async def create_portal_session(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create Stripe Billing Portal session for subscription management"""
    if not user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billing account found. Please subscribe first.",
        )

    session = await stripe_service.create_portal_session(user.stripe_customer_id)

    return PortalSessionResponse(portal_url=session.url)


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user subscription status"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id
    ).first()

    if not subscription:
        return SubscriptionResponse(
            plan=user.plan or "free",
            status="none",
        )

    return SubscriptionResponse(
        plan=user.plan or "free",
        status=subscription.status,
        stripe_subscription_id=subscription.stripe_subscription_id,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
        cancel_at_period_end=subscription.cancel_at_period_end,
    )


@router.get("/usage", response_model=UsageResponse)
async def get_usage(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current month usage stats and limits"""
    # Reset monthly counter if needed
    now = datetime.now(timezone.utc)
    if user.last_plan_reset:
        last_reset = user.last_plan_reset
        if last_reset.month != now.month or last_reset.year != now.year:
            user.plans_created_this_month = 0
            user.last_plan_reset = now
            db.commit()

    # Determine limits based on plan and first-flow-free status
    if user.is_first_plan:
        # First flow free - pro limits
        plans_limit = "unlimited"
        max_days = 14
        can_create = True
        message = "Your first meal plan is free with all Pro features!"
    elif user.plan == "pro":
        # Pro subscriber - unlimited
        plans_limit = "unlimited"
        max_days = 14
        can_create = True
        message = None
    else:
        # Free tier
        plans_limit = 1
        max_days = 3
        can_create = user.plans_created_this_month < 1
        if not can_create:
            message = "You've used your free plan this month. Upgrade to Pro for unlimited plans!"
        else:
            message = None

    return UsageResponse(
        plan=user.plan or "free",
        is_first_plan=user.is_first_plan,
        plans_created_this_month=user.plans_created_this_month,
        plans_limit=plans_limit,
        can_create_plan=can_create,
        max_days=max_days,
        message=message,
    )


@router.post("/cancel-subscription", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel subscription at end of billing period"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status == "active",
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found",
        )

    # Cancel in Stripe
    stripe_sub = await stripe_service.cancel_subscription_at_period_end(
        subscription.stripe_subscription_id
    )

    # Update local record
    subscription.cancel_at_period_end = True
    subscription.canceled_at = datetime.now(timezone.utc)
    db.commit()

    return CancelSubscriptionResponse(
        success=True,
        message="Subscription will be canceled at the end of the billing period",
        cancel_at_period_end=True,
        current_period_end=subscription.current_period_end,
    )


@router.get("/payments", response_model=PaymentHistoryResponse)
async def get_payment_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
):
    """Get payment history for current user"""
    payments = db.query(PaymentHistory).filter(
        PaymentHistory.user_id == user.id
    ).order_by(PaymentHistory.created_at.desc()).limit(limit).all()

    return PaymentHistoryResponse(
        payments=[PaymentHistoryItem.model_validate(p) for p in payments]
    )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header",
        )

    try:
        event = stripe_service.verify_webhook_signature(payload, signature)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload: {str(e)}",
        )
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid signature: {str(e)}",
        )

    # Handle different event types
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        await handle_checkout_completed(data, db)
    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(data, db)
    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(data, db)
    elif event_type == "invoice.payment_succeeded":
        await handle_invoice_paid(data, db)
    elif event_type == "invoice.payment_failed":
        await handle_invoice_failed(data, db)

    return {"received": True}


async def handle_checkout_completed(session: dict, db: Session):
    """Handle successful checkout session completion"""
    user_id = session.get("metadata", {}).get("user_id")
    checkout_type = session.get("metadata", {}).get("type")

    if not user_id:
        return

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        return

    if checkout_type == "pro_subscription":
        # Handle subscription checkout
        subscription_id = session.get("subscription")
        if subscription_id:
            # Get subscription details from Stripe
            stripe_sub = await stripe_service.get_subscription(subscription_id)

            # Create or update local subscription record
            subscription = db.query(Subscription).filter(
                Subscription.user_id == user.id
            ).first()

            if not subscription:
                subscription = Subscription(user_id=user.id)
                db.add(subscription)

            subscription.stripe_subscription_id = subscription_id
            subscription.stripe_price_id = stripe_sub["items"]["data"][0]["price"]["id"]
            subscription.status = stripe_sub["status"]
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_sub["current_period_start"], tz=timezone.utc
            )
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_sub["current_period_end"], tz=timezone.utc
            )

            # Update user plan
            user.plan = "pro"
            db.commit()

    elif checkout_type == "single_plan":
        # Handle one-time purchase
        amount_cents = int(session.get("metadata", {}).get("amount_cents", 299))

        purchase = Purchase(
            user_id=user.id,
            stripe_session_id=session["id"],
            stripe_payment_intent_id=session.get("payment_intent"),
            amount_cents=amount_cents,
            purchase_type="single_plan",
            status="completed",
        )
        db.add(purchase)

        # Grant one pro-tier plan by resetting is_first_plan
        # This allows one more plan at pro level
        user.is_first_plan = True
        db.commit()


async def handle_subscription_updated(subscription: dict, db: Session):
    """Handle subscription updates (status changes, cancellations, etc.)"""
    subscription_id = subscription["id"]

    local_sub = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()

    if not local_sub:
        return

    # Update status
    local_sub.status = subscription["status"]
    local_sub.cancel_at_period_end = subscription.get("cancel_at_period_end", False)
    local_sub.current_period_start = datetime.fromtimestamp(
        subscription["current_period_start"], tz=timezone.utc
    )
    local_sub.current_period_end = datetime.fromtimestamp(
        subscription["current_period_end"], tz=timezone.utc
    )

    # Update user plan based on status
    user = db.query(User).filter(User.id == local_sub.user_id).first()
    if user:
        if subscription["status"] == "active":
            user.plan = "pro"
        elif subscription["status"] in ["canceled", "unpaid", "past_due"]:
            user.plan = "free"

    db.commit()


async def handle_subscription_deleted(subscription: dict, db: Session):
    """Handle subscription cancellation/deletion"""
    subscription_id = subscription["id"]

    local_sub = db.query(Subscription).filter(
        Subscription.stripe_subscription_id == subscription_id
    ).first()

    if not local_sub:
        return

    local_sub.status = "canceled"
    local_sub.ended_at = datetime.now(timezone.utc)

    # Downgrade user to free
    user = db.query(User).filter(User.id == local_sub.user_id).first()
    if user:
        user.plan = "free"

    db.commit()


async def handle_invoice_paid(invoice: dict, db: Session):
    """Handle successful invoice payment"""
    customer_id = invoice.get("customer")
    if not customer_id:
        return

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return

    # Record payment
    payment = PaymentHistory(
        user_id=user.id,
        stripe_invoice_id=invoice["id"],
        stripe_payment_intent_id=invoice.get("payment_intent"),
        amount_paid=invoice["amount_paid"],
        currency=invoice["currency"],
        status="paid",
        description=invoice.get("description") or "Subscription payment",
        invoice_url=invoice.get("hosted_invoice_url"),
        invoice_pdf=invoice.get("invoice_pdf"),
    )
    db.add(payment)
    db.commit()


async def handle_invoice_failed(invoice: dict, db: Session):
    """Handle failed invoice payment"""
    customer_id = invoice.get("customer")
    if not customer_id:
        return

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if not user:
        return

    # Record failed payment
    payment = PaymentHistory(
        user_id=user.id,
        stripe_invoice_id=invoice["id"],
        stripe_payment_intent_id=invoice.get("payment_intent"),
        amount_paid=0,
        currency=invoice["currency"],
        status="failed",
        description="Payment failed",
        invoice_url=invoice.get("hosted_invoice_url"),
    )
    db.add(payment)
    db.commit()
