# MVP Plan

## Overview

This document outlines the Minimum Viable Product (MVP) for Food Minded. The goal is to deliver a functional meal planning and grocery cart application that demonstrates the core value proposition.

---

## MVP Scope

### In Scope

| Feature | Description |
|---------|-------------|
| User Authentication | Register, login, session management |
| Diet Configuration | Select diet type, declare allergies, set budget/variety |
| Meal Plan Generation | LLM-powered meal suggestions |
| Grocery Cart | View, edit, and confirm shopping list |
| Mock Checkout | Simulated order placement |

### Out of Scope (MVP)

- Real payment processing
- Real merchant integrations (UCP/ACP)
- Social features
- Mobile native apps
- Multi-language support
- Recipe/cooking instructions
- Subscription management

---

## Sprint Breakdown

### Sprint 1: Project Foundation

**Duration**: Initial setup

**Deliverables**:
- [x] GitHub repository created
- [x] README.md with project overview
- [x] .gitignore configured
- [x] Claude Code configuration (.claude/settings.json)
- [x] Frontend-design skill installed
- [x] Documentation structure (docs/)
- [ ] Docker Compose skeleton
- [ ] Backend project structure
- [ ] Frontend project structure

**Acceptance Criteria**:
- Repository accessible at GitHub
- `docker-compose up` starts both services (skeleton)

---

### Sprint 2: Backend Foundation

**Duration**: Backend core

**Deliverables**:
- [ ] FastAPI application structure
- [ ] SQLite database setup
- [ ] User model with migrations
- [ ] Auth endpoints (register, login, me)
- [ ] JWT middleware
- [ ] CORS configuration
- [ ] Health check endpoint

**API Endpoints**:
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/health
```

**Acceptance Criteria**:
- Can register new user via API
- Can login and receive JWT token
- Protected endpoints require valid token
- API docs available at /docs

---

### Sprint 3: Diet Configuration

**Duration**: Diet features

**Deliverables**:
- [ ] Preferences model
- [ ] Diet types data (40-30-30, keto, etc.)
- [ ] Allergies list
- [ ] Diet preferences endpoints
- [ ] Preference validation

**API Endpoints**:
```
GET  /api/diet/types
GET  /api/diet/allergies
POST /api/diet/preferences
GET  /api/diet/preferences
```

**Acceptance Criteria**:
- Can retrieve list of diet types
- Can save user preferences
- Preferences persist across sessions

---

### Sprint 4: USDA Integration

**Duration**: Food data

**Deliverables**:
- [ ] USDA API service
- [ ] Food search endpoint
- [ ] Nutrition data extraction
- [ ] Local caching for common foods
- [ ] Error handling for API limits

**Acceptance Criteria**:
- Can search for foods by name
- Returns accurate macro information
- Handles API errors gracefully

---

### Sprint 5: Meal Plan Generation

**Duration**: LLM integration

**Deliverables**:
- [ ] Claude API integration
- [ ] Meal plan prompt engineering
- [ ] Plan generation endpoint
- [ ] Plan storage (meal_plans table)
- [ ] Plan retrieval endpoint

**API Endpoints**:
```
POST /api/meals/generate
GET  /api/meals/{plan_id}
```

**Acceptance Criteria**:
- Generates meal plan matching macro targets
- Excludes allergen ingredients
- Returns structured plan data
- Plan saved to database

---

### Sprint 6: Frontend Shell

**Duration**: React foundation

**Deliverables**:
- [ ] Vite + React + TypeScript setup
- [ ] Tailwind CSS with wellness theme
- [ ] Router configuration
- [ ] API client
- [ ] Auth store (Zustand)
- [ ] Page components (shells)
- [ ] Protected route wrapper

**Pages**:
```
/           - Home (landing)
/login      - Login form
/register   - Registration form
/configure  - Diet configuration
/plan       - Meal plan display
/cart       - Shopping cart
/checkout   - Checkout flow
```

**Acceptance Criteria**:
- All routes accessible
- Auth state persists on refresh
- API client configured for all endpoints

---

### Sprint 7: Auth UI

**Duration**: Auth pages

**Deliverables**:
- [ ] Login page component
- [ ] Register page component
- [ ] Form validation
- [ ] Error display
- [ ] Success redirects

**Acceptance Criteria**:
- Can register new account via UI
- Can login via UI
- Invalid inputs show errors
- Successful auth redirects to /configure

---

### Sprint 8: Diet Configuration UI

**Duration**: Config wizard

**Deliverables**:
- [ ] DietTypeSelector component
- [ ] MacroDisplay component (pie chart)
- [ ] AllergySelector component (chips)
- [ ] BudgetSlider component
- [ ] VarietySelector component
- [ ] DaySelector component
- [ ] Configuration wizard flow

**Acceptance Criteria**:
- Can select diet type
- Can declare allergies
- Can set budget range
- Can set variety level
- Can set meal duration
- Configuration saves on submit

---

### Sprint 9: Meal Plan UI

**Duration**: Plan display

**Deliverables**:
- [ ] MealPlanGrid component
- [ ] DayColumn component
- [ ] MealCard component
- [ ] MacroSummary component
- [ ] IngredientList component
- [ ] RegenerateButton component
- [ ] Loading state

**Acceptance Criteria**:
- Triggers plan generation
- Displays loading state
- Shows meal grid by day
- Shows daily macro totals
- Shows consolidated ingredient list
- Can regenerate plan

---

### Sprint 10: Cart & Checkout

**Duration**: Cart flow

**Deliverables**:
- [ ] CartPage component
- [ ] CartItem component (editable)
- [ ] CartSummary component
- [ ] Budget warning
- [ ] CheckoutPage component
- [ ] OrderConfirmation component
- [ ] Mock checkout integration

**Acceptance Criteria**:
- Cart populated from meal plan
- Can edit item quantities
- Can remove items
- Shows total and budget status
- Mock checkout completes
- Shows order confirmation

---

### Sprint 11: Polish & Testing

**Duration**: Final polish

**Deliverables**:
- [ ] E2E test scenarios (Chrome DevTools MCP)
- [ ] Mobile responsiveness
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility review
- [ ] Performance optimization

**Acceptance Criteria**:
- All E2E tests pass
- Responsive on mobile viewports
- No accessibility violations
- Page load < 2 seconds

---

## MVP User Journey

```
1. User lands on homepage
   └── Sees value proposition, CTA to register

