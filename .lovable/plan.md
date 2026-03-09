

## Plan: Expand Walkthrough Carousel to 6 Steps with Real Screenshots

### Steps

**1. Capture 6 screenshots from the live preview**
Navigate through the app and take screenshots of each screen:
- Step 1: Goals (TDEE calculator)
- Step 2: Preferences (food avoidances, household size)
- Step 3: Meal Plan (weekly view)
- Step 4: Lock & Regenerate (meal plan with locked meals highlighted)
- Step 5: Cook Guide
- Step 6: Grocery List

Note: You'll need to be logged in so I can navigate through the app screens. If not already logged in, I'll ask you to log in first.

**2. Save screenshots as assets**
Replace existing `src/assets/screenshot-*.png` files and add two new ones:
- `screenshot-goals.png`
- `screenshot-preferences.png`
- `screenshot-mealplan.png`
- `screenshot-lockregen.png` (new)
- `screenshot-cookguide.png` (new)
- `screenshot-grocery.png`

**3. Update `src/pages/Auth.tsx`**
Update the `walkthrough` array from 4 items to 6:

| Step | Title | Description |
|------|-------|-------------|
| 1 | Calculate Your Needs | TDEE science for calorie & macro targets |
| 2 | Set Preferences | Food avoidances, household size, dietary style |
| 3 | Your Weekly Meal Plan | AI-generated meals for every day |
| 4 | Lock & Regenerate | Lock meals you love, regenerate the rest |
| 5 | Cook Guide | Step-by-step instructions for each meal |
| 6 | Grocery List | Auto-generated list grouped by aisle |

Each slide uses the same card layout with step number, emoji, title, description, and screenshot image.

### No backend changes needed.

