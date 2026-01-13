from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.meal import MealPlan
from app.models.order import Order
from app.schemas.order import (
    CartItem,
    CartCreate,
    CartResponse,
    CartUpdate,
    OrderResponse,
    CheckoutRequest,
)
from app.services.commerce.mock import mock_provider
from app.utils.security import get_current_user

router = APIRouter()


def _convert_shopping_list_to_cart_items(shopping_list: List[dict]) -> List[CartItem]:
    """Convert meal plan shopping list to cart items"""
    return [
        CartItem(
            product_id=item["name"].lower().replace(" ", "_"),
            name=item["name"],
            quantity=1,  # Will be adjusted based on amount
            unit=item["total_amount"],
            price=item["estimated_price"],
        )
        for item in shopping_list
    ]


@router.post("/create", response_model=CartResponse)
async def create_cart(
    request: CartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a cart from a meal plan's shopping list"""
    # Get meal plan
    meal_plan = (
        db.query(MealPlan)
        .filter(
            MealPlan.id == request.meal_plan_id,
            MealPlan.user_id == current_user.id,
        )
        .first()
    )

    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found",
        )

    # Convert shopping list to cart items
    shopping_list = meal_plan.plan_data.get("shopping_list", [])
    cart_items = _convert_shopping_list_to_cart_items(shopping_list)

    # Create cart via commerce provider
    cart = await mock_provider.create_cart(cart_items)

    return CartResponse(
        id=cart.id,
        items=[
            CartItem(
                product_id=item.product_id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                price=item.price,
            )
            for item in cart.items
        ],
        total=cart.total,
    )


@router.get("/{cart_id}", response_model=CartResponse)
async def get_cart(
    cart_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get cart by ID"""
    cart = await mock_provider.get_cart(cart_id)

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    return CartResponse(
        id=cart.id,
        items=[
            CartItem(
                product_id=item.product_id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                price=item.price,
            )
            for item in cart.items
        ],
        total=cart.total,
    )


@router.put("/{cart_id}/items", response_model=CartResponse)
async def update_cart_items(
    cart_id: str,
    update: CartUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update cart items"""
    try:
        cart = await mock_provider.update_cart(
            cart_id,
            [
                CartItem(
                    product_id=item.product_id,
                    name=item.name,
                    quantity=item.quantity,
                    unit=item.unit,
                    price=item.price,
                )
                for item in update.items
            ],
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return CartResponse(
        id=cart.id,
        items=[
            CartItem(
                product_id=item.product_id,
                name=item.name,
                quantity=item.quantity,
                unit=item.unit,
                price=item.price,
            )
            for item in cart.items
        ],
        total=cart.total,
    )


@router.post("/checkout", response_model=OrderResponse)
async def checkout(
    request: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete checkout for a cart"""
    # Get cart
    cart = await mock_provider.get_cart(request.cart_id)
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    # Process checkout
    try:
        commerce_order = await mock_provider.checkout(request.cart_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Save order to database
    order = Order(
        user_id=current_user.id,
        cart_data=[item.model_dump() for item in cart.items],
        status=commerce_order.status,
        provider="mock",
        total=commerce_order.total,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        meal_plan_id=order.meal_plan_id,
        cart_data=[CartItem(**item) for item in order.cart_data],
        status=order.status,
        provider=order.provider,
        total=order.total,
        created_at=order.created_at,
    )


@router.get("/orders/", response_model=List[OrderResponse])
async def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10,
):
    """List user's orders"""
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        OrderResponse(
            id=order.id,
            user_id=order.user_id,
            meal_plan_id=order.meal_plan_id,
            cart_data=[CartItem(**item) for item in order.cart_data],
            status=order.status,
            provider=order.provider,
            total=order.total,
            created_at=order.created_at,
        )
        for order in orders
    ]
