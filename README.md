# Food Minded

Meal planning and grocery shopping app with smart diet-based recommendations.

## Overview

Food Minded helps users create personalized meal plans based on their dietary preferences, allergies, budget, and variety preferences. The app generates optimized grocery lists and facilitates purchasing through modern commerce protocols.

## Features

- **Diet Configuration**: Support for various diet types including 40/30/30 (Zone Diet), Keto, Balanced, and High Protein
- **Allergy Management**: Automatically excludes ingredients based on declared allergies
- **Budget Control**: Set your weekly grocery budget with a simple slider
- **Variety Preferences**: Choose between minimal to high meal variety
- **Smart Meal Planning**: LLM-powered meal suggestions that meet your macro targets
- **Grocery Cart**: Review, edit, and confirm your grocery list before ordering
- **Commerce Integration**: Built with Google UCP and OpenAI ACP compatibility

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI + SQLite
- **AI**: Claude API for meal plan generation
- **Food Data**: USDA FoodData Central API
- **Deployment**: Docker Compose

## Quick Start

```bash
# Clone the repository
git clone https://github.com/JeremyHi/food-minded.git
cd food-minded

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start with Docker
docker-compose up --build
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT secret key for authentication |
| `USDA_API_KEY` | API key from api.nal.usda.gov |
| `ANTHROPIC_API_KEY` | API key from console.anthropic.com |

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Implementation Guide](docs/IMPLEMENTATION.md)
- [MVP Plan](docs/MVP_PLAN.md)

## License

MIT
