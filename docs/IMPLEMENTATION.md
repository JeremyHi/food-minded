# Implementation Guide

## Overview

This document provides technical implementation details for building Food Minded. It covers specific code patterns, data structures, and integration approaches.

---

## Backend Implementation

### Project Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy alembic pydantic python-jose bcrypt httpx anthropic

# Initialize alembic
alembic init alembic
```

### FastAPI Application Structure

**app/main.py**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, diet, meals, cart
from app.database import engine
from app import models

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Food Minded API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(diet.router, prefix="/api/diet", tags=["diet"])
app.include_router(meals.router, prefix="/api/meals", tags=["meals"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
```

### Database Configuration

**app/database.py**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite only
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### User Model

**app/models/user.py**
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### Authentication Service

**app/services/auth.py**
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None
```

### Diet Types Configuration

**app/data/diet_types.py**
```python
DIET_TYPES = {
    "40-30-30": {
        "name": "Zone Diet (40/30/30)",
        "description": "Balanced macro distribution for sustained energy",
        "carb_pct": 40,
        "protein_pct": 30,
        "fat_pct": 30,
    },
    "keto": {
        "name": "Ketogenic",
        "description": "Very low carb, high fat for ketosis",
        "carb_pct": 5,
        "protein_pct": 25,
        "fat_pct": 70,
    },
    "balanced": {
        "name": "Balanced",
        "description": "Moderate distribution following dietary guidelines",
        "carb_pct": 50,
        "protein_pct": 25,
        "fat_pct": 25,
    },
    "high-protein": {
        "name": "High Protein",
        "description": "Elevated protein for muscle building",
        "carb_pct": 30,
        "protein_pct": 40,
        "fat_pct": 30,
    },
    "low-carb": {
        "name": "Low Carb",
        "description": "Reduced carbohydrates for weight management",
        "carb_pct": 20,
        "protein_pct": 35,
        "fat_pct": 45,
    },
}

ALLERGIES = [
    {"id": "tree_nut", "name": "Tree Nuts", "examples": "almonds, walnuts, cashews"},
    {"id": "peanut", "name": "Peanuts", "examples": "peanut butter, peanut oil"},
    {"id": "dairy", "name": "Dairy", "examples": "milk, cheese, yogurt"},
    {"id": "egg", "name": "Eggs", "examples": "whole eggs, mayonnaise"},
    {"id": "wheat", "name": "Wheat/Gluten", "examples": "bread, pasta, flour"},
    {"id": "soy", "name": "Soy", "examples": "tofu, soy sauce, edamame"},
    {"id": "fish", "name": "Fish", "examples": "salmon, tuna, cod"},
    {"id": "shellfish", "name": "Shellfish", "examples": "shrimp, crab, lobster"},
]
```

### USDA Food Service

**app/services/usda.py**
```python
import httpx
from typing import Optional, List
from app.config import settings

USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

class USDAService:
    def __init__(self):
        self.api_key = settings.USDA_API_KEY

    async def search_foods(self, query: str, page_size: int = 25) -> List[dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{USDA_BASE_URL}/foods/search",
                params={
                    "api_key": self.api_key,
                    "query": query,
                    "pageSize": page_size,
                    "dataType": ["Foundation", "SR Legacy"],
                }
            )
            response.raise_for_status()
            data = response.json()
            return data.get("foods", [])

    async def get_food(self, fdc_id: int) -> Optional[dict]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{USDA_BASE_URL}/food/{fdc_id}",
                params={"api_key": self.api_key}
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()

    def extract_macros(self, food: dict) -> dict:
        """Extract macro nutrients from USDA food data"""
        nutrients = {n["nutrientName"]: n["value"] for n in food.get("foodNutrients", [])}
        return {
            "calories": nutrients.get("Energy", 0),
            "protein_g": nutrients.get("Protein", 0),
            "carbs_g": nutrients.get("Carbohydrate, by difference", 0),
            "fat_g": nutrients.get("Total lipid (fat)", 0),
            "fiber_g": nutrients.get("Fiber, total dietary", 0),
        }

usda_service = USDAService()
```

### LLM Meal Planner Service

**app/services/meal_planner.py**
```python
import json
from anthropic import Anthropic
from app.config import settings
from app.schemas.meal import MealPlan, Meal, Ingredient

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are a nutritionist and meal planning expert. Generate meal plans that:
1. Strictly adhere to the specified macro ratios
2. Never include ingredients the user is allergic to
3. Stay within the specified budget
4. Match the desired variety level
5. Include realistic portion sizes

