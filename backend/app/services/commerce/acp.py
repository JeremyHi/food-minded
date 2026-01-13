"""
OpenAI Agentic Commerce Protocol (ACP) Provider

This module will implement the ACP integration when partner access is granted.
Currently a placeholder that extends the base CommerceProvider.

ACP Documentation: https://developers.openai.com/commerce/
ACP Specification: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
"""

from typing import List, Optional
from app.services.commerce.base import CommerceProvider, Product, CartItem, Cart, Order


class ACPProvider(CommerceProvider):
    """
    OpenAI Agentic Commerce Protocol provider.

    ACP enables commerce through ChatGPT and other AI agents.
    Integration requires:
    1. Product feed implementation (Product Feed Spec)
    2. Checkout API endpoints (Agentic Checkout Spec)
    3. Payment provider integration (Delegated Payment Spec)
    4. OpenAI certification
    """

    def __init__(self, merchant_id: str = "", api_key: str = ""):
        self.merchant_id = merchant_id
        self.api_key = api_key
        # ACP endpoints would be configured here

    async def search_products(self, query: str, limit: int = 10) -> List[Product]:
        """Search products (product feed lookup)"""
        # TODO: Implement when ACP access is granted
        # Products are indexed via Product Feed Spec
        raise NotImplementedError("ACP integration pending partner approval")

    async def create_cart(self, items: List[CartItem]) -> Cart:
        """Create checkout session via ACP"""
        # TODO: Implement when ACP access is granted
        # Will use: POST /acp/v1/checkout/sessions
        raise NotImplementedError("ACP integration pending partner approval")

    async def update_cart(self, cart_id: str, items: List[CartItem]) -> Cart:
        """Update checkout session via ACP"""
        # TODO: Implement when ACP access is granted
        # Will use: PUT /acp/v1/checkout/sessions/{session_id}
        raise NotImplementedError("ACP integration pending partner approval")

    async def get_cart(self, cart_id: str) -> Optional[Cart]:
        """Get checkout session via ACP"""
        # TODO: Implement when ACP access is granted
        raise NotImplementedError("ACP integration pending partner approval")

    async def checkout(self, cart_id: str) -> Order:
        """Complete checkout via ACP with Delegated Payment"""
        # TODO: Implement when ACP access is granted
        # Will use Stripe Shared Payment Token or compatible PSP
        raise NotImplementedError("ACP integration pending partner approval")
