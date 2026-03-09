# MealPrepFriend — Product Requirements Document

> **Version:** 0.1.0  
> **Last Updated:** 2026-03-09  
> **Status:** V1 — Live

---

## 1. Product Overview

**Product Name:** MealPrepFriend  
**Tagline:** Your weekly meal prep, done in one Sunday.

**Description:**  
MealPrepFriend is an AI-powered weekly meal prep planner that generates personalized 7-day meal plans based on a user's biometric data, dietary preferences, and nutritional goals. Users complete a quick onboarding flow, and the app produces a calorie-accurate meal plan, a consolidated grocery list with estimated prices, and a step-by-step Sunday batch cook guide — all in under 5 minutes.

**Core Problem:**  
Meal prepping is time-consuming and requires nutritional knowledge most people don't have. Users struggle to plan balanced meals that match their calorie targets, dietary restrictions, and food preferences — leading to decision fatigue, wasted groceries, and abandoned health goals.

**Target User (Primary Persona):**  
Health-conscious adults aged 25–45 who want to eat better but lack the time or expertise to plan weekly meals. They cook at home, shop once a week, and want a "set it and forget it" meal prep system that respects their food preferences and calorie goals.

**Product Vision (12 months):**  
MealPrepFriend becomes the default Sunday meal prep companion — an intelligent nutrition platform that adapts to your cycle, household, pantry, and progress over time. It connects to grocery delivery services, tracks weight trends, and evolves recipes based on what you actually cook and enjoy.

---

## 2. Design System

### Color Tokens

All colors are defined as HSL values in `src/index.css` via CSS custom properties.

#### Light Mode

| Token | HSL Value | Description |
|---|---|---|
| `--background` | `30 33% 95%` | Page background (warm cream) |
| `--foreground` | `75 26% 15%` | Primary text |
| `--card` | `30 30% 97%` | Card surfaces |
| `--primary` | `27 38% 59%` | Terracotta — brand color, buttons, active states |
| `--primary-foreground` | `30 33% 97%` | Text on primary |
| `--secondary` | `90 22% 40%` | Sage green — protein badges, macro bars |
| `--muted` | `30 20% 90%` | Inactive pill backgrounds |
| `--muted-foreground` | `75 10% 40%` | Secondary text |
| `--accent` | `330 20% 80%` | Accent pink — fat macro badge |
| `--destructive` | `0 70% 55%` | Error states, remove buttons |
| `--border` | `30 20% 85%` | Card/input borders |
| `--ring` | `27 38% 59%` | Focus rings (matches primary) |
| `--radius` | `1rem` | Default border radius |

#### Dark Mode

| Token | HSL Value | Description |
|---|---|---|
| `--background` | `20 14% 10%` | Dark page background |
| `--foreground` | `40 40% 98%` | Light text |
| `--card` | `20 12% 15%` | Dark card surfaces |
| `--primary` | `27 38% 59%` | Same terracotta (consistent across modes) |
| `--muted` | `20 10% 20%` | Dark inactive backgrounds |
| `--muted-foreground` | `30 15% 65%` | Softened secondary text |
| `--border` | `20 10% 26%` | Dark borders |

#### Day Card Colors (7 warm pastels)

| Token | Light | Dark |
|---|---|---|
| `--warm-peach` | `20 60% 90%` | `20 30% 20%` |
| `--warm-sage` | `100 20% 85%` | `100 15% 18%` |
| `--warm-lavender` | `270 20% 90%` | `270 15% 20%` |
| `--warm-sky` | `200 30% 88%` | `200 20% 18%` |
| `--warm-rose` | `350 30% 90%` | `350 20% 20%` |
| `--warm-butter` | `45 50% 88%` | `45 25% 18%` |
| `--warm-mint` | `150 25% 87%` | `150 15% 18%` |

### Typography Scale

| Use | Font | Weight | Size |
|---|---|---|---|
| H1 (page titles) | Playfair Display (serif) | Bold (700) | `text-3xl` (30px) |
| H2 (section headings) | Playfair Display (serif) | Semi-bold (600) | `text-lg` (18px) |
| H3 (card headers) | DM Sans | Semi-bold (600) | `text-sm` (14px) |
| Body text | DM Sans | Regular (400) | `text-base` (16px) |
| Secondary text | DM Sans | Regular (400) | `text-sm` (14px) |
| Captions / badges | DM Sans | Medium (500) | `text-xs` (12px) |

Font imports via Google Fonts:
```
Playfair Display: 400, 500, 600, 700
DM Sans: 300, 400, 500, 600, 700
```

### Spacing and Border Radius Conventions

- **Page horizontal padding:** `px-6` (24px)
- **Page vertical padding:** `py-8` (32px)
- **Section margin bottom:** `mb-8` (32px)
- **Card internal padding:** `p-4` to `p-5` (16–20px)
- **Gap between cards:** `gap-2` to `gap-3` (8–12px)
- **Border radius (cards):** `rounded-xl` (12px) or `rounded-lg` (8px)
- **Border radius (pills):** `rounded-full` (999px)
- **Bottom padding for scrollable pages:** `pb-28` (112px) to clear sticky footers

### Component Patterns

