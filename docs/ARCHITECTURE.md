# System Architecture

## Overview

Food Minded follows a modern, lightweight architecture optimized for indie-hacker deployment. The system uses a containerized approach with clear separation between frontend and backend services.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                           │
├────────────────────────────┬────────────────────────────────────┤
│    Frontend Container      │       Backend Container            │
│    (nginx + React SPA)     │       (FastAPI + SQLite)           │
│                            │                                    │
│    Port: 3000              │       Port: 8000                   │
├────────────────────────────┼────────────────────────────────────┤
│                            │                                    │
│  ┌──────────────────┐      │  ┌────────────────────────────┐   │
│  │   React App      │      │  │      FastAPI App           │   │
│  │                  │      │  │                            │   │
│  │  - Vite build    │      │  │  - REST API endpoints      │   │
│  │  - TypeScript    │◄────►│  │  - JWT authentication      │   │
│  │  - Tailwind CSS  │      │  │  - Business logic          │   │
│  │  - Zustand state │      │  │  - Database access         │   │
│  └──────────────────┘      │  └────────────────────────────┘   │
│                            │               │                    │
│                            │               ▼                    │
│                            │  ┌────────────────────────────┐   │
│                            │  │      SQLite Database       │   │
│                            │  │                            │   │
│                            │  │  - users                   │   │
│                            │  │  - preferences             │   │
│                            │  │  - meal_plans              │   │
│                            │  │  - orders                  │   │
│                            │  └────────────────────────────┘   │
│                            │                                    │
└────────────────────────────┴────────────────────────────────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                          ▼               ▼               ▼
                    ┌──────────┐   ┌──────────┐   ┌──────────┐
                    │  USDA    │   │  Claude  │   │ Commerce │
                    │  API     │   │  API     │   │ Providers│
                    │          │   │          │   │          │
                    │ Nutrition│   │ Meal Gen │   │ UCP/ACP  │
                    └──────────┘   └──────────┘   └──────────┘
