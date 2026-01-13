import httpx
from typing import Optional, List, Dict, Any
from app.config import settings

USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"


class USDAService:
    """Service for interacting with USDA FoodData Central API"""

    def __init__(self):
        self.api_key = settings.USDA_API_KEY

    async def search_foods(
        self, query: str, page_size: int = 25, data_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for foods by query string.

        Args:
            query: Search term
            page_size: Number of results to return (max 200)
            data_types: Types of data to search (Foundation, SR Legacy, etc.)

        Returns:
            List of food items with basic info
        """
        if not self.api_key:
            return self._mock_search(query)

        if data_types is None:
            data_types = ["Foundation", "SR Legacy"]

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{USDA_BASE_URL}/foods/search",
                    params={
                        "api_key": self.api_key,
                        "query": query,
                        "pageSize": page_size,
                        "dataType": data_types,
                    },
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()
                return data.get("foods", [])
            except (httpx.HTTPError, Exception):
                return self._mock_search(query)

    async def get_food(self, fdc_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific food.

        Args:
            fdc_id: FoodData Central ID

        Returns:
            Food details including nutrients
        """
        if not self.api_key:
            return None

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{USDA_BASE_URL}/food/{fdc_id}",
                    params={"api_key": self.api_key},
                    timeout=10.0,
                )
                if response.status_code == 404:
                    return None
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPError, Exception):
                return None

    def extract_macros(self, food: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract macro nutrients from USDA food data.

        Args:
            food: USDA food data

        Returns:
            Dict with calories, protein_g, carbs_g, fat_g, fiber_g
        """
        nutrients = {}
        for nutrient in food.get("foodNutrients", []):
            name = nutrient.get("nutrientName", "")
            value = nutrient.get("value", 0)
            nutrients[name] = value

        return {
            "calories": nutrients.get("Energy", 0),
            "protein_g": nutrients.get("Protein", 0),
            "carbs_g": nutrients.get("Carbohydrate, by difference", 0),
            "fat_g": nutrients.get("Total lipid (fat)", 0),
            "fiber_g": nutrients.get("Fiber, total dietary", 0),
        }

    def _mock_search(self, query: str) -> List[Dict[str, Any]]:
        """Return mock data when API is not available"""
        mock_foods = [
            {
                "fdcId": 1,
                "description": "Chicken breast, raw",
                "foodNutrients": [
                    {"nutrientName": "Energy", "value": 120},
                    {"nutrientName": "Protein", "value": 22.5},
                    {"nutrientName": "Carbohydrate, by difference", "value": 0},
                    {"nutrientName": "Total lipid (fat)", "value": 2.6},
                ],
            },
            {
                "fdcId": 2,
                "description": "Brown rice, cooked",
                "foodNutrients": [
                    {"nutrientName": "Energy", "value": 112},
                    {"nutrientName": "Protein", "value": 2.3},
                    {"nutrientName": "Carbohydrate, by difference", "value": 24},
                    {"nutrientName": "Total lipid (fat)", "value": 0.8},
                ],
            },
            {
                "fdcId": 3,
                "description": "Broccoli, raw",
                "foodNutrients": [
                    {"nutrientName": "Energy", "value": 34},
                    {"nutrientName": "Protein", "value": 2.8},
                    {"nutrientName": "Carbohydrate, by difference", "value": 7},
                    {"nutrientName": "Total lipid (fat)", "value": 0.4},
                ],
            },
        ]
        # Simple filter based on query
        query_lower = query.lower()
        return [f for f in mock_foods if query_lower in f["description"].lower()]


usda_service = USDAService()