| Component | Description |
|---|---|
| **Multiselect pill tags** | `rounded-full`, `px-2.5 py-3`, `min-h-[44px]`. Selected: `bg-primary text-primary-foreground`. Unselected: `bg-card border border-border text-foreground`. Used for protein, carb, veggie, food avoidances. |
| **Single-select pill tags** | Same styling as multiselect pills but only one can be active. Used for fat source. |
| **Radio cards** | Full-width stacked cards with `border-2`, `px-5 py-4`, `min-h-[72px]`. Selected: `border-primary bg-primary/10`. Contains emoji + title + description. Used for activity level, complexity, goals. |
| **Toggle chips** | `rounded-full`, `px-5 py-2.5`, `min-h-[48px]`. Selected: `bg-primary text-primary-foreground`. Unselected: `bg-muted text-muted-foreground`. Used for meal selection. |
| **Budget cards** | 3-column grid, `border-2`, emoji + label, `min-h-[48px]`. |
| **Bottom sheet** | shadcn `Sheet` with `side="bottom"`, `rounded-t-3xl`. Used for regeneration confirmation, remove-from-vault confirmation. |
| **Side sheet** | shadcn `Sheet` with `side="right"`, `w-[80%] sm:max-w-sm`. Profile navigation panel. |
| **Sticky footer** | `fixed bottom-0`, `bg-background/95 backdrop-blur`, `border-t border-border`, `px-6 py-4`. Contains primary CTA button(s). |
| **Bottom tab bar** | `fixed bottom-0`, `h-16`, `border-t border-border bg-card`. Two tabs: This Week + Vault. |
| **Toast** | shadcn Toaster. Used for save confirmations, vault add/remove, error messages. Duration: 2000ms for success. |
| **Tooltip** | shadcn Tooltip. Used for off-target calorie warnings, disabled button explanations. |
| **Popover** | shadcn Popover. Used for price and timing transparency info (ⓘ). |
| **Macro badges** | `rounded-full px-2 py-0.5 text-xs`. Protein: `bg-secondary/30`. Carbs: `bg-primary/20`. Fat: `bg-accent/60`. |

---

## 3. Navigation Architecture

### Full Screen Map

```
/auth                → Landing page + Auth form
  ↓ (authenticated)
/                    → Welcome (new users) | Redirect to /meal-plan (returning users)
  ↓
/goals               → About You (Step 1 of 3)
  ↓
/your-goal           → Your Goal (Step 2 of 3)
  ↓
/food-picks          → Diet & Nutrition (Step 3 of 3)
  ↓
/meal-plan           → Weekly Meal Plan (This Week tab) ← main hub
  ├── /grocery-list  → Grocery List
  ├── /cook-guide    → Cook Guide
  └── /vault         → Meal Vault (Vault tab)

Profile screens (via Side Sheet):
  /profile/about     → About You (edit)
  /profile/goals     → My Goals (edit)
  /profile/diet      → Diet & Nutrition (edit)
  /profile/account   → Profile Settings

Legacy:
  /edit-profile       → Combined edit profile (older version)
```

### Header Behavior (`AppHeader`)

- **Logo tap** (`🥗 MealPrepFriend`): navigates to `/meal-plan`
- **Dark mode toggle**: Moon/Sun icon, toggles between light/dark theme
- **Avatar button**: Opens the Side Sheet

### Bottom Tab Bar

| Tab | Emoji | Label | Path |
|---|---|---|---|
| This Week | 📅 | This Week | `/meal-plan` |
| Vault | ⭐ | Vault | `/vault` |

Visible on: `/meal-plan`, `/vault`

### Side Sheet Navigation Items

| Emoji | Label | Destination |
|---|---|---|
| 👤 | About You | `/profile/about` |
| 🎯 | My Goals | `/profile/goals` |
| 🥗 | Diet & Nutrition | `/profile/diet` |
| ⚙️ | Profile Settings | `/profile/account` |
| → | Log out | Signs out and redirects to `/auth` |

### Back Navigation Rules

All profile edit screens use a back arrow (`←`) in the header that navigates to `/meal-plan?sheet=open`. The `?sheet=open` query parameter causes the Side Sheet to automatically reopen when the meal plan loads, maintaining navigational context.

---

## 4. Authentication

### Email/Password Sign Up and Login

- **Sign Up:** Email + password + optional display name. Min password length: 6 characters. After sign-up, user is redirected to onboarding.
- **Login:** Email + password via `supabase.auth.signInWithPassword()`.
- **Email Confirmation:** Users must verify their email before signing in (auto-confirm is NOT enabled).

### Google OAuth Sign In

- Uses `lovable.auth.signInWithOAuth("google")` with redirect back to `window.location.origin`.
- Errors (excluding user cancellation) are shown as destructive toast notifications.

### Session Persistence

- Session managed by Supabase Auth SDK (`onAuthStateChange` listener).
- User and session state provided via `useAuth()` hook.

### Logout Behavior

- Calls `supabase.auth.signOut()`.
- Side Sheet closes, user is redirected to `/auth`.

### Protected Routes

- All routes except `/auth` are wrapped in `<ProtectedRoute>`.
- Unauthenticated users are redirected to `/auth`.
- Returning users with `onboarding_completed = true` are redirected from onboarding paths to `/meal-plan`.
- New users on non-onboarding paths are redirected to `/` (Welcome screen).

