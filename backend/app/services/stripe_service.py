"""
Stripe Integration Service

Handles Stripe SDK initialization and helper functions for:
- Customer management
- Checkout sessions (subscription + one-time)
- Billing portal
- Webhook verification
"""

import stripe
from typing import Optional
from app.config import settings

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def is_stripe_configured() -> bool:
    """Check if Stripe is properly configured"""
    return bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_SECRET_KEY.startswith("sk_"))


async def get_or_create_customer(
    user_id: int,
    email: str,
    existing_customer_id: Optional[str] = None
) -> stripe.Customer:
    """Get existing or create new Stripe customer"""
    if existing_customer_id:
        try:
            customer = stripe.Customer.retrieve(existing_customer_id)
            if not customer.get("deleted"):
                return customer
        except stripe.error.InvalidRequestError:
            pass

    # Create new customer
    customer = stripe.Customer.create(
        email=email,
        metadata={"user_id": str(user_id)},
    )
    return customer


async def create_subscription_checkout_session(
    customer_id: str,
    user_id: int,
) -> stripe.checkout.Session:
    """Create Stripe Checkout session for Pro subscription"""
    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[
            {
                "price": settings.STRIPE_PRICE_PRO_MONTHLY,
                "quantity": 1,
            }
        ],
        success_url=f"{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_URL}/pricing",
        allow_promotion_codes=True,
        billing_address_collection="auto",
        metadata={
            "user_id": str(user_id),
            "type": "pro_subscription",
        },
        subscription_data={
            "metadata": {
                "user_id": str(user_id),
            },
        },
    )
    return session


async def create_payment_checkout_session(
    customer_id: str,
    user_id: int,
) -> stripe.checkout.Session:
    """Create Stripe Checkout session for one-time single plan purchase"""
    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Single Pro Meal Plan",
                        "description": "One pro-tier meal plan with all features",
                    },
                    "unit_amount": 299,  # $2.99
                },
                "quantity": 1,
            }
        ],
        success_url=f"{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}&type=single",
        cancel_url=f"{settings.FRONTEND_URL}/pricing",
        metadata={
            "user_id": str(user_id),
            "type": "single_plan",
            "amount_cents": "299",
        },
    )
    return session


async def create_portal_session(customer_id: str) -> stripe.billing_portal.Session:
    """Create Stripe Billing Portal session for subscription management"""
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.FRONTEND_URL}/billing",
    )
    return session


async def get_subscription(subscription_id: str) -> stripe.Subscription:
    """Retrieve a subscription from Stripe"""
    return stripe.Subscription.retrieve(subscription_id)


async def cancel_subscription_at_period_end(subscription_id: str) -> stripe.Subscription:
    """Cancel a subscription at the end of the current billing period"""
    return stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=True,
    )


async def resume_subscription(subscription_id: str) -> stripe.Subscription:
    """Resume a canceled subscription (undo cancel_at_period_end)"""
    return stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=False,
    )


async def get_checkout_session(session_id: str) -> stripe.checkout.Session:
    """Retrieve a checkout session by ID"""
    return stripe.checkout.Session.retrieve(session_id)


async def list_customer_invoices(customer_id: str, limit: int = 10) -> list:
    """List invoices for a customer"""
    invoices = stripe.Invoice.list(customer=customer_id, limit=limit)
    return invoices.data


def verify_webhook_signature(payload: bytes, signature: str) -> stripe.Event:
    """Verify Stripe webhook signature and construct event"""
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise ValueError("STRIPE_WEBHOOK_SECRET is not configured")

    return stripe.Webhook.construct_event(
        payload,
        signature,
        settings.STRIPE_WEBHOOK_SECRET,
    )


def get_plan_from_price_id(price_id: str) -> str:
    """Get plan name from Stripe price ID"""
    if price_id == settings.STRIPE_PRICE_PRO_MONTHLY:
        return "pro"
    return "free"
