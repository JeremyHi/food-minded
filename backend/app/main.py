from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, diet, meals, cart, billing

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Meal planning and grocery shopping with smart diet-based recommendations",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(diet.router, prefix="/api/diet", tags=["Diet Configuration"])
app.include_router(meals.router, prefix="/api/meals", tags=["Meal Planning"])
app.include_router(cart.router, prefix="/api/cart", tags=["Shopping Cart"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing & Subscriptions"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "app": settings.APP_NAME}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/api/health",
    }
