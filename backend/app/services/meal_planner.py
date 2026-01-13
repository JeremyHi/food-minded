import json
from typing import Dict, Any, List
from app.config import settings
from app.utils.macros import calculate_macro_grams

# Try to import anthropic, fall back to mock if not available
try:
    from anthropic import Anthropic

    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
except ImportError:
    client = None

SYSTEM_PROMPT = """You are a nutritionist and meal planning expert. Generate meal plans that:
1. Strictly adhere to the specified macro ratios
2. Never include ingredients the user is allergic to
3. Stay within the specified budget
4. Match the desired variety level
5. Include realistic portion sizes
6. Use whole, unprocessed foods when possible

Output your response as valid JSON matching the specified schema. Do not include any text outside the JSON."""


def generate_meal_plan(
    diet_type: str,
    carb_pct: int,
    protein_pct: int,
    fat_pct: int,
    allergies: List[str],
    budget_min: int,
    budget_max: int,
    variety_level: str,
    meal_days: int,
    daily_calories: int = 2000,
) -> Dict[str, Any]:
    """
    Generate a meal plan using Claude API.

    Args:
        diet_type: Name of diet type
        carb_pct: Carbohydrate percentage
        protein_pct: Protein percentage
        fat_pct: Fat percentage
        allergies: List of allergy IDs
        budget_min: Minimum budget in dollars
        budget_max: Maximum budget in dollars
        variety_level: 'minimal', 'moderate', or 'high'
        meal_days: Number of days to plan
        daily_calories: Target daily calorie intake

    Returns:
        Dict containing days, total_cost_estimate, and shopping_list
    """
    carb_g, protein_g, fat_g = calculate_macro_grams(
        daily_calories, carb_pct, protein_pct, fat_pct
    )

    # Map allergy IDs to readable names
    allergy_names = {
        "tree_nut": "tree nuts (almonds, walnuts, cashews, etc.)",
        "peanut": "peanuts and peanut products",
        "dairy": "dairy products (milk, cheese, yogurt, butter)",
        "egg": "eggs and egg products",
        "wheat": "wheat and gluten",
        "soy": "soy and soy products",
        "fish": "fish",
        "shellfish": "shellfish (shrimp, crab, lobster)",
    }
    allergy_list = [allergy_names.get(a, a) for a in allergies]

    prompt = f"""Generate a {meal_days}-day meal plan with the following requirements:

DIET TYPE: {diet_type}

MACRO TARGETS (per day, {daily_calories} calories):
- Carbohydrates: {carb_pct}% ({carb_g}g)
- Protein: {protein_pct}% ({protein_g}g)
- Fat: {fat_pct}% ({fat_g}g)

ALLERGIES (NEVER include these ingredients):
{', '.join(allergy_list) if allergy_list else 'None'}

BUDGET: ${budget_min} - ${budget_max} total for {meal_days} days

VARIETY LEVEL: {variety_level}
- "minimal": Repeat meals, batch cooking friendly, 2-3 unique meals total
- "moderate": Some variety, 3-4 different options per meal type
- "high": Different meals each day, maximum variety

For each day, include:
- Breakfast (400-500 cal)
- Lunch (500-600 cal)
- Dinner (600-700 cal)
- 1-2 Snacks (200-300 cal total)

Output as JSON with this exact structure:
{{
  "days": [
    {{
      "day": 1,
      "meals": [
        {{
          "type": "breakfast",
          "name": "Meal Name",
          "ingredients": [
            {{"name": "ingredient name", "amount": "100g", "estimated_price": 2.50}}
          ],
          "macros": {{"calories": 450, "protein_g": 30, "carbs_g": 50, "fat_g": 15}}
        }}
      ],
      "daily_totals": {{"calories": 2000, "protein_g": {protein_g}, "carbs_g": {carb_g}, "fat_g": {fat_g}}}
    }}
  ],
  "total_cost_estimate": 120.00,
  "shopping_list": [
    {{"name": "ingredient name", "total_amount": "500g", "estimated_price": 8.00}}
  ]
}}

Important:
- Ensure daily_totals are close to the targets (within 5%)
- Shopping list should consolidate all ingredients across all days
- Use realistic prices for US grocery stores
- Round prices to 2 decimal places"""

    # Use Claude API if available
    if client and settings.ANTHROPIC_API_KEY:
        try:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            content = response.content[0].text

            # Handle potential markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            plan_data = json.loads(content.strip())
            return plan_data

        except Exception as e:
            print(f"Error generating meal plan with Claude: {e}")
            return _generate_mock_plan(meal_days, daily_calories, carb_g, protein_g, fat_g)

    # Fallback to mock data
    return _generate_mock_plan(meal_days, daily_calories, carb_g, protein_g, fat_g)


