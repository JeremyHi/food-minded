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

### Desktop View

| Home | Register | Configure |
|------|----------|-----------|
| ![Home](screenshots/desktop/01-home.png) | ![Register](screenshots/desktop/02-register.png) | ![Configure](screenshots/desktop/03-configure.png) |
| Warm, welcoming landing page focused on family nutrition | Simple signup to start your meal planning journey | Comprehensive diet configuration with allergy management |

### Mobile View (iPhone 17 Pro)

| Home | Register | Configure | Full Config |
|------|----------|-----------|-------------|
| ![Home Mobile](screenshots/mobile/01-home.png) | ![Register Mobile](screenshots/mobile/02-register.png) | ![Configure Mobile](screenshots/mobile/03-configure.png) | ![Configure Full](screenshots/mobile/04-configure-full.png) |
| Mobile-first design for busy moms on the go | Quick registration on any device | Diet preferences at your fingertips | Complete meal planning configuration |

## MVP Features

### 1. Family-Friendly Diet Configuration
- **Multiple Diet Types**: Zone Diet (40/30/30), Ketogenic, Balanced, High Protein, Low Carb, Mediterranean
- **Macro Tracking**: Automatic calculation of daily carb, protein, and fat targets based on calorie goals
- **Family-Focused Language**: Designed with parents and families in mind

### 2. Allergy Safety
- **8 Common Allergens**: Tree Nuts, Peanuts, Dairy, Eggs, Wheat/Gluten, Soy, Fish, Shellfish
- **Automatic Filtering**: All meal suggestions automatically exclude declared allergens
- **Peace of Mind**: Never worry about accidentally serving something unsafe

### 3. Budget & Planning Control
- **Weekly Budget Slider**: Set your grocery spending limit ($50-$500)
- **Flexible Duration**: Plan for 3, 5, 7, 10, or 14 days at a time
- **Calorie Customization**: Adjust per-person calories to match your family's needs

### 4. Meal Variety Options
- **Minimal**: Batch cooking approach - less prep, more efficiency
- **Moderate**: Good balance for families who like some variety
- **High**: Different meals every day for adventurous eaters

### 5. AI-Powered Meal Generation
- **Smart Suggestions**: LLM-powered meal plans that respect all your preferences
- **Nutrition-First**: Meals designed to hit your macro targets while tasting great
- **Grocery Optimization**: Consolidated shopping lists that minimize waste and trips

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
- **Warm, Natural Aesthetics**: Terracotta and sage color palette that feels welcoming, not clinical
- **Mobile-First**: Designed for busy parents checking their phones while managing chaos
- **Clear Typography**: DM Serif Display headers with Nunito body text for readability
- **Supportive Messaging**: Encouraging language that helps, not judges

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