```

---

## Component Details

### Frontend (React SPA)

**Purpose**: User interface for meal planning workflow

**Technology Stack**:
- React 18 with functional components and hooks
- TypeScript for type safety
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation

**Key Modules**:
```
src/
├── api/          # API client and request handling
├── components/   # Reusable UI components
│   ├── ui/       # Base components (Button, Card, Input)
│   ├── diet/     # Diet configuration components
│   ├── meals/    # Meal plan display components
│   └── cart/     # Shopping cart components
├── pages/        # Route-level components
├── hooks/        # Custom React hooks
├── store/        # Zustand state stores
└── types/        # TypeScript type definitions
```

**Nginx Configuration**:
- Serves static build files
- Proxies `/api/*` requests to backend
- Handles SPA routing (fallback to index.html)

### Backend (FastAPI)

**Purpose**: API server, business logic, data persistence

**Technology Stack**:
- Python 3.11+
- FastAPI for async API framework
- SQLAlchemy for ORM
- Pydantic for data validation
- Alembic for migrations
- bcrypt for password hashing
- PyJWT for token handling

**Key Modules**:
```
app/
├── main.py       # Application entry point
├── config.py     # Environment configuration
├── database.py   # Database connection setup
├── models/       # SQLAlchemy models
├── schemas/      # Pydantic schemas
├── routers/      # API route handlers
├── services/     # Business logic layer
│   ├── auth.py          # Authentication service
│   ├── usda.py          # USDA API integration
│   ├── meal_planner.py  # LLM meal generation
│   └── commerce/        # Commerce adapter layer
└── utils/        # Utility functions
```

### Database (SQLite)

**Purpose**: Persistent storage for users, preferences, and orders

**Why SQLite**:
- Zero configuration
- Single file, easy backup
- Sufficient for MVP scale
- Migration path to PostgreSQL

**Schema**:
```sql
users
├── id (PK)
├── email (UNIQUE)
├── password_hash
└── created_at

preferences
├── id (PK)
├── user_id (FK → users)
├── diet_type
├── carb_pct
├── protein_pct
├── fat_pct
├── allergies (JSON)
├── budget_min
├── budget_max
├── variety_level
├── meal_days
└── updated_at

meal_plans
├── id (PK)
├── user_id (FK → users)
├── preferences_id (FK → preferences)
├── plan_data (JSON)
├── total_cost_estimate
└── created_at

orders
├── id (PK)
├── user_id (FK → users)
├── meal_plan_id (FK → meal_plans)
├── cart_data (JSON)
├── status
├── provider
└── created_at
```

---

## External Integrations

### USDA FoodData Central API

**Purpose**: Nutritional data for foods and ingredients

**Endpoint**: `https://api.nal.usda.gov/fdc/v1/`

**Usage**:
- Search foods by name
- Get detailed nutrition (calories, macros)
- Validate meal plan nutritional accuracy

**Caching Strategy**:
- Cache common foods in local database
- Refresh cache periodically
- Reduce API calls and latency

### Claude API (Anthropic)

**Purpose**: Generate contextual meal plans

**Usage**:
- Receive user preferences as input
- Generate meal suggestions
- Ensure variety and dietary compliance
- Output structured meal plan data

**Prompt Engineering**:
- Include all constraints (macros, allergies, budget)
- Request structured JSON output
- Validate against USDA data

### Commerce Providers (Future)

**Purpose**: Real grocery purchasing

**Supported Protocols**:
- Google Universal Commerce Protocol (UCP)
- OpenAI Agentic Commerce Protocol (ACP)

**Adapter Pattern**:
```python
class CommerceProvider(ABC):
    @abstractmethod
    async def search_products(query: str) -> List[Product]

    @abstractmethod
    async def create_cart(items: List[CartItem]) -> Cart

    @abstractmethod
    async def checkout(cart_id: str, payment: PaymentInfo) -> Order
```

---

## API Design

### Authentication Flow

```
POST /api/auth/register
  Body: { email, password }
  Response: { user, token }

POST /api/auth/login
  Body: { email, password }
  Response: { user, token }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { user }
```

### Diet Configuration Flow

```
GET /api/diet/types
  Response: { types: [...] }

POST /api/diet/preferences
  Headers: Authorization: Bearer <token>
  Body: { diet_type, allergies, budget_min, budget_max, variety_level, meal_days }
  Response: { preferences }

GET /api/diet/preferences
  Headers: Authorization: Bearer <token>
  Response: { preferences }
```

### Meal Planning Flow

```
POST /api/meals/generate
  Headers: Authorization: Bearer <token>
  Body: { preferences_id? }
  Response: { meal_plan }

GET /api/meals/{plan_id}
  Headers: Authorization: Bearer <token>
  Response: { meal_plan }
```

### Cart & Checkout Flow

```
POST /api/cart/create
  Headers: Authorization: Bearer <token>
  Body: { meal_plan_id }
  Response: { cart }

PUT /api/cart/{id}/items
  Headers: Authorization: Bearer <token>
  Body: { items: [...] }
  Response: { cart }

POST /api/orders/checkout
  Headers: Authorization: Bearer <token>
  Body: { cart_id }
  Response: { order }
```

---

## Security Architecture

### Authentication
- JWT tokens with 24-hour expiration
- Refresh token rotation (optional)
- Secure password hashing (bcrypt, cost=12)

### Authorization
- Token validation middleware
- User-scoped data access
- No cross-user data leakage

### Data Protection
- HTTPS only (TLS termination at nginx)
- Input validation on all endpoints
- SQL injection prevention (ORM)
- XSS prevention (React escaping)

### Secrets Management
- Environment variables for secrets
- `.env` file for local development
- Docker secrets for production

---

## Deployment Architecture

### Development
```bash
# Frontend (hot reload)
cd frontend && npm run dev

# Backend (hot reload)
cd backend && uvicorn app.main:app --reload
```

### Production (Docker Compose)
```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:80"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes:
      - ./backend/data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/food_minded.db
```

### Scaling Considerations
- SQLite → PostgreSQL migration
- Add Redis for session caching
- Horizontal scaling with load balancer
- CDN for static assets

---

## Error Handling

### API Error Format
```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE",
  "field": "optional_field_name"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Logging
- Structured JSON logs
- Request ID tracking
- No sensitive data in logs
- Log levels: DEBUG, INFO, WARNING, ERROR
