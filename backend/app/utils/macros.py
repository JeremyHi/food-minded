from typing import Tuple


def calculate_macro_grams(
    daily_calories: int,
    carb_pct: int,
    protein_pct: int,
    fat_pct: int,
) -> Tuple[int, int, int]:
    """
    Calculate macro targets in grams from percentages and daily calories.

    Calorie values per gram:
    - Carbohydrates: 4 cal/g
    - Protein: 4 cal/g
    - Fat: 9 cal/g

    Returns:
        Tuple of (carb_grams, protein_grams, fat_grams)
    """
    carb_calories = daily_calories * carb_pct / 100
    protein_calories = daily_calories * protein_pct / 100
    fat_calories = daily_calories * fat_pct / 100

    carb_grams = int(carb_calories / 4)
    protein_grams = int(protein_calories / 4)
    fat_grams = int(fat_calories / 9)

    return carb_grams, protein_grams, fat_grams


def validate_macro_percentages(carb_pct: int, protein_pct: int, fat_pct: int) -> bool:
    """Validate that macro percentages sum to 100"""
    return carb_pct + protein_pct + fat_pct == 100


def calculate_meal_macros(
    calories: int, protein_g: float, carbs_g: float, fat_g: float
) -> dict:
    """Calculate macro percentages from gram values"""
    total_calories_from_macros = (protein_g * 4) + (carbs_g * 4) + (fat_g * 9)

    if total_calories_from_macros == 0:
        return {"carb_pct": 0, "protein_pct": 0, "fat_pct": 0}

    return {
        "carb_pct": round((carbs_g * 4 / total_calories_from_macros) * 100),
        "protein_pct": round((protein_g * 4 / total_calories_from_macros) * 100),
        "fat_pct": round((fat_g * 9 / total_calories_from_macros) * 100),
    }