2. User registers account
   └── Email/password form
   └── Redirected to diet configuration

3. User configures diet
   └── Selects 40/30/30 diet type
   └── Declares tree nut allergy
   └── Sets $100-150 budget
   └── Chooses moderate variety
   └── Sets 7 days duration
   └── Saves preferences

4. User generates meal plan
   └── Clicks "Generate Plan"
   └── Sees loading indicator
   └── Views 7-day meal grid
   └── Checks daily macro totals
   └── Reviews ingredient list

5. User reviews cart
   └── Navigates to cart
   └── Sees all ingredients with prices
   └── Adjusts quantity of one item
   └── Removes one item
   └── Verifies total within budget

6. User completes checkout
   └── Proceeds to checkout
   └── Reviews order summary
   └── Confirms order (mock)
   └── Sees confirmation page
```

---

## Success Metrics

### Functional Metrics

| Metric | Target |
|--------|--------|
| Registration completion | 100% (no errors) |
| Login success rate | 100% (valid credentials) |
| Plan generation success | 95%+ |
| Macro accuracy | Within 5% of targets |
| Allergen compliance | 100% (no allergens in plans) |
| Checkout completion | 100% (mock) |

### Performance Metrics

| Metric | Target |
|--------|--------|
| Initial page load | < 2 seconds |
| API response time | < 500ms |
| Plan generation time | < 15 seconds |
| Lighthouse score | > 80 |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Unit test coverage | > 70% |
| E2E test pass rate | 100% |
| Accessibility score | WCAG 2.1 AA |
| Mobile compatibility | iOS Safari, Chrome Mobile |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| LLM returns invalid JSON | JSON parsing with fallback, retry logic |
| USDA API rate limits | Local caching, batch requests |
| LLM includes allergens | Post-generation validation check |
| Budget exceeded | Warning UI, not a hard block |
| Slow plan generation | Loading UI, timeout handling |

---

## Post-MVP Roadmap

### Phase 2: Commerce Integration
- Google UCP integration
- OpenAI ACP integration
- Real merchant connections

### Phase 3: Enhanced Features
- Recipe instructions
- Nutritionist chat
- Meal history and favorites
- Family/household accounts

### Phase 4: Platform Expansion
- Mobile app (React Native)
- Multi-language support
- International markets
