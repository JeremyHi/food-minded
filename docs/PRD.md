# Product Requirements Document (PRD)

## Product Overview

**Product Name**: Food Minded
**Version**: 1.0 (MVP)
**Last Updated**: January 2026

### Vision

Food Minded empowers health-conscious individuals to effortlessly plan nutritious meals that align with their dietary goals, allergies, and budget. By combining AI-powered meal planning with modern commerce protocols, we eliminate the friction between deciding what to eat and getting the ingredients.

### Problem Statement

Planning meals that consistently meet macro targets while avoiding allergens and staying within budget is time-consuming and mentally exhausting. Users must:
1. Research recipes that fit their diet
2. Calculate nutritional values
3. Create shopping lists
4. Find the best prices
5. Manually place orders

This cognitive overhead leads to poor diet adherence and food waste.

### Solution

A unified platform that:
1. Collects user dietary preferences in a simple wizard
2. Generates AI-powered meal plans matching exact macro ratios
3. Automatically creates consolidated grocery lists
4. Enables one-click ordering through commerce APIs

---

## Target Users

### Primary Persona: The Busy Health Optimizer

- **Demographics**: 25-45 years old, working professional
- **Goals**: Follow specific diet (40/30/30, keto) without spending hours on meal planning
- **Pain Points**: Limited time, struggles with consistency, dislikes repetitive meals
- **Tech Comfort**: Comfortable with apps and online shopping

### Secondary Persona: The Allergy-Conscious Parent

- **Demographics**: 30-50 years old, managing household meals
- **Goals**: Plan family meals avoiding specific allergens
- **Pain Points**: Constant ingredient checking, limited recipe options
- **Tech Comfort**: Moderate, values simplicity

---

## User Stories

### Core Flow

1. **As a user**, I want to create an account so I can save my preferences and meal plans.

2. **As a user**, I want to select a diet type (40/30/30, keto, etc.) so the app knows my macro targets.

3. **As a user**, I want to declare my food allergies so I never see ingredients that could harm me.

4. **As a user**, I want to set a weekly budget so my grocery cart stays affordable.

5. **As a user**, I want to choose how varied my meals should be so I can balance convenience vs. variety.

6. **As a user**, I want to specify how many days of meals I need so the plan matches my schedule.

7. **As a user**, I want to see a generated meal plan with daily breakdowns so I know exactly what to eat.

8. **As a user**, I want to view the nutritional breakdown per day so I can verify it meets my targets.

9. **As a user**, I want to see a consolidated grocery list so I don't have duplicate items.

10. **As a user**, I want to edit my cart (add/remove/substitute items) before ordering.

11. **As a user**, I want to confirm and place my order so I receive my groceries.

### Account Management

12. **As a user**, I want to update my diet preferences at any time.

13. **As a user**, I want to view my order history.

---

## Functional Requirements

### FR1: User Authentication
- Email/password registration
- Secure login with JWT tokens
- Password reset capability
- Session management

### FR2: Diet Configuration
- Pre-defined diet type selection
- Custom macro ratio input
- Multi-select allergy declaration
- Budget range slider ($50-$500/week)
- Variety preference (low/medium/high)
- Meal duration selector (1-14 days)

### FR3: Meal Plan Generation
- LLM-powered meal suggestions
- Strict allergy exclusion
- Macro ratio adherence (within 5% tolerance)
- Budget-aware ingredient selection
- Variety level matching
- Daily meal breakdown (breakfast, lunch, dinner, snacks)

### FR4: Grocery Cart
- Consolidated ingredient list from meal plan
- Quantity calculations for specified days
- Item editing (quantity, substitution, removal)
- Price estimation per item
- Total cost calculation
- Budget warning if exceeded

### FR5: Checkout (MVP: Mock)
- Order review screen
- Mock payment processing
- Order confirmation
- Order history storage

### FR6: Commerce Integration (Post-MVP)
- Google UCP integration
- OpenAI ACP integration
- Real merchant connections
- Actual payment processing

---

## Non-Functional Requirements

### Performance
- Page load < 2 seconds
- Meal generation < 10 seconds
- API response < 500ms (excluding LLM calls)

### Scalability
- Support 1,000 concurrent users (MVP target)
- SQLite sufficient for MVP, migration path to PostgreSQL

### Security
- Passwords hashed with bcrypt
- JWT tokens with expiration
- HTTPS only
- Input validation on all endpoints
- No sensitive data in logs

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatible
- Color contrast ratios met

### Reliability
- 99% uptime target
- Graceful error handling
- User-friendly error messages

---

## Success Metrics

### MVP Success Criteria
1. User can complete full flow: register → configure → generate → checkout
2. Generated meals respect macro ratios within 5% tolerance
3. No allergen ingredients appear in generated plans
4. Application deploys with single Docker command
5. Mobile-responsive on common viewport sizes

### Key Performance Indicators (KPIs)
- User registration completion rate
- Meal plan generation success rate
- Cart abandonment rate
- Average session duration
- Return user rate

---

## Constraints

### Technical
- Budget: Indie-hacker scale (minimal infrastructure costs)
- Commerce APIs in waitlist/partner-only status
- USDA API rate limits

### Business
- No payment processing in MVP (mock only)
- No real merchant integrations in MVP
- Single region (US) initially

---

## Out of Scope (MVP)

- Social features (sharing meal plans)
- Recipe instructions/cooking guides
- Nutritionist consultations
- Mobile native apps
- Multi-language support
- Household/family accounts
- Subscription management
- Ingredient sourcing preferences (organic, local, etc.)

---

## Timeline

| Phase | Description |
|-------|-------------|
| Phase 1 | Project setup, auth, basic backend |
| Phase 2 | Diet configuration, USDA integration |
| Phase 3 | LLM meal generation |
| Phase 4 | Frontend foundation |
| Phase 5 | Diet config UI, meal plan UI |
| Phase 6 | Cart and mock checkout |
| Phase 7 | Testing and polish |