Output your response as valid JSON matching the specified schema."""

def generate_meal_plan(
    diet_type: str,
    carb_pct: int,
    protein_pct: int,
    fat_pct: int,
    allergies: list[str],
    budget_min: int,
    budget_max: int,
    variety_level: str,
    meal_days: int,
    daily_calories: int = 2000,
) -> MealPlan:
    prompt = f"""Generate a {meal_days}-day meal plan with the following requirements:

MACRO TARGETS (per day, {daily_calories} calories):
- Carbohydrates: {carb_pct}% ({int(daily_calories * carb_pct / 100 / 4)}g)
- Protein: {protein_pct}% ({int(daily_calories * protein_pct / 100 / 4)}g)
- Fat: {fat_pct}% ({int(daily_calories * fat_pct / 100 / 9)}g)

ALLERGIES (NEVER include these):
{', '.join(allergies) if allergies else 'None'}

BUDGET: ${budget_min} - ${budget_max} for {meal_days} days

VARIETY LEVEL: {variety_level}
- "minimal": Repeat meals, batch cooking friendly
- "moderate": Some variety, 2-3 different options per meal type
- "high": Different meals each day

For each day, include:
- Breakfast
- Lunch
- Dinner
- 1-2 Snacks

Output as JSON with this structure:
{{
  "days": [
    {{
      "day": 1,
      "meals": [
        {{
          "type": "breakfast|lunch|dinner|snack",
          "name": "Meal Name",
          "ingredients": [
            {{"name": "ingredient", "amount": "100g", "estimated_price": 2.50}}
          ],
          "macros": {{"calories": 500, "protein_g": 30, "carbs_g": 50, "fat_g": 15}}
        }}
      ],
      "daily_totals": {{"calories": 2000, "protein_g": 150, "carbs_g": 200, "fat_g": 67}}
    }}
  ],
  "total_cost_estimate": 150.00,
  "shopping_list": [
    {{"name": "ingredient", "total_amount": "500g", "estimated_price": 5.00}}
  ]
}}"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )

    # Parse JSON from response
    content = response.content[0].text
    # Handle potential markdown code blocks
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[1].split("```")[0]

    plan_data = json.loads(content)
    return plan_data
```

### Commerce Adapter Pattern

**app/services/commerce/base.py**
```python
from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class Product(BaseModel):
    id: str
    name: str
    price: float
    unit: str
    merchant: str

class CartItem(BaseModel):
    product_id: str
    quantity: float
    unit: str

class Cart(BaseModel):
    id: str
    items: List[CartItem]
    total: float

class Order(BaseModel):
    id: str
    cart_id: str
    status: str
    total: float

class CommerceProvider(ABC):
    @abstractmethod
    async def search_products(self, query: str, limit: int = 10) -> List[Product]:
        pass

    @abstractmethod
    async def create_cart(self, items: List[CartItem]) -> Cart:
        pass

    @abstractmethod
    async def update_cart(self, cart_id: str, items: List[CartItem]) -> Cart:
        pass

    @abstractmethod
    async def checkout(self, cart_id: str) -> Order:
        pass
```

**app/services/commerce/mock.py**
```python
import uuid
from typing import List
from app.services.commerce.base import CommerceProvider, Product, CartItem, Cart, Order

# Mock product database
MOCK_PRODUCTS = {
    "chicken_breast": Product(id="1", name="Chicken Breast", price=8.99, unit="lb", merchant="MockMart"),
    "brown_rice": Product(id="2", name="Brown Rice", price=3.49, unit="lb", merchant="MockMart"),
    "broccoli": Product(id="3", name="Broccoli", price=2.99, unit="lb", merchant="MockMart"),
    "olive_oil": Product(id="4", name="Extra Virgin Olive Oil", price=9.99, unit="bottle", merchant="MockMart"),
    "eggs": Product(id="5", name="Large Eggs (dozen)", price=4.99, unit="dozen", merchant="MockMart"),
    "salmon": Product(id="6", name="Atlantic Salmon", price=12.99, unit="lb", merchant="MockMart"),
    "spinach": Product(id="7", name="Fresh Spinach", price=3.99, unit="bunch", merchant="MockMart"),
    "almonds": Product(id="8", name="Raw Almonds", price=7.99, unit="lb", merchant="MockMart"),
    "greek_yogurt": Product(id="9", name="Greek Yogurt", price=5.99, unit="32oz", merchant="MockMart"),
    "sweet_potato": Product(id="10", name="Sweet Potatoes", price=1.99, unit="lb", merchant="MockMart"),
}

