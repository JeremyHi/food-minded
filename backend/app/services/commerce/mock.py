import uuid
from typing import List, Optional, Dict
from app.services.commerce.base import CommerceProvider, Product, CartItem, Cart, Order


# Mock product database with common grocery items
MOCK_PRODUCTS: Dict[str, Product] = {
    "chicken_breast": Product(
        id="chicken_breast",
        name="Chicken Breast (Boneless, Skinless)",
        price=8.99,
        unit="lb",
        merchant="MockMart",
    ),
    "salmon_fillet": Product(
        id="salmon_fillet",
        name="Atlantic Salmon Fillet",
        price=12.99,
        unit="lb",
        merchant="MockMart",
    ),
    "brown_rice": Product(
        id="brown_rice",
        name="Organic Brown Rice",
        price=3.49,
        unit="lb",
        merchant="MockMart",
    ),
    "quinoa": Product(
        id="quinoa",
        name="Organic Quinoa",
        price=5.99,
        unit="lb",
        merchant="MockMart",
    ),
    "broccoli": Product(
        id="broccoli",
        name="Fresh Broccoli",
        price=2.99,
        unit="lb",
        merchant="MockMart",
    ),
    "spinach": Product(
        id="spinach",
        name="Fresh Baby Spinach",
        price=3.99,
        unit="5oz",
        merchant="MockMart",
    ),
    "mixed_greens": Product(
        id="mixed_greens",
        name="Organic Mixed Greens",
        price=4.99,
        unit="5oz",
        merchant="MockMart",
    ),
    "olive_oil": Product(
        id="olive_oil",
        name="Extra Virgin Olive Oil",
        price=9.99,
        unit="16oz",
        merchant="MockMart",
    ),
    "eggs": Product(
        id="eggs",
        name="Large Eggs (Cage-Free)",
        price=5.99,
        unit="dozen",
        merchant="MockMart",
    ),
    "greek_yogurt": Product(
        id="greek_yogurt",
        name="Plain Greek Yogurt",
        price=5.99,
        unit="32oz",
        merchant="MockMart",
    ),
    "sweet_potato": Product(
        id="sweet_potato",
        name="Organic Sweet Potatoes",
        price=1.99,
        unit="lb",
        merchant="MockMart",
    ),
    "avocado": Product(
        id="avocado",
        name="Hass Avocados",
        price=1.49,
        unit="each",
        merchant="MockMart",
    ),
    "sunflower_butter": Product(
        id="sunflower_butter",
        name="Sunflower Seed Butter",
        price=7.99,
        unit="16oz",
        merchant="MockMart",
    ),
    "mixed_berries": Product(
        id="mixed_berries",
        name="Organic Mixed Berries (Frozen)",
        price=6.99,
        unit="12oz",
        merchant="MockMart",
    ),
    "apples": Product(
        id="apples",
        name="Organic Gala Apples",
        price=2.99,
        unit="lb",
        merchant="MockMart",
    ),
    "cherry_tomatoes": Product(
        id="cherry_tomatoes",
        name="Cherry Tomatoes",
        price=3.99,
        unit="pint",
        merchant="MockMart",
    ),
    "lemon": Product(
        id="lemon",
        name="Fresh Lemons",
        price=0.69,
        unit="each",
        merchant="MockMart",
    ),
    "honey": Product(
        id="honey",
        name="Raw Organic Honey",
        price=8.99,
        unit="12oz",
        merchant="MockMart",
    ),
    "oats": Product(
        id="oats",
        name="Rolled Oats",
        price=3.99,
        unit="lb",
        merchant="MockMart",
    ),
    "tofu": Product(
        id="tofu",
        name="Organic Extra Firm Tofu",
        price=2.99,
        unit="14oz",
        merchant="MockMart",
    ),
}


class MockProvider(CommerceProvider):
    """Mock commerce provider for development and testing"""

    def __init__(self):
        self.carts: Dict[str, Cart] = {}

    async def search_products(self, query: str, limit: int = 10) -> List[Product]:
        """Search mock products by name"""
        query_lower = query.lower()
        results = [
            product
            for product in MOCK_PRODUCTS.values()
            if query_lower in product.name.lower()
        ]
        return results[:limit]

    async def create_cart(self, items: List[CartItem]) -> Cart:
        """Create a new cart with items"""
        cart_id = str(uuid.uuid4())
        total = sum(item.price * item.quantity for item in items)
        cart = Cart(id=cart_id, items=items, total=round(total, 2))
        self.carts[cart_id] = cart
        return cart

    async def update_cart(self, cart_id: str, items: List[CartItem]) -> Cart:
        """Update cart items"""
        if cart_id not in self.carts:
            raise ValueError(f"Cart {cart_id} not found")

        total = sum(item.price * item.quantity for item in items)
        cart = Cart(id=cart_id, items=items, total=round(total, 2))
        self.carts[cart_id] = cart
        return cart

    async def get_cart(self, cart_id: str) -> Optional[Cart]:
        """Get cart by ID"""
        return self.carts.get(cart_id)

    async def checkout(self, cart_id: str) -> Order:
        """Complete checkout (mock)"""
        cart = self.carts.get(cart_id)
        if not cart:
            raise ValueError(f"Cart {cart_id} not found")

        order_id = str(uuid.uuid4())
        return Order(
            id=order_id,
            cart_id=cart_id,
            status="confirmed",
            total=cart.total,
        )


# Singleton instance
mock_provider = MockProvider()