---

## 5. Onboarding Flow (New Users Only)

### Screen 1 — Welcome (`/`)

- Centered layout with 🥗 emoji, "MealPrepFriend" title, and tagline.
- Single CTA: "Let's get started →" → navigates to `/goals`.

### Screen 2A — About You (`/goals`)

**Step indicator:** "Step 1 of 3"

#### Unit Toggle (Imperial / Metric)

- Two-segment toggle: "🇺🇸 Imperial (lbs, ft/in)" | "🌍 Metric (kg, cm)"
- Default: auto-detected from `navigator.language` — `"en-US"` → Imperial, all others → Metric.
- **Conversion logic on toggle:**
  - Imperial → Metric: weight = lbs ÷ 2.205, height = (ft × 12 + in) × 2.54
  - Metric → Imperial: weight = kg × 2.205, height = cm ÷ 2.54, then split into ft/in

#### Input Fields

| Field | Type | Validation |
|---|---|---|
| Biological sex | Two-button toggle (Female/Male) | Required; default: Female |
| Age | Slider | Range: 18–80; default: 30 |
| Height (Imperial) | Two number inputs (ft + in) | Required |
| Height (Metric) | Single number input (cm) | Required |
| Current weight | Number input (lbs or kg) | Required |
| Goal weight | Number input (lbs or kg) | Required |
| Activity level | 4 radio cards | Required |

**Activity Level Options:**

| Value | Emoji | Label | Description | Multiplier |
|---|---|---|---|---|
| `sedentary` | 🪑 | Sedentary | Desk job, little or no exercise | 1.2 |
| `lightly_active` | 🚶 | Lightly Active | Light walks 1–3x per week | 1.375 |
| `moderately_active` | 🏃 | Moderately Active | Exercise 3–5x per week | 1.55 |
| `very_active` | 💪 | Very Active | Intense training 6–7x per week | 1.725 |

#### TDEE Calculation — Mifflin-St Jeor Formula

All calculations use metric internally (kg, cm).