class MockProvider(CommerceProvider):
    def __init__(self):
        self.carts: dict[str, Cart] = {}

    async def search_products(self, query: str, limit: int = 10) -> List[Product]:
        query_lower = query.lower()
        results = [
            p for p in MOCK_PRODUCTS.values()
            if query_lower in p.name.lower()
        ]
        return results[:limit]

    async def create_cart(self, items: List[CartItem]) -> Cart:
        cart_id = str(uuid.uuid4())
        total = sum(
            MOCK_PRODUCTS.get(item.product_id, Product(id="", name="", price=0, unit="", merchant="")).price * item.quantity
            for item in items
        )
        cart = Cart(id=cart_id, items=items, total=round(total, 2))
        self.carts[cart_id] = cart
        return cart

    async def update_cart(self, cart_id: str, items: List[CartItem]) -> Cart:
        total = sum(
            MOCK_PRODUCTS.get(item.product_id, Product(id="", name="", price=0, unit="", merchant="")).price * item.quantity
            for item in items
        )
        cart = Cart(id=cart_id, items=items, total=round(total, 2))
        self.carts[cart_id] = cart
        return cart

    async def checkout(self, cart_id: str) -> Order:
        cart = self.carts.get(cart_id)
        if not cart:
            raise ValueError("Cart not found")

        order_id = str(uuid.uuid4())
        return Order(
            id=order_id,
            cart_id=cart_id,
            status="confirmed",
            total=cart.total
        )

mock_provider = MockProvider()
```

---

## Frontend Implementation

### Vite Configuration

**frontend/vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### Tailwind Configuration (Wellness Theme)

**frontend/tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7f1',
          100: '#d8ead9',
          200: '#b3d6b6',
          300: '#87a878',
          400: '#5d8a60',
          500: '#2d5a3d',
          600: '#244a32',
          700: '#1c3a27',
          800: '#142a1c',
          900: '#0c1a11',
        },
        secondary: {
          50: '#fdf6f3',
          100: '#fae9e2',
          200: '#f4d0c2',
          300: '#e8a98e',
          400: '#c67b5c',
          500: '#a85a3a',
          600: '#8a4730',
          700: '#6c3726',
          800: '#4e281c',
          900: '#301912',
        },
        cream: '#F8F5F0',
        charcoal: '#2C2C2C',
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### API Client

**frontend/src/api/client.ts**
```typescript
const API_BASE = '/api';

interface ApiError {
  detail: string;
  code?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },
  diet: {
    getTypes: () => request<{ types: DietType[] }>('/diet/types'),
    getPreferences: () => request<{ preferences: Preferences }>('/diet/preferences'),
    savePreferences: (prefs: Partial<Preferences>) =>
      request<{ preferences: Preferences }>('/diet/preferences', {
        method: 'POST',
        body: JSON.stringify(prefs),
      }),
  },
  meals: {
    generate: (preferencesId?: number) =>
      request<{ meal_plan: MealPlan }>('/meals/generate', {
        method: 'POST',
        body: JSON.stringify({ preferences_id: preferencesId }),
      }),
    get: (planId: number) =>
      request<{ meal_plan: MealPlan }>(`/meals/${planId}`),
  },
  cart: {
    create: (mealPlanId: number) =>
      request<{ cart: Cart }>('/cart/create', {
        method: 'POST',
        body: JSON.stringify({ meal_plan_id: mealPlanId }),
      }),
    update: (cartId: string, items: CartItem[]) =>
      request<{ cart: Cart }>(`/cart/${cartId}/items`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
  },
  orders: {
    checkout: (cartId: string) =>
      request<{ order: Order }>('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ cart_id: cartId }),
      }),
  },
};
```

### Auth Store (Zustand)

**frontend/src/store/authStore.ts**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### Type Definitions

**frontend/src/types/index.ts**
```typescript
export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface DietType {
  id: string;
  name: string;
  description: string;
  carb_pct: number;
  protein_pct: number;
  fat_pct: number;
}

export interface Allergy {
  id: string;
  name: string;
  examples: string;
}

export interface Preferences {
  id: number;
  user_id: number;
  diet_type: string;
  carb_pct: number;
  protein_pct: number;
  fat_pct: number;
  allergies: string[];
  budget_min: number;
  budget_max: number;
  variety_level: 'minimal' | 'moderate' | 'high';
  meal_days: number;
}

export interface Ingredient {
  name: string;
  amount: string;
  estimated_price: number;
}

export interface Macros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: Ingredient[];
  macros: Macros;
}

export interface DayPlan {
  day: number;
  meals: Meal[];
  daily_totals: Macros;
}

export interface ShoppingItem {
  name: string;
  total_amount: string;
  estimated_price: number;
}

export interface MealPlan {
  id: number;
  days: DayPlan[];
  total_cost_estimate: number;
  shopping_list: ShoppingItem[];
}

export interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  cart_id: string;
  status: string;
  total: number;
  created_at: string;
}
```

---

## Docker Configuration

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend/data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/food_minded.db
      - SECRET_KEY=${SECRET_KEY}
      - USDA_API_KEY=${USDA_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

**backend/Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
