# Food Minded

**Nourish Your Family Without the Stress**

A meal planning and grocery shopping app designed for busy moms and health-conscious women who want to provide the best nutrition for their families without the daily stress of "what's for dinner?"

## The Problem

You want to feed your family healthy, balanced meals but:
- Meal planning takes hours you don't have
- Managing allergies across multiple family members is stressful
- You keep forgetting ingredients and making extra grocery trips
- Sticking to a budget while eating healthy feels impossible

## Our Solution

Food Minded takes the guesswork out of family nutrition. Tell us your dietary goals, family allergies, and budget - we'll create personalized meal plans and consolidated grocery lists that actually work for your real life.

## Screenshots

### Desktop View - Full User Flow

| Home | Register | Login |
|------|----------|-------|
| ![Home](screenshots/desktop/01-home.png) | ![Register](screenshots/desktop/02-register.png) | ![Login](screenshots/desktop/03-login.png) |
| Warm, welcoming landing | Quick signup | Easy sign in |

#### Configuration Wizard (5-Step Process)

| Step 1: Diet Type | Step 2: Allergies | Step 3: Budget |
|-------------------|-------------------|----------------|
| ![Diet](screenshots/desktop/04-wizard-step1-diet.png) | ![Allergies](screenshots/desktop/05-wizard-step2-allergies.png) | ![Budget](screenshots/desktop/06-wizard-step3-budget.png) |
| Choose nutrition style | Set family allergies | Budget & duration |

| Step 4: Variety | Step 5: Summary |
|-----------------|-----------------|
| ![Variety](screenshots/desktop/07-wizard-step4-variety.png) | ![Summary](screenshots/desktop/08-wizard-step5-summary.png) |
| Meal variety preference | Review & confirm |

#### Meal Plan, Cart & Checkout

| Meal Plan | Shopping Cart | Checkout | Confirmed |
|-----------|---------------|----------|-----------|
| ![Plan](screenshots/desktop/09-meal-plan.png) | ![Cart](screenshots/desktop/10-cart.png) | ![Checkout](screenshots/desktop/11-checkout.png) | ![Confirmed](screenshots/desktop/12-order-confirmed.png) |
| 3-day plan with macros | Edit quantities | Delivery options | Order success! |

### Mobile View (iPhone 17 Pro)

| Home | Register | Wizard Step 1 | Wizard Step 2 |
|------|----------|---------------|---------------|
| ![Home](screenshots/mobile/01-home.png) | ![Register](screenshots/mobile/02-register.png) | ![Step1](screenshots/mobile/03-wizard-step1.png) | ![Step2](screenshots/mobile/04-wizard-step2.png) |

| Wizard Step 3 | Wizard Step 4 | Wizard Step 5 | Meal Plan |
|---------------|---------------|---------------|-----------|
| ![Step3](screenshots/mobile/05-wizard-step3.png) | ![Step4](screenshots/mobile/06-wizard-step4.png) | ![Step5](screenshots/mobile/07-wizard-step5.png) | ![Plan](screenshots/mobile/08-meal-plan.png) |

| Shopping Cart | Checkout | Order Confirmed |
|---------------|----------|-----------------|
| ![Cart](screenshots/mobile/09-cart.png) | ![Checkout](screenshots/mobile/10-checkout.png) | ![Confirmed](screenshots/mobile/11-order-confirmed.png) |

## MVP Features

### 1. Multi-Step Configuration Wizard
- **5-Step Process**: Guided setup with progress indicator and smooth animations
- **Back/Edit Support**: Go back to any step to adjust your choices
- **Summary Review**: Confirm all selections before generating your plan

### 2. Family-Friendly Diet Configuration
- **Multiple Diet Types**: Zone Diet (40/30/30), Ketogenic, Balanced, High Protein, Low Carb, Mediterranean
- **Macro Tracking**: Automatic calculation of daily carb, protein, and fat targets based on calorie goals
- **Family-Focused Language**: Designed with parents and families in mind

### 3. Allergy Safety
- **8 Common Allergens**: Tree Nuts, Peanuts, Dairy, Eggs, Wheat/Gluten, Soy, Fish, Shellfish
- **Automatic Filtering**: All meal suggestions automatically exclude declared allergens
- **Peace of Mind**: Never worry about accidentally serving something unsafe

### 4. Budget & Planning Control
- **Weekly Budget Slider**: Set your grocery spending limit ($50-$500)
- **Flexible Duration**: Plan for 3, 5, 7, 10, or 14 days at a time
- **Calorie Customization**: Adjust per-person calories to match your family's needs

### 5. Meal Variety Options
- **Minimal**: Batch cooking approach - less prep, more efficiency
- **Moderate**: Good balance for families who like some variety
- **High**: Different meals every day for adventurous eaters

### 6. Complete Meal Plans
- **Daily Breakdown**: Breakfast, lunch, dinner, and snacks with macros
- **Per-Meal Nutrition**: Calories, protein, carbs, and fat for each meal
- **Shopping List**: Consolidated ingredients with estimated prices

### 7. Shopping Cart & Checkout
- **Categorized Items**: Protein, Dairy, Produce, Grains, Pantry, Deli
- **Quantity Controls**: Adjust amounts or remove items
- **Delivery Options**: Store pickup (free) or home delivery
- **Order Confirmation**: Clear next steps after placing order

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Backend** | Python FastAPI, SQLite, SQLAlchemy ORM |
| **AI** | Claude API for intelligent meal generation |
| **Food Data** | USDA FoodData Central API |
| **Auth** | JWT tokens with bcrypt password hashing |
| **Deployment** | Docker Compose |

## Design Philosophy

Food Minded follows **indie hacker best practices** with a focus on:
- **Warm, Natural Aesthetics**: Terracotta (#D97757) and sage (#6B8E6B) color palette
- **Mobile-First**: Designed for busy parents checking their phones while managing chaos
- **Clear Typography**: DM Serif Display headers with Nunito body text for readability
- **Supportive Messaging**: Encouraging language that helps, not judges
- **Modern UX**: Step-by-step wizard with smooth animations and progress indicators

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/JeremyHi/food-minded.git
cd food-minded

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev -- --port 3001
```

### Docker Deployment

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start with Docker
docker-compose up --build
```

**Access Points:**
- Frontend: http://localhost:3000 (Docker) or http://localhost:3001 (local dev)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT secret for authentication | Yes |
| `USDA_API_KEY` | From [api.nal.usda.gov](https://fdc.nal.usda.gov/api-guide.html) | Yes |
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) | Yes |

## Documentation

- [Product Requirements](docs/PRD.md) - Detailed feature specifications
- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [Implementation Guide](docs/IMPLEMENTATION.md) - Development guidelines
- [MVP Plan](docs/MVP_PLAN.md) - Phase-by-phase delivery plan

## Target Audience

Food Minded is built for:
- **Busy Moms** juggling work, kids, and household management
- **Health-Conscious Women** who want to eat well without obsessing
- **Parents with Allergies** who need reliable allergy filtering
- **Budget-Conscious Families** trying to eat healthy without breaking the bank

## Contributing

This is an indie project built with care. Issues and PRs welcome!

## License

MIT

---

*Built with care for families who value good nutrition.*
