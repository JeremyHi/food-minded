// User types
export interface User {
  id: number
  email: string
  created_at: string
}

// Auth types
export interface AuthResponse {
  user: User
  token: {
    access_token: string
    token_type: string
  }
}

// Diet types
export interface DietType {
  id: string
  name: string
  description: string
  carb_pct: number
  protein_pct: number
  fat_pct: number
}

export interface Allergy {
  id: string
  name: string
  examples: string
}

export interface Preferences {
  id: number
  user_id: number
  diet_type: string
  carb_pct: number
  protein_pct: number
  fat_pct: number
  allergies: string[]
  budget_min: number
  budget_max: number
  variety_level: 'minimal' | 'moderate' | 'high'
  meal_days: number
  daily_calories: number
  updated_at?: string
}

// Meal types
export interface Ingredient {
  name: string
  amount: string
  estimated_price: number
}

export interface Macros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  ingredients: Ingredient[]
  macros: Macros
}

export interface DayPlan {
  day: number
  meals: Meal[]
  daily_totals: Macros
}

export interface ShoppingItem {
  name: string
  total_amount: string
  estimated_price: number
}

export interface MealPlanData {
  days: DayPlan[]
  total_cost_estimate: number
  shopping_list: ShoppingItem[]
}

export interface MealPlan {
  id: number
  user_id: number
  preferences_id?: number
  plan_data: MealPlanData
  total_cost_estimate: number
  created_at: string
}

// Cart types
export interface CartItem {
  product_id: string
  name: string
  quantity: number
  unit: string
  price: number
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
}

// Order types
export interface Order {
  id: number
  user_id: number
  meal_plan_id?: number
  cart_data: CartItem[]
  status: string
  provider: string
  total: number
  created_at: string
}