def _generate_mock_plan(
    meal_days: int,
    daily_calories: int,
    carb_g: int,
    protein_g: int,
    fat_g: int,
) -> Dict[str, Any]:
    """Generate a mock meal plan for testing"""
    days = []

    for day_num in range(1, meal_days + 1):
        day = {
            "day": day_num,
            "meals": [
                {
                    "type": "breakfast",
                    "name": "Greek Yogurt Parfait with Berries",
                    "ingredients": [
                        {"name": "Greek yogurt", "amount": "200g", "estimated_price": 2.00},
                        {"name": "Mixed berries", "amount": "100g", "estimated_price": 2.50},
                        {"name": "Honey", "amount": "15g", "estimated_price": 0.30},
                    ],
                    "macros": {"calories": 350, "protein_g": 20, "carbs_g": 45, "fat_g": 8},
                },
                {
                    "type": "lunch",
                    "name": "Grilled Chicken Salad",
                    "ingredients": [
                        {"name": "Chicken breast", "amount": "150g", "estimated_price": 3.00},
                        {"name": "Mixed greens", "amount": "100g", "estimated_price": 1.50},
                        {"name": "Cherry tomatoes", "amount": "50g", "estimated_price": 1.00},
                        {"name": "Olive oil", "amount": "15ml", "estimated_price": 0.50},
                    ],
                    "macros": {"calories": 450, "protein_g": 40, "carbs_g": 15, "fat_g": 25},
                },
                {
                    "type": "dinner",
                    "name": "Salmon with Brown Rice and Broccoli",
                    "ingredients": [
                        {"name": "Salmon fillet", "amount": "150g", "estimated_price": 5.00},
                        {"name": "Brown rice", "amount": "150g cooked", "estimated_price": 0.50},
                        {"name": "Broccoli", "amount": "150g", "estimated_price": 1.50},
                        {"name": "Lemon", "amount": "1/4", "estimated_price": 0.25},
                    ],
                    "macros": {"calories": 650, "protein_g": 45, "carbs_g": 50, "fat_g": 28},
                },
                {
                    "type": "snack",
                    "name": "Apple with Sunflower Seed Butter",
                    "ingredients": [
                        {"name": "Apple", "amount": "1 medium", "estimated_price": 0.75},
                        {"name": "Sunflower seed butter", "amount": "30g", "estimated_price": 1.00},
                    ],
                    "macros": {"calories": 250, "protein_g": 5, "carbs_g": 30, "fat_g": 14},
                },
            ],
            "daily_totals": {
                "calories": daily_calories,
                "protein_g": protein_g,
                "carbs_g": carb_g,
                "fat_g": fat_g,
            },
        }
        days.append(day)

    return {
        "days": days,
        "total_cost_estimate": round(19.80 * meal_days, 2),
        "shopping_list": [
            {"name": "Greek yogurt", "total_amount": f"{200 * meal_days}g", "estimated_price": round(2.00 * meal_days, 2)},
            {"name": "Mixed berries", "total_amount": f"{100 * meal_days}g", "estimated_price": round(2.50 * meal_days, 2)},
            {"name": "Chicken breast", "total_amount": f"{150 * meal_days}g", "estimated_price": round(3.00 * meal_days, 2)},
            {"name": "Salmon fillet", "total_amount": f"{150 * meal_days}g", "estimated_price": round(5.00 * meal_days, 2)},
            {"name": "Brown rice", "total_amount": f"{100 * meal_days}g dry", "estimated_price": round(0.50 * meal_days, 2)},
            {"name": "Broccoli", "total_amount": f"{150 * meal_days}g", "estimated_price": round(1.50 * meal_days, 2)},
            {"name": "Mixed greens", "total_amount": f"{100 * meal_days}g", "estimated_price": round(1.50 * meal_days, 2)},
            {"name": "Olive oil", "total_amount": f"{15 * meal_days}ml", "estimated_price": round(0.50 * meal_days, 2)},
            {"name": "Apples", "total_amount": f"{meal_days} medium", "estimated_price": round(0.75 * meal_days, 2)},
            {"name": "Sunflower seed butter", "total_amount": f"{30 * meal_days}g", "estimated_price": round(1.00 * meal_days, 2)},
        ],
    }
