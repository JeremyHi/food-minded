from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel


class Product(BaseModel):
    """Product from a commerce provider"""
    id: str
    name: str
    price: float
    unit: str
    merchant: str
    image_url: Optional[str] = None


class CartItem(BaseModel):
    """Item in a shopping cart"""
    product_id: str
    name: str
    quantity: float
    unit: str
    price: float


class Cart(BaseModel):
    """Shopping cart"""
    id: str
    items: List[CartItem]
    total: float


class Order(BaseModel):
    """Completed order"""
    id: str
    cart_id: str
    status: str
    total: float


class CommerceProvider(ABC):
    """Abstract base class for commerce providers (UCP, ACP, Mock)"""

    @abstractmethod
    async def search_products(self, query: str, limit: int = 10) -> List[Product]:
        """Search for products by query"""
        pass

    @abstractmethod
    async def create_cart(self, items: List[CartItem]) -> Cart:
        """Create a new cart with items"""
        pass

    @abstractmethod
    async def update_cart(self, cart_id: str, items: List[CartItem]) -> Cart:
        """Update cart items"""
        pass

    @abstractmethod
    async def get_cart(self, cart_id: str) -> Optional[Cart]:
        """Get cart by ID"""
        pass

    @abstractmethod
    async def checkout(self, cart_id: str) -> Order:
        """Complete checkout for a cart"""
        pass
