

## Plan: Enhanced Auth/Landing Page with App Walkthrough

Since we can't embed actual videos, we'll create a visually rich landing page with an **interactive screenshot carousel** that walks users through the app flow before they sign up.

### Layout Redesign for `src/pages/Auth.tsx`

Restructure into two sections (scrollable on mobile):

**Section 1 — Hero + Feature Walkthrough (top)**
- Hero tagline: "Your weekly meal prep, done in one Sunday."
- Subtitle explaining the value prop: "Set your goals, pick your foods, and get an AI-generated meal plan with grocery list and cook guide — all in under 5 minutes."
- **3 feature highlight cards** in a horizontal row (stacked on mobile):
  - 🎯 "Set Your Goals" — "Tell us your calorie target and activity level"
  - 🥑 "Pick Your Foods" — "Choose proteins, grains, and veggies you love"
  - 📋 "Get Your Plan" — "AI builds your weekly meals, grocery list, and cook guide"
- **Screenshot carousel** using the existing `Carousel` component (`embla-carousel-react` is already installed). 4 slides showing mockup screenshots of the app screens:
  - Step 1: Goals screen (TDEE calculator)
  - Step 2: Preferences screen (food avoidances + household)
  - Step 3: Meal plan view with lock/regenerate
  - Step 4: Grocery list / cook guide
  - Each slide: a styled mockup card with an emoji illustration + descriptive text (since we don't have actual screenshot images, we'll create illustrative UI mockup cards that represent each screen)
- Dot indicators for carousel position

**Section 2 — Auth Form (bottom)**
- The existing sign-in/sign-up form, unchanged in functionality
- Moved into a card with subtle border for visual separation

### Files to Change

1. **`src/pages/Auth.tsx`** — Complete redesign of the layout to add the hero section, feature cards, and carousel above the auth form. Import and use the existing `Carousel`, `CarouselContent`, `CarouselItem` components.

2. **No new files or dependencies needed** — everything uses existing components (`Carousel`, `Card`) and Tailwind classes.

### No backend changes required.