**BMR (Basal Metabolic Rate):**
```
Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

**TDEE (Total Daily Energy Expenditure):**
```
TDEE = BMR × activity_multiplier
```

Rounded to nearest integer.

**CTA:** "Next →" (disabled until all fields are filled)

### Screen 2B — Your Goal (`/your-goal`)

**Step indicator:** "Step 2 of 3"

#### BMI Calculation Formula

```
BMI = weight_kg / (height_m²)
```

Where `height_m = height_cm / 100`. Rounded to 1 decimal place.

#### BMI Gradient Bar

A horizontal gradient bar with colors:
```
blue (hsl 210 80% 60%) → green (hsl 140 60% 50%) → yellow (hsl 50 80% 55%) → red (hsl 0 70% 55%)
```

Triangle indicator position maps BMI 15–40 to 0–100%:
```
position = ((clamp(BMI, 15, 40) - 15) / 25) × 100%
```

Animated on mount with 700ms ease-out transition.

**BMI Category Labels:**

| BMI Range | Label | Pill Color | Context Message |
|---|---|---|---|
| < 18.5 | Underweight | `bg-blue-500` | "Your goal weight suggests you want to build more mass — we'll help with that." |
| 18.5–24.9 | Healthy range | `bg-green-500` | "You're in a great place. Let's keep you there." |
| 25–29.9 | Overweight | `bg-yellow-500` | "A modest calorie deficit will help you reach your goal gradually and sustainably." |
| ≥ 30 | Obese | `bg-red-500` | "Small consistent changes make a big difference. We'll start you with a gentle deficit." |

#### Goal Cards (4 options)

| Key | Emoji | Name | Description | Calorie Delta | Protein | Carb | Fat |
|---|---|---|---|---|---|---|---|
| `lose_weight` | 🔥 | Lose Weight | High protein, lower carbs to burn fat | -300 | 40% | 25% | 35% |
| `build_muscle` | 💪 | Build Muscle | More protein and calories to grow strength | +200 | 45% | 35% | 20% |
| `maintain` | ⚖️ | Maintain | Balanced nutrition to stay where you are | 0 | 30% | 40% | 30% |
| `gain_weight` | 📈 | Gain Weight | More carbs and calories to build mass | +400 | 30% | 45% | 25% |

**Target Calories:** `TDEE + calorieDelta`

#### Dynamic Calorie Target and Macro Bar Behavior

- Calorie target card updates live when a goal is selected.
- Macro Breakdown section shows 3 animated progress bars (Protein, Carbs, Fat) with percentage labels.
- Bars animate width with 500ms ease-out transition.

#### Default Pre-Selection Logic

```
if (goalWeight < currentWeight) → "lose_weight"
if (goalWeight > currentWeight) → "gain_weight"
else → "maintain"
```

**CTA:** "This looks good →" (disabled if no goal selected)

### Screen 2C — Diet & Nutrition (`/food-picks`)

**Step indicator:** "Step 3 of 3"

Note: The onboarding version of this screen does NOT include the Cuisine, Complexity, Meal Weight, or Healthy Swaps sections (those default to: no cuisine, "home_chef", "midday", true). These are only available on the profile edit version (`/profile/diet`).

#### Meals to Prep (multiselect chips)

Options: Breakfast, Lunch, Dinner, Snack  
Validation: At least 2 required.

#### Protein Multiselect Pills (16 options)

🐔 Chicken, 🐟 Fish (Tilapia), 🍣 Salmon, 🦐 Shrimp, 🥩 Steak, 🫙 Ground Beef, 🦃 Ground Turkey, 🐷 Ground Pork, 🥚 Eggs, 🥓 Turkey Bacon, 🧆 Chickpeas, 🫘 Black Beans, 🥩 Lamb, 🍗 Chicken Thighs, 🐟 Tuna (canned), 🦞 Cod

#### Carb Multiselect Pills (16 options)

🥔 White Potato, 🍠 Sweet Potato, 🍚 White Rice, 🟤 Brown Rice, 🌽 Corn, 🍝 Pasta, 🍞 Sourdough Bread, 🌾 Oats, 🫘 Lentils, 🥙 Whole Wheat Tortilla, 🍚 Jasmine Rice, 🍚 Basmati Rice, 🟡 Quinoa, 🍞 Whole Wheat Bread, 🌾 Farro, 🟠 Butternut Squash

#### Veggie Multiselect Pills (25 options)

🥦 Broccoli, 🥕 Carrot, 🫛 Green Beans, 🥬 Spinach, 🫑 Bell Pepper, 🥒 Zucchini, 🧅 Onion, 🍄 Mushrooms, 🥬 Bok Choy, 🥦 Cauliflower, 🍅 Tomato, 🧄 Garlic, 🥑 Asparagus, 🌿 Kale, 🥗 Arugula, 🫛 Sugar Snap Peas, 🧅 Leek, 🟣 Purple Cabbage, 🥗 Brussels Sprouts, 🟠 Butternut Squash, 🍆 Eggplant, 🥬 Swiss Chard, 🟡 Yellow Squash, 🌶️ Jalapeño, 🫚 Celery

#### Fat Single-Select Pills (12 options)

🥑 Avocado, 🫒 Olive Oil, 🥜 Peanut Butter, 🧀 Cheese, 🥥 Coconut Oil, 🌰 Almonds, 🌻 Sunflower Butter, 🐟 Fatty Fish (Omega-3), 🥚 Egg Yolks, 🧈 Ghee, 🌰 Walnuts, 🫘 Tahini

#### Foods to Avoid (multiselect chips)

Options: None, Gluten, Dairy, Nuts, Shellfish, Pork  
Selecting "None" clears all other selections.

#### Weekly Grocery Budget (3-column grid)

💚 $0–50, 💛 $50–100, 🧡 $100–200

#### Validation

"Generate My Meal Plan ✨" button disabled unless:
- ≥ 2 meals selected
- ≥ 1 protein selected
- ≥ 1 carb selected
- ≥ 1 veggie selected
- Fat source selected
- Budget selected

Inline error: "Pick at least one option." shown when attempted with 0 selections in protein/carb/veggie.

### Completion Behavior

- All biometric data + dietary preferences saved to `profiles` table in database.
- `onboarding_completed` set to `true`.
- User navigated to `/meal-plan` where meal plan generation begins automatically.
- **Returning user skip logic:** On next login, users with `onboarding_completed = true` skip directly to `/meal-plan`.

---

## 6. Weekly Meal Plan Screen (This Week Tab)

**Route:** `/meal-plan`

### Profile Summary Card

Horizontal card at top showing:
- Goal emoji + name (e.g., "🔥 Lose Weight")
- Daily calorie target (e.g., "1700 cal/day")
- Macro split (e.g., "40P 25C 35F")

### Regenerate Plan Button

Full-width outlined button: "Regenerate Plan ✨"  
- Triggers `generatePlan()` with locked meals preserved.
- Shows spinning `RefreshCw` icon while regenerating.
- Disabled during generation.

### Staples Banner (Conditional)

Shown when user has ≥ 1 staple meal in vault:
```
⭐ Using {count} of your staples this week [✕]
```
- Tapping navigates to `/vault`.
- Dismissible via ✕ button.

### Day Cards

7 cards, one per day (Monday–Sunday), each with a unique warm pastel background color cycling through: peach → sage → lavender → sky → rose → butter → mint.

#### Structure per Day Card

- **Day name** (bold, e.g., "Monday")
- **Meal tiles** (one per meal):
  - Meal name (text, wrapping)
  - Calorie count + macro badges (P/C/F)
  - Heart icon (❤️) — save/unsave from vault
  - Lock icon (🔒/🔓) — lock/unlock for regeneration
  - Locked meals have a left primary border accent
  - During regeneration, unlocked meals show skeleton shimmer

#### Day Total Summary Row

Below all meal tiles, separated by a `border-t`:
```
Day total: {cal} cal · P {p}g · C {c}g · F {f}g  [⚠️]
```

**⚠️ Off-target logic:**  
Warning icon shown if `|day_total_calories - targetCalories| > 100`.  
Tooltip: "This day is slightly off target. Tap Regenerate to adjust."

### Sticky Footer (Above Tab Bar)

Two buttons side by side:
- **🛒 Grocery List** — outlined, navigates to `/grocery-list`
- **Cook Guide →** — primary filled, navigates to `/cook-guide`

**Disabled state** (before plan generation): Both buttons greyed out with tooltips: "Generate your meal plan first to unlock this."

### Loading/Generating State

Full-screen centered:
```
🥦 (pulsing)
"Cooking up your plan..."
"This usually takes about 15 seconds"
```

---

## 7. Meal Generation — AI Integration

### Model

Primary: `google/gemini-2.5-flash`  
Fallback: `google/gemini-3-flash-preview`

The system tries the primary model first. If it returns a 503 or empty response, it falls back to the secondary model.

### Full System Prompt

```
You are a registered dietitian and meal prep chef. Generate a 7-day meal plan with accurate macros.

