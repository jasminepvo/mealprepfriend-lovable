

## Plan: Re-generate Meal Plan with "Keep" Selection

### UX Flow
- Each meal card gets a checkbox/lock icon. Tapping it marks that meal as "kept" (visually highlighted).
- A floating "🔄 Regenerate" button appears in the bottom bar (alongside existing Grocery List and Cook Guide buttons) that re-generates **only the un-kept meals**.
- During regeneration, kept meals stay visible; un-kept meals show a shimmer/loading state.

### Changes

**1. `src/pages/MealPlan.tsx`**
- Add `lockedMeals` state: `Record<string, Set<number>>` mapping day name → set of meal indices the user wants to keep.
- Each meal card gets a toggle button (lock/unlock icon) to add/remove from `lockedMeals`.
- Locked meals get a subtle visual indicator (e.g. green left border + lock icon).
- Add a "🔄 Regenerate" button in the bottom bar. On click, calls `generatePlan(lockedMeals)`.
- Update `generatePlan` to accept locked meals and pass them to the edge function as `keepMeals` — an array of `{ day, mealIndex, meal }` objects.

**2. `supabase/functions/generate-meal-plan/index.ts`**
- Accept an optional `keepMeals` parameter: `Array<{ day: string, meals: Meal[] }>`.
- When `keepMeals` is provided, update the system prompt to instruct the AI: "The following meals are already chosen and MUST remain exactly as-is. Only generate replacements for the remaining slots." Include the kept meals as JSON in the prompt.
- After receiving the AI response, merge the kept meals back into the correct day/slot positions before returning.

**3. No database or context changes needed** — this is entirely UI + edge function logic.

### Technical Detail

The edge function prompt addition when `keepMeals` is present:
```
- Some meals are already locked by the user. Keep them EXACTLY as provided.
  Do NOT include them in your generation. Only generate meals for the empty slots.
  Locked meals: [JSON of kept meals per day]
```

The merge logic: for each day, if the user locked meal indices 0 and 2, the AI generates only for index 1. The function stitches the final array together before returning.

