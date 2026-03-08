

## Plan: Header Bar with Avatar Dropdown + "A Few More Things" Screen

### 1. Create `AppHeader` component
- Persistent top bar on all pages **except** Welcome (`/`) and Auth (`/auth`).
- Left: "🥗 MealPrepFriend" wordmark.
- Right: circular avatar showing user's first initial (from `profiles.display_name` or email fallback), using the existing `Avatar`/`AvatarFallback` components.
- Tapping the avatar opens a `DropdownMenu` with:
  - "👋 Hi, [first name]" as `DropdownMenuLabel`
  - Separator
  - "Log out" as `DropdownMenuItem` calling `signOut()` from `useAuth`
- Background: `bg-card` to match the design system card surface.

### 2. Fetch user profile for display name
- Add a small hook or inline query in `AppHeader` that fetches `profiles.display_name` for `auth.uid()` using the Supabase client.
- Fall back to email's local part if `display_name` is empty.

### 3. Integrate `AppHeader` into pages
- Add `<AppHeader />` at the top of: Goals, FoodPicks, MealPlan, CookGuide, GroceryList, and the new "A Few More Things" page.
- **Not** on Welcome or Auth pages.

### 4. Database migration: add personalization columns to `profiles`
Add two new columns:
```sql
ALTER TABLE public.profiles
  ADD COLUMN food_avoidances text[] DEFAULT '{}',
  ADD COLUMN household_size text DEFAULT 'just_me';
```
No new RLS policies needed — existing policies already cover read/update for own profile.

### 5. Create "A Few More Things" page (`/preferences`)
- Step label: "Step 2 of 3" (Goals becomes 1 of 3, FoodPicks becomes 3 of 3).
- **Section 1 — "Any foods to avoid?"**: Multiselect chips for: None, Gluten, Dairy, Nuts, Shellfish, Pork. Selecting "None" clears others.
- **Section 2 — "Who are you cooking for?"**: 3 radio cards: 🧍 Just me, 👫 Me + 1, 👨‍👩‍👧‍👦 Family of 3-4.
- On continue: save selections to `profiles` table (update `food_avoidances` and `household_size`), store in context, navigate to `/food-picks`.

### 6. Update `MealPrepContext`
- Add `foodAvoidances: string[]` and `householdSize: string` fields.

### 7. Update routing & step labels
- Goals: "Step 1 of 3"
- Preferences (new): "Step 2 of 3"
- FoodPicks: "Step 3 of 3"
- Goals navigates to `/preferences` instead of `/food-picks`.
- Add `/preferences` route in `App.tsx` (protected).

### 8. Update edge function to include personalization
- Pass `foodAvoidances` and `householdSize` to `generate-meal-plan`.
- Update the system prompt to include:
  - "Avoid these ingredients: [list]" (if any)
  - "Cooking for: [household size] — scale portions accordingly"