CALORIE RULES:
- Use USDA values per 100g to calculate macros for each ingredient by weight.
- meal_calories = (protein_g × 4) + (carb_g × 4) + (fat_g × 9). Round to nearest 5.
- Daily total must be within ±75 cal of {calories}. Adjust portion sizes if needed.

CALORIE DISTRIBUTION (based on biggest meal = {biggestMeal}):
  morning: B:40% L:35% D:25% | midday: B:25% L:40% D:35% | evening: B:25% L:30% D:45%
  If snack selected, take 15% from smallest meal for snack.

COOK TIME: {cookTimeText}

USER PROFILE:
- Target: {calories} cal/day | Macros: {proteinPct}P/{carbPct}C/{fatPct}F
- Servings: Generate all recipes as single-serving portions sized for one person only. | Budget: {budget}
- Primary proteins (vary across meals): {protein} | Primary carbs (vary across meals): {carb} | Primary veggies (vary across meals): {veggie} | Fat: {fat}
- Avoid: {avoidanceText}
- Cuisines: {cuisineText} (vary at meal level, keep core ingredients same)
- Complexity: {complexityText}
- Meals: {mealsSelected}

HEALTHY SWAPS: {swapText}

RULES:
- Batch-cook friendly, overlapping ingredients, ~3hr cook guide with parallel tips.
```

### Dynamic Variables Injected from User Profile

| Variable | Source |
|---|---|
| `calories` | `profile.targetCalories` |
| `proteinPct`, `carbPct`, `fatPct` | `profile.proteinPct/carbPct/fatPct` |
| `protein` | Comma-separated list of selected proteins |
| `carb` | Comma-separated list of selected carbs |
| `veggie` | Comma-separated list of selected veggies |
| `fat` | Single selected fat source |
| `budget` | Selected budget range string |
| `foodAvoidances` | Array of avoidance labels |
| `mealsSelected` | Array of meal types (Breakfast, Lunch, etc.) |
| `cuisinePreferences` | Array of selected cuisines |
| `complexityLevel` | "super_simple" / "home_chef" / "master_chef" |
| `biggestMeal` | "morning" / "midday" / "evening" |
| `healthySwapsEnabled` | boolean |
| `keepMeals` | Array of locked meals (day + index + meal object) |
| `stapleMeals` | Array of staple meal names from vault |

### Complexity Level → Cook Time Mapping

| Level | Ingredients | Cook Time | Techniques |
|---|---|---|---|
| Super Simple | Exactly ≤ 3 (excl. salt/pepper/water) | 10–20 min | Season + roast or pan-cook only |
| Home Chef | 5–8 ingredients | 20–35 min | Sauté, marinate, stir-fry, roast |
| Master Chef | 8+ ingredients | 35–60 min | Sear, reduce, braise, layer flavors |

### Calorie Distribution by Meal Weight Preference

| Biggest Meal | Breakfast | Lunch | Dinner |
|---|---|---|---|
| Morning | 40% | 35% | 25% |
| Midday | 25% | 40% | 35% |
| Evening | 25% | 30% | 45% |

If snack is selected, 15% is taken from the smallest meal for the snack.

### Healthy Swaps Injection Logic

- **Enabled:** "Add one swap_tip per recipe: a single sentence suggesting a lighter swap that preserves the dish's flavor profile. Never remove traditional seasonings — only suggest alternatives."
- **Disabled:** "Do not include swap tips. Use traditional seasonings and preparation methods."

### JSON Output Schema

The AI is forced to return a structured tool call with this schema:

```json
{
  "meal_plan": [
    {
      "day": "Monday",
      "meals": [
        {
          "meal_type": "breakfast",
          "name": "...",
          "cuisine": "...",
          "calories": 450,
          "protein_g": 35,
          "carb_g": 40,
          "fat_g": 15,
          "prep_time_min": 10,
          "cook_time_min": 15,
          "ingredients": ["..."],
          "instructions": ["..."],
          "swap_tip": "..." | null
        }
      ],
      "day_total_calories": 1700,
      "day_total_protein_g": 170,
      "day_total_carb_g": 106,
      "day_total_fat_g": 66
    }
  ],
  "cook_guide": [
    {
      "step": 1,
      "task": "Season and roast all chicken breasts at 400°F",
      "duration_min": 25,
      "parallel_tip": "While chicken roasts, start rice on stovetop"
    }
  ]
}
```

### Truncated JSON Repair

If the AI response is truncated (malformed JSON), the system attempts repair:
1. Remove trailing commas before `}` and `]`
2. Strip control characters
3. Count unmatched `[{` vs `]}` and append missing closers
4. Re-parse

### Locked Meals Merge

After AI generation, locked meals are spliced back into their original positions. Day totals are recomputed after merge.

---

## 8. Meal Vault Screen (Vault Tab)

**Route:** `/vault`

### Empty State

Centered layout:
```
🍽️
"Nothing saved yet"
"Tap the ❤️ on any meal this week to save it here."
```

### Populated State — Card Structure

Each vault meal card shows:
- Meal name + ⭐ Staple badge (if applicable)
- Calorie count + macro badges (P/C/F)
- Prep time (⏱ Xm)
- Save date ("Saved Mar 5")
- ⭐ button — toggle staple status
- ❤️ button — remove from vault (opens confirmation sheet)

### Heart Icon Behavior

**On Meal Plan screen:**
- Unfilled heart = not saved → tap to save → toast: "❤️ Saved to your Vault"
- Filled red heart = saved → tap to open bottom sheet confirmation

**Confirmation sheet:**
- Title: "Remove from Vault?"
- Description: meal name
- Actions: "Remove" (destructive) | "Keep"

### Staple System

- Users can mark up to **3** meals as staples.
- Attempting to add a 4th triggers destructive toast: "Max 3 staples per plan — Remove one first."
- Staple meals are injected into the AI system prompt:  
  `"STAPLE MEALS: Include these specific meals in the plan: [names]. Place them on different days."`

---

## 9. Grocery List Screen

**Route:** `/grocery-list`

### Generation

- Triggered automatically on first visit if no cached list exists.
- Calls `generate-grocery-list` backend function with `mealPlan` + `budget`.
- AI model: `google/gemini-3-flash-preview`

### Grouping by Category

Categories: Proteins, Produce, Grains & Starches, Dairy & Fats, Pantry Staples  
Each category has an emoji prefix.

### Structure

- **Header:** "Grocery List 🛒" + ⓘ info popover
- **Progress bar:** "{checked} of {total} items checked"
- **Estimated total card:** prominently displayed
- **Category sections:** each with checkable item rows

### Item Row

Each item shows:
- Checkbox (custom styled)
- Item name (strikes through when checked)
- Quantity (e.g., "2 lbs")
- Estimated price ($X.XX)

### Price Transparency Tooltip (ⓘ)

> "Prices are AI-estimated averages based on typical US retail grocery costs. Actual prices vary by store, brand, and location. Use these as a rough guide."

### Disabled State

If no meal plan exists, user is redirected to `/`.

### Footer

Two buttons: "← Meal Plan" | "Cook Guide →"

---

## 10. Cook Guide Screen

**Route:** `/cook-guide`

### Step Card Structure

Each step shows:
- **Step number** in a primary-colored circle badge
- **Task description** (e.g., "Season and roast all chicken breasts at 400°F")
- **Duration** (⏱ X min)
- **Parallel tip** (💡 italic, optional — e.g., "While chicken roasts, start rice on stovetop")

### Total Time Estimate

Calculated as sum of all step `duration_min` values.  
Displayed as: "⏱ Total: Xh Ym"

### Timing Transparency Tooltip (ⓘ)

> "Cook times are AI-estimated based on standard prep and cooking times for each recipe. Your actual time may vary. First-timers may want to add 30–45 extra minutes."

### How Steps Are Generated

Steps are generated alongside the meal plan in the same AI call (part of the `cook_guide` array in the tool call response). They represent a Sunday batch cook choreography optimized for parallelism.

### Disabled State

If no cook guide exists, user is redirected to `/`.

### Footer

Single button: "← Meal Plan"

---

## 11. Profile System

### Side Sheet

Opened by tapping the avatar in the header. Shows:
- User avatar (initial-based fallback)
- Display name
- Email
- Navigation items (see Section 3)
- Log out button

### My Profile Screen — Screen A (`/profile/account`)

| Field | Type | Notes |
|---|---|---|
| Full name | Text input | Saved to `profiles.display_name` |
| Email address | Email input | Triggers email change via `supabase.auth.updateUser()` with confirmation email |
| Change password | Button | Sends password reset email via `supabase.auth.resetPasswordForEmail()` |

### About You Screen — Screen B (`/profile/about`)

Mirrors onboarding Screen 2A exactly with these additions:
- Pre-populated from saved profile data
- Unit toggle with live conversion (same logic)
- **Save behavior:** Recalculates BMR, TDEE, BMI from new values. Updates database. Updates context. Opens Regeneration Bottom Sheet.

### My Goals Screen — Screen C (`/profile/goals`)

Mirrors onboarding Screen 2B exactly with:
- BMI bar (animated), TDEE/target cards
- Goal cards pre-selected from saved profile
- **Save behavior:** Updates selected goal, target calories, macro percentages. Opens Regeneration Bottom Sheet.

### Diet & Nutrition Screen — Screen D (`/profile/diet`)

Full version with all sections (includes sections not in onboarding):
- Cuisine style selector (preset + custom, max 5)
- Complexity level selector
- Meal weight preference
- Healthy swaps toggle
- Meals to prep
- Protein/carb/veggie multiselect pills
- Fat single-select pills
- Weekly budget
- Food avoidances

Pre-populated from saved preferences. Multi-select values stored as comma-separated strings in database, parsed back into arrays on load.

**Save behavior:** Updates all dietary preferences in database. Opens Regeneration Bottom Sheet.

### Regeneration Bottom Sheet

**Trigger conditions:** Appears after saving changes on About You, My Goals, or Diet & Nutrition screens.

**Content:**
```
✨
"Your goals have changed"
"Your current meal plan was made for your old goals. Want to generate a new one that matches?"

