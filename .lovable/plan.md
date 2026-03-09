

# Plan: Revamped Onboarding Flow + Profile Persistence + Returning User Flow

## Summary

Overhaul the onboarding into three screens (About You → Your Goal → Food Picks), persist all data to the database, skip onboarding for returning users, add Edit Profile, and remove "Start Over."

---

## 1. Database Migration

Add columns to the `profiles` table:

```sql
ALTER TABLE public.profiles
  ADD COLUMN biological_sex text DEFAULT 'female',
  ADD COLUMN age integer DEFAULT 30,
  ADD COLUMN height_ft integer,
  ADD COLUMN height_in integer,
  ADD COLUMN current_weight_lbs numeric,
  ADD COLUMN goal_weight_lbs numeric,
  ADD COLUMN activity_level text,
  ADD COLUMN bmi numeric,
  ADD COLUMN bmr numeric,
  ADD COLUMN tdee numeric,
  ADD COLUMN selected_goal text,
  ADD COLUMN target_calories integer,
  ADD COLUMN protein_pct integer DEFAULT 30,
  ADD COLUMN carb_pct integer DEFAULT 40,
  ADD COLUMN fat_pct integer DEFAULT 30,
  ADD COLUMN meals_selected text[] DEFAULT '{}',
  ADD COLUMN protein_choice text,
  ADD COLUMN carb_choice text,
  ADD COLUMN veggie_choice text,
  ADD COLUMN fat_choice text,
  ADD COLUMN weekly_budget text,
  ADD COLUMN serving_size text DEFAULT 'just_me',
  ADD COLUMN onboarding_completed boolean DEFAULT false;
```

---

## 2. Screen 2A — "About You" (`src/pages/Goals.tsx` rewrite)

Replace the current Goals page. Single scrollable screen, "Step 1 of 3":

- **Biological Sex**: Two large toggle buttons (Female / Male), primary fill on selected
- **Age**: Slider 18–80, step 1, default 30, large centered number above track
- **Height**: Two side-by-side numeric inputs (ft 3–7, in 0–11)
- **Current Weight & Goal Weight**: Two side-by-side numeric inputs (lbs)
- **Activity Level**: 4 vertical radio cards with emojis (🪑 🚶 🏃 💪) and descriptions
- **"Next →"** button: Calculates BMR (Mifflin-St Jeor with sex), TDEE, BMI in-browser, stores in context, navigates to `/your-goal`

---

## 3. Screen 2B — "Your Goal" (new page `src/pages/YourGoal.tsx`)

New route `/your-goal`, "Step 2 of 3":

- **Top stats row**: 3 horizontal cards — BMI (with color pill), TDEE (rounded to 10), Calorie Target (dynamic)
- **4 goal cards** (Lose Weight, Build Muscle, Maintain, Gain Weight) each with emoji, description, calorie delta, macro percentages
- **Auto-select** based on current vs goal weight direction
- **Live macro bars**: 3 animated horizontal bars (protein/carbs/fat) updating on goal selection
- **"This looks good →"**: Stores goal + macros in context, navigates to `/preferences`

---

## 4. Screen 2C — Food Picks (`src/pages/Preferences.tsx` + `src/pages/FoodPicks.tsx`)

- Merge current Preferences (avoidances/household) into FoodPicks as one screen
- Update progress to "Step 3 of 3"
- On "Generate My Meal Plan ✨": Save ALL profile fields to database via Supabase update, set `onboarding_completed = true`, then navigate to `/meal-plan`

---

## 5. Returning User Flow

Modify `src/pages/Welcome.tsx` (or `ProtectedRoute`):

- On auth, fetch profile from database
- If `onboarding_completed === true`: redirect straight to `/meal-plan`, hydrate context from DB
- If not: go to `/goals` (onboarding)

**MealPlan page updates:**
- Add profile summary card at top: "[Goal emoji] [Goal name] · [Calories] cal/day · [P]P [C]C [F]F"
- Replace the regenerate-only-when-locked behavior with an always-visible "Regenerate Plan ✨" button

---

## 6. Edit Profile

- New page `src/pages/EditProfile.tsx` at route `/edit-profile`
- Pre-filled with all saved fields from database
- On save: recalculate BMI, BMR, TDEE, target calories; update profile row
- Add "Edit Profile" menu item to `AppHeader.tsx` dropdown (with a pencil icon), above "Log out"

---

## 7. Remove "Start Over"

- **CookGuide.tsx**: Remove "Start Over" button, keep "← Meal Plan" nav
- **Context**: Keep `reset()` but it's no longer exposed in UI
- **MealPlan.tsx**: "Regenerate Plan ✨" button always visible at top (not just when meals locked)

---

## 8. Routing Changes (`App.tsx`)

```
/goals        → About You (Screen 2A)
/your-goal    → Your Goal (Screen 2B, new)
/food-picks   → Food Picks (Screen 2C, merged with preferences)
/edit-profile → Edit Profile (new)
```

Remove `/preferences` route (merged into food-picks). Remove Welcome page redirect logic — handle in ProtectedRoute.

---

## 9. Context Updates (`MealPrepContext.tsx`)

Add fields: `biologicalSex`, `age`, `heightFt`, `heightIn`, `bmi`, `bmr`, `selectedGoal`, `targetCalories`, `onboardingCompleted`. Update `UserProfile` interface accordingly.

---

## Files Changed

| File | Action |
|------|--------|
| Database migration | Add ~20 columns to profiles |
| `src/pages/Goals.tsx` | Rewrite as "About You" |
| `src/pages/YourGoal.tsx` | Create new |
| `src/pages/FoodPicks.tsx` | Merge preferences content, persist to DB |
| `src/pages/Preferences.tsx` | Delete (merged) |
| `src/pages/EditProfile.tsx` | Create new |
| `src/pages/Welcome.tsx` | Rewrite as redirect logic |
| `src/pages/MealPlan.tsx` | Add summary card, always-visible regenerate, remove start-over |
| `src/pages/CookGuide.tsx` | Remove "Start Over" button |
| `src/components/AppHeader.tsx` | Add "Edit Profile" dropdown item |
| `src/components/ProtectedRoute.tsx` | Add profile fetch + onboarding check |
| `src/context/MealPrepContext.tsx` | Expand interfaces and state |
| `src/App.tsx` | Update routes |

