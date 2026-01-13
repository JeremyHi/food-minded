"""
Google Universal Commerce Protocol (UCP) Provider

This module will implement the UCP integration when API access is granted.
Currently a placeholder that extends the base CommerceProvider.

UCP Documentation: https://developers.google.com/merchant/ucp
"""

from typing import List, Optional
from app.services.commerce.base import CommerceProvider, Product, CartItem, Cart, Order


class UCPProvider(CommerceProvider):
    """
    Google Universal Commerce Protocol provider.

    UCP enables direct transactions on Google's AI surfaces (Search, Gemini).
    Integration requires:
    1. Merchant Center setup
    2. Business profile publication
    3. Native checkout endpoint implementation
    4. Google approval (waitlist)
    """

    def __init__(self, merchant_id: str = "", api_key: str = ""):
        self.merchant_id = merchant_id
        self.api_key = api_key
        # UCP endpoints would be configured here

    async def search_products(self, query: str, limit: int = 10) -> List[Product]:
        """Search products via UCP"""
        # TODO: Implement when UCP access is granted
        # Will use: GET /ucp/v1/products/search
        raise NotImplementedError("UCP integration pending approval")

    async def create_cart(self, items: List[CartItem]) -> Cart:
        """Create cart session via UCP"""
        # TODO: Implement when UCP access is granted
        # Will use: POST /ucp/v1/sessions
        raise NotImplementedError("UCP integration pending approval")

    async def update_cart(self, cart_id: str, items: List[CartItem]) -> Cart:
        """Update cart session via UCP"""
        # TODO: Implement when UCP access is granted
        # Will use: PUT /ucp/v1/sessions/{session_id}
        raise NotImplementedError("UCP integration pending approval")

    async def get_cart(self, cart_id: str) -> Optional[Cart]:
        """Get cart session via UCP"""
        # TODO: Implement when UCP access is granted
        raise NotImplementedError("UCP integration pending approval")

    async def checkout(self, cart_id: str) -> Order:
        """Complete checkout via UCP"""
        # TODO: Implement when UCP access is granted
        # Will use: POST /ucp/v1/sessions/{session_id}/complete
        raise NotImplementedError("UCP integration pending approval")