[Regenerate My Plan ✨]  (primary button)
[Keep Current Plan]      (outlined button)

"You can always regenerate later from the Meals screen."
```

**Button actions:**
- **Regenerate:** Clears meal plan + cook guide from context, navigates to `/meal-plan` (triggers fresh generation)
- **Keep:** Navigates to `/meal-plan` without clearing data

---

## 12. Dark Mode

### Toggle Placement and Icon States

- Located in the app header, left of the avatar button
- **Light mode:** Shows Moon icon (🌙) — "tap to switch to dark"
- **Dark mode:** Shows Sun icon (☀️) — "tap to switch to light"

### Full Dark Mode Color Token Mapping

See Section 2 — all CSS custom properties have `.dark` overrides defined in `index.css`.

### Persistence

1. **localStorage:** Theme stored as `"light"` or `"dark"` under key `"theme"`.
2. **Database:** Theme stored in `profiles.theme_preference` column.
3. **Priority:** localStorage is read first (instant), then database value is fetched and overrides if different.

### Flash Prevention on Load

`applyTheme(getStoredTheme())` is called at module level (outside React lifecycle) in `useTheme.tsx`, ensuring the `dark` class is applied to `<html>` before first render.

---

## 13. Data Model — Database Schema

### `profiles` Table

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | uuid | — | No | Primary key, matches auth.users.id |
| `created_at` | timestamptz | `now()` | No | Account creation timestamp |
| `updated_at` | timestamptz | `now()` | No | Last profile update |
| `display_name` | text | — | Yes | User's display name |
| `avatar_url` | text | — | Yes | Profile picture URL |
| `biological_sex` | text | `'female'` | Yes | "female" or "male" — used for BMR calculation |
| `age` | integer | `30` | Yes | User age in years |
| `height_ft` | integer | — | Yes | Height in feet (imperial) |
| `height_in` | integer | — | Yes | Height in inches (imperial) |
| `height_cm` | numeric | — | Yes | Height in centimeters (metric) |
| `current_weight_lbs` | numeric | — | Yes | Current weight in pounds |
| `goal_weight_lbs` | numeric | — | Yes | Goal weight in pounds |
| `weight_kg` | numeric | — | Yes | Current weight in kilograms |
| `activity_level` | text | — | Yes | sedentary / lightly_active / moderately_active / very_active |
| `bmi` | numeric | — | Yes | Calculated BMI |
| `bmr` | numeric | — | Yes | Calculated BMR |
| `tdee` | numeric | — | Yes | Calculated TDEE |
| `selected_goal` | text | — | Yes | lose_weight / build_muscle / maintain / gain_weight |
| `target_calories` | integer | — | Yes | Daily calorie target |
| `protein_pct` | integer | `30` | Yes | Protein macro percentage |
| `carb_pct` | integer | `40` | Yes | Carb macro percentage |
| `fat_pct` | integer | `30` | Yes | Fat macro percentage |
| `meals_selected` | text[] | `'{}'` | Yes | Array of meal types to prep |
| `protein_choice` | text | — | Yes | Comma-separated protein selections |
| `carb_choice` | text | — | Yes | Comma-separated carb selections |
| `veggie_choice` | text | — | Yes | Comma-separated veggie selections |
| `fat_choice` | text | — | Yes | Single fat source selection |
| `weekly_budget` | text | — | Yes | Budget range string |
| `food_avoidances` | text[] | `'{}'` | Yes | Array of food avoidance labels |
| `household_size` | text | `'just_me'` | Yes | Legacy field (not actively used in v1) |
| `serving_size` | text | `'just_me'` | Yes | Legacy field (not actively used in v1) |
| `cuisine_preferences` | text[] | `'{}'` | Yes | Array of cuisine labels |
| `complexity_level` | text | `'home_chef'` | Yes | super_simple / home_chef / master_chef |
| `biggest_meal` | text | `'midday'` | Yes | morning / midday / evening |
| `healthy_swaps_enabled` | boolean | `true` | Yes | Whether to include swap tips |
| `unit_preference` | text | `'imperial'` | Yes | imperial / metric |
| `theme_preference` | text | `'light'` | Yes | light / dark |
| `onboarding_completed` | boolean | `false` | Yes | Whether onboarding flow is complete |

### `vault_meals` Table

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | No | Primary key |
| `user_id` | uuid | — | No | Owner user ID |
| `meal_name` | text | — | No | Name of the saved meal |
| `calories` | integer | — | No | Meal calories |
| `protein_g` | numeric | — | No | Protein in grams |
| `carb_g` | numeric | — | No | Carbs in grams |
| `fat_g` | numeric | — | No | Fat in grams |
| `prep_time_min` | integer | `0` | No | Prep time in minutes |
| `is_staple` | boolean | `false` | No | Whether meal is marked as a staple |
| `protein_choice` | text | — | Yes | Protein source when saved |
| `carb_choice` | text | — | Yes | Carb source when saved |
| `veggie_choice` | text | — | Yes | Veggie source when saved |
| `created_at` | timestamptz | `now()` | No | When meal was saved |

### Row Level Security (RLS) Policies

#### `profiles` Table

| Policy Name | Command | Expression |
|---|---|---|
| Users can insert own profile | INSERT | `auth.uid() = id` |
| Users can read own profile | SELECT | `auth.uid() = id` |
| Users can update own profile | UPDATE | `auth.uid() = id` (both using and with check) |

No DELETE policy — users cannot delete their profile.

#### `vault_meals` Table

| Policy Name | Command | Expression |
|---|---|---|
| Users can insert own vault meals | INSERT | `auth.uid() = user_id` |
| Users can read own vault meals | SELECT | `auth.uid() = user_id` |
| Users can update own vault meals | UPDATE | `auth.uid() = user_id` |
| Users can delete own vault meals | DELETE | `auth.uid() = user_id` |

### Database Functions

#### `handle_new_user()`

Trigger function (SECURITY DEFINER) that runs on new auth.users insert:
```sql
INSERT INTO public.profiles (id, display_name, avatar_url)
VALUES (
  NEW.id,
  COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
  COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
);
```

---

## 14. Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Backend project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Backend anon/public key for client SDK |
| `VITE_SUPABASE_PROJECT_ID` | Backend project ID |
| `LOVABLE_API_KEY` | AI gateway API key (backend function secret, not exposed to client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (backend secret) |
| `SUPABASE_DB_URL` | Direct database connection URL (backend secret) |

---

## 15. Roadmap

### V1 (Current — Shipped)

- ✅ Email + Google OAuth authentication
- ✅ 3-step onboarding flow (About You → Goals → Diet & Nutrition)
- ✅ TDEE calculation via Mifflin-St Jeor equation
- ✅ Imperial/Metric unit toggle with live conversion
- ✅ BMI gradient bar with animated indicator and color-coded labels
- ✅ 4 goal cards with dynamic calorie/macro targets
- ✅ Cuisine style multiselect with custom input (max 5)
- ✅ 3-tier complexity selector (Super Simple / Home Chef / Master Chef)
- ✅ Meal weight preference (biggest meal allocation)
- ✅ Healthy swaps toggle
- ✅ Multiselect pill tags for protein (16), carb (16), veggie (25)
- ✅ Single-select pills for fat (12)
- ✅ Food avoidance chips (Gluten, Dairy, Nuts, Shellfish, Pork)
- ✅ AI meal plan generation (Gemini) with USDA-based calorie calculations
- ✅ 7-day meal plan display with warm-colored day cards
- ✅ Macro badges and day total summaries with off-target warnings
- ✅ Lock/unlock meals for selective regeneration
- ✅ Heart icon to save meals to vault
- ✅ Meal Vault with staple system (max 3)
- ✅ AI grocery list generation with category grouping and price estimates
- ✅ Cook Guide with step cards, durations, and parallel tips
- ✅ Profile editing (4 screens) with regeneration prompts
- ✅ Dark mode with warm color tokens and persistence
- ✅ Price and timing transparency tooltips
- ✅ Returning user skip (straight to meal plan)

### V2 (Planned)

- 🔜 Grocery list with real pricing API (Instacart / Kroger)
- 🔜 Pantry staples management ("I already have olive oil at home")
- 🔜 Weekly auto-refresh with push notifications
- 🔜 Grocery list export / Instacart integration
- 🔜 Meal plan sharing (share link / image export)
- 🔜 Recipe detail view with full instructions and swap tips

### V3 (Future)

- 🔮 Cycle syncing nutrition (hormonal phase-aware meal planning)
- 🔮 Multi-person household profiles (partner/kids with different macros)
- 🔮 Cultural/heritage recipe mode (ancestral cuisine emphasis)
- 🔮 Progress tracking (weight log, streak system, weekly check-ins)
- 🔮 AI nutritionist chat (ask questions about your plan)
- 🔮 Offline support (PWA with cached meal plans)
- 🔮 Barcode scanner for pantry inventory
- 🔮 Integration with fitness trackers (Apple Health, Google Fit)

---

## 16. Known Limitations

| Limitation | Detail |
|---|---|
| **AI calorie estimates** | Carry ±10–15% variance from actual USDA values. The AI uses chain-of-thought calculation but precision depends on portion size assumptions. |
| **Grocery prices** | AI-estimated averages based on typical US retail. Not real-time pricing. Actual costs vary by store, brand, and region. |
| **Cook times** | AI-estimated based on standard prep and cooking times. First-time cooks should add 30–45 extra minutes. |
| **No offline support** | App requires an internet connection. Meal plans are stored in React context only (not persisted between sessions). |
| **Single user per account** | V1 supports one person per account only. No household member profiles. |
| **No meal plan persistence** | Meal plans are held in React context (memory) and lost on page refresh. Users must regenerate after refresh. |
| **Serving size** | All recipes are generated as single-serving portions for one person. |
| **AI model availability** | Depends on Gemini model availability. Falls back to secondary model if primary returns 503 or empty response. |
| **Max tokens** | AI response limited to 16,384 tokens. Very complex plans (many meals + snacks) may be truncated. System includes JSON repair logic. |
