"""
Feature Gate Service

Controls access to features based on user subscription tier.
Implements first-flow-free logic for new users.
"""

from typing import Tuple
from app.models.user import User


# Tier limit definitions
FREE_TIER_LIMITS = {
    "plans_per_month": 1,
    "max_days": 3,
    "diet_types": ["balanced", "40-30-30"],  # Basic diets only
    "can_customize_macros": False,
    "can_regenerate": False,
    "can_export_pdf": False,
    "smart_pricing": False,
}

PRO_TIER_LIMITS = {
    "plans_per_month": float("inf"),
    "max_days": 14,
    "diet_types": ["all"],  # All diet types
    "can_customize_macros": True,
    "can_regenerate": True,
    "can_export_pdf": True,
    "smart_pricing": True,
}

# All available diet types
ALL_DIET_TYPES = [
    "balanced",
    "40-30-30",
    "keto",
    "high-protein",
    "low-carb",
    "mediterranean",
]


def get_user_limits(user: User) -> dict:
    """
    Get feature limits based on user tier.

    First-flow-free: New users get pro-tier limits for their first plan.
    """
    # First-flow-free: treat as pro for first plan
    if user.is_first_plan:
        return PRO_TIER_LIMITS

    # Pro subscribers get full access
    if user.plan == "pro":
        return PRO_TIER_LIMITS

    # Everyone else is free tier
    return FREE_TIER_LIMITS


def can_create_plan(user: User) -> Tuple[bool, str]:
    """
    Check if user can create a new plan based on their limits.

    Returns:
        Tuple of (can_create: bool, message: str)
    """
    limits = get_user_limits(user)

    # Check monthly plan limit
    if user.plans_created_this_month >= limits["plans_per_month"]:
        return False, "Monthly plan limit reached. Upgrade to Pro for unlimited plans."

    return True, ""


def validate_plan_days(user: User, requested_days: int) -> Tuple[bool, str]:
    """
    Validate that requested plan duration is within user's tier limits.

    Returns:
        Tuple of (is_valid: bool, message: str)
    """
    limits = get_user_limits(user)

    if requested_days > limits["max_days"]:
        return False, f"Free tier limited to {limits['max_days']} days. Upgrade to Pro for up to 14 days."

    return True, ""


def validate_diet_type(user: User, diet_type: str) -> Tuple[bool, str]:
    """
    Validate that requested diet type is available for user's tier.

    Returns:
        Tuple of (is_valid: bool, message: str)
    """
    limits = get_user_limits(user)

    if limits["diet_types"] == ["all"]:
        return True, ""

    if diet_type not in limits["diet_types"]:
        return False, f"The {diet_type} diet requires Pro. Upgrade to access all diet types."

    return True, ""


def check_feature_access(user: User, feature: str) -> Tuple[bool, str]:
    """
    Check if user has access to a specific feature.

    Supported features:
        - regenerate: Can regenerate meal plans
        - export_pdf: Can export grocery list as PDF
        - customize_macros: Can customize macro percentages
        - smart_pricing: Access to multi-store smart pricing

    Returns:
        Tuple of (has_access: bool, message: str)
    """
    limits = get_user_limits(user)

    feature_messages = {
        "regenerate": "Regenerating plans requires Pro. Upgrade to unlock.",
        "export_pdf": "PDF export requires Pro. Upgrade to unlock.",
        "customize_macros": "Custom macro settings require Pro. Upgrade to unlock.",
        "smart_pricing": "Smart multi-store pricing requires Pro. Upgrade to unlock.",
    }

    feature_keys = {
        "regenerate": "can_regenerate",
        "export_pdf": "can_export_pdf",
        "customize_macros": "can_customize_macros",
        "smart_pricing": "smart_pricing",
    }

    if feature not in feature_keys:
        return True, ""

    if not limits.get(feature_keys[feature], False):
        return False, feature_messages[feature]

    return True, ""


def get_available_diet_types(user: User) -> list:
    """
    Get list of diet types available for user's tier.
    """
    limits = get_user_limits(user)

    if limits["diet_types"] == ["all"]:
        return ALL_DIET_TYPES

    return limits["diet_types"]


def get_max_plan_days(user: User) -> int:
    """
    Get maximum plan duration for user's tier.
    """
    limits = get_user_limits(user)
    return limits["max_days"]
