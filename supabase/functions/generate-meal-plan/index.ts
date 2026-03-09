import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      protein, carb, veggie, fat, mealsSelected, calories, proteinPct, carbPct, fatPct,
      budget, foodAvoidances, householdSize, keepMeals, stapleMeals,
      cuisinePreferences, complexityLevel, biggestMeal, healthySwapsEnabled,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const avoidanceText = foodAvoidances && foodAvoidances.length > 0
      ? foodAvoidances.join(", ")
      : "None";

    const servingText = householdSize === "me_plus_1"
      ? "2 people"
      : householdSize === "family"
      ? "a family of 3-4 people"
      : "1 person";

    const cuisineText = cuisinePreferences && cuisinePreferences.length > 0
      ? cuisinePreferences.join(", ")
      : "American (default)";

    let complexityText = "";
    let cookTimeText = "";
    if (complexityLevel === "super_simple") {
      complexityText = "Every recipe must use exactly 3 ingredients or fewer (excluding salt, pepper, and water). No marinades, no sauces, no multi-step techniques.";
      cookTimeText = "All cook times: 10–20 min per meal. Technique: season + roast or pan-cook only.";
    } else if (complexityLevel === "master_chef") {
      complexityText = "Every recipe uses 8+ ingredients. Bold, layered flavors. Techniques like searing, roasting, reducing are welcome. Meals should feel restaurant-quality.";
      cookTimeText = "Cook times: 35–60 min per meal. Techniques: sear, reduce, braise, layer flavors, rest proteins before slicing.";
    } else {
      complexityText = "Every recipe uses 5–8 ingredients. Sauces, marinades, and aromatics are encouraged. Max 3 cooking steps.";
      cookTimeText = "Cook times: 20–35 min per meal. Techniques: sauté, marinate, stir-fry, roast allowed.";
    }

    const biggestMealText = biggestMeal || "midday";

    const swapText = healthySwapsEnabled !== false
      ? `Add one swap_tip per recipe: a single sentence suggesting a lighter swap that preserves the dish's flavor profile. Never remove traditional seasonings — only suggest alternatives.`
      : "Do not include swap tips. Use traditional seasonings and preparation methods.";

    // Build keep-meals instruction
    let keepMealsText = "";
    if (keepMeals && keepMeals.length > 0) {
      const grouped: Record<string, Array<{ mealIndex: number; meal: any }>> = {};
      for (const km of keepMeals) {
        if (!grouped[km.day]) grouped[km.day] = [];
        grouped[km.day].push({ mealIndex: km.mealIndex, meal: km.meal });
      }
      keepMealsText = `\n\nIMPORTANT — LOCKED MEALS:
The user has locked certain meals that MUST remain EXACTLY as provided below. Do NOT regenerate or modify these meals.
Only generate new meals for the UNLOCKED slots.

Locked meals by day:
${JSON.stringify(grouped, null, 2)}`;
    }

    const stapleText = stapleMeals && stapleMeals.length > 0
      ? `\n\nSTAPLE MEALS: Include these specific meals in the plan: ${stapleMeals.join(", ")}. Place them on different days.`
      : "";

    const systemPrompt = `You are a registered dietitian and culturally-aware meal prep chef. Your job is to generate a 7-day meal plan with accurate calorie and macro calculations.

CRITICAL INSTRUCTION — CALORIE CALCULATION:
Do NOT divide the daily calorie target evenly across meals.
Instead, follow this mandatory chain-of-thought process for every single meal:

Step 1 — Define exact ingredients with gram weights:
  List every ingredient with a specific gram quantity based on the serving size preference.
  Example: 'Chicken breast: 170g, Sweet potato: 150g, Olive oil: 10g, Garlic: 5g'

Step 2 — Calculate macros per ingredient using USDA values:
  For each ingredient, calculate:
  - Protein (g): use known protein density per 100g
  - Carbohydrates (g): use known carb density per 100g
  - Fat (g): use known fat density per 100g
  Reference values to use (per 100g):
    Chicken breast (cooked): 31g P, 0g C, 3.6g F = 165 kcal
    Ground beef 90% lean (cooked): 26g P, 0g C, 10g F = 197 kcal
    Ground turkey (cooked): 27g P, 0g C, 7g F = 170 kcal
    Salmon (cooked): 25g P, 0g C, 13g F = 208 kcal
    Steak sirloin (cooked): 27g P, 0g C, 8g F = 185 kcal
    Eggs (whole, large, 1 egg = 50g): 6g P, 0.6g C, 5g F = 70 kcal
    White rice (cooked): 2.7g P, 28g C, 0.3g F = 130 kcal
    Brown rice (cooked): 2.6g P, 23g C, 0.9g F = 112 kcal
    Sweet potato (cooked): 1.6g P, 20g C, 0.1g F = 86 kcal
    White potato (cooked): 1.9g P, 17g C, 0.1g F = 77 kcal
    Broccoli (cooked): 2.8g P, 6.6g C, 0.3g F = 35 kcal
    Spinach (cooked): 2.9g P, 3.8g C, 0.3g F = 29 kcal
    Bok choy (cooked): 1.5g P, 1.8g C, 0.2g F = 13 kcal
    Bell pepper (raw): 0.9g P, 6g C, 0.2g F = 26 kcal
    Carrots (cooked): 0.8g P, 8g C, 0.2g F = 35 kcal
    Avocado (raw): 2g P, 9g C, 15g F = 160 kcal
    Olive oil: 0g P, 0g C, 100g F = 884 kcal
    Peanut butter: 25g P, 20g C, 50g F = 588 kcal

Step 3 — Sum all ingredients to get meal totals:
  meal_protein_g = sum of all ingredient protein
  meal_carb_g = sum of all ingredient carbs
  meal_fat_g = sum of all ingredient fat
  meal_calories = (meal_protein_g × 4) + (meal_carb_g × 4) + (meal_fat_g × 9)
  Round calories to nearest 5.

Step 4 — Verify daily totals:
  Sum all meals for the day.
  Daily total must land within ±75 calories of ${calories}.
  If over: reduce a portion size (e.g. 170g chicken → 140g).
  If under: increase a portion size or add a small snack.
  Adjust and recalculate before outputting.
  NEVER fudge the numbers to hit the target — adjust actual gram quantities instead.

MEAL BALANCE — CALORIE DISTRIBUTION:
  Do NOT split calories evenly. Distribute based on biggest_meal preference:
  biggest_meal = morning:  B:40% L:35% D:25%
  biggest_meal = midday:   B:25% L:40% D:35%
  biggest_meal = evening:  B:25% L:30% D:45%
  If snack is selected, redistribute 15% from the smallest meal to snack.
  The user's biggest meal is: ${biggestMealText}.

COOK TIME — BASE ON COMPLEXITY:
  ${cookTimeText}
  Cook guide total time = sum of all step durations, accounting for parallel tasks (e.g. rice cooks while protein marinates).

USER PROFILE:
- Daily calorie target: ${calories} cal/day
- Macro split: ${proteinPct}% protein, ${carbPct}% carbs, ${fatPct}% fat
- Serving size: ${servingText}
- Weekly budget: ${budget}
- Primary protein: ${protein}
- Primary carb: ${carb}
- Primary veggie: ${veggie}
- Fat source: ${fat}
- Foods to avoid: ${avoidanceText}

CUISINE & STYLE:
- Preferred cuisines (apply at meal level, max 2 active): ${cuisineText}
- Apply cuisines at the meal level, not the week level. Vary cuisines across days and meals naturally.
- Keep the core protein and carb the same across cuisines — only the seasoning, sauce, and cooking technique changes.
  Example: chicken breast can become lemongrass chicken (Vietnamese), chicken parm (Italian), or chicken bulgogi (Korean) — same protein, different cultural preparation.
- Do not introduce specialty ingredients unavailable in a standard US grocery store without flagging them.

COMPLEXITY:
${complexityText}

- Include only these meal types: ${mealsSelected.join(", ")}

HEALTHY SWAPS:
${swapText}

RECIPE RULES:
- All recipes must be batch-cook friendly (can be made in large quantities and stored 3–5 days in the fridge)
- Prioritize ingredients that overlap across multiple meals to minimize grocery list length
- The cook guide should have steps that can be completed in about 3 hours total
- Include parallel tips so the user can multitask efficiently
- Make meals simple and batch-friendly for Sunday prep${keepMealsText}${stapleText}`;

    const models = ["google/gemini-2.5-flash", "google/gemini-3-flash-preview"];
    let response: Response | null = null;

    for (const model of models) {
      console.log(`Trying model: ${model}`);
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate the meal plan and cook guide now. Follow the calorie calculation chain-of-thought strictly. Include day_total fields for each day." },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_meal_plan_and_cook_guide",
                description: "Generate a structured 7-day meal plan and Sunday cook guide with accurate calorie calculations",
                parameters: {
                  type: "object",
                  properties: {
                    meal_plan: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          day: { type: "string", description: "Day name like Monday, Tuesday, etc." },
                          meals: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                meal_type: { type: "string", description: "breakfast, lunch, dinner, or snack" },
                                name: { type: "string" },
                                cuisine: { type: "string" },
                                calories: { type: "number" },
                                protein_g: { type: "number" },
                                carb_g: { type: "number" },
                                fat_g: { type: "number" },
                                prep_time_min: { type: "number" },
                                cook_time_min: { type: "number" },
                                ingredients: { type: "array", items: { type: "string" } },
                                instructions: { type: "array", items: { type: "string" } },
                                swap_tip: { type: ["string", "null"] },
                              },
                              required: ["name", "calories", "protein_g", "carb_g", "fat_g", "prep_time_min"],
                              additionalProperties: false,
                            },
                          },
                          day_total_calories: { type: "number", description: "Sum of all meal calories for this day" },
                          day_total_protein_g: { type: "number", description: "Sum of all meal protein for this day" },
                          day_total_carb_g: { type: "number", description: "Sum of all meal carbs for this day" },
                          day_total_fat_g: { type: "number", description: "Sum of all meal fat for this day" },
                        },
                        required: ["day", "meals", "day_total_calories", "day_total_protein_g", "day_total_carb_g", "day_total_fat_g"],
                        additionalProperties: false,
                      },
                    },
                    cook_guide: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          step: { type: "number" },
                          task: { type: "string" },
                          duration_min: { type: "number" },
                          parallel_tip: { type: ["string", "null"] },
                        },
                        required: ["task", "duration_min"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["meal_plan", "cook_guide"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_meal_plan_and_cook_guide" } },
        }),
      });

      if (response.ok) break;
      console.error(`Model ${model} failed with status ${response.status}`);
      if (response.status !== 503) break;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse AI response, length:", responseText.length, "preview:", responseText.substring(0, 500));
      throw new Error("AI response was truncated or malformed");
    }

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    let args: any;
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      let cleaned = toolCall.function.arguments
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x1F\x7F]/g, "");
      const opens = (cleaned.match(/[\[{]/g) || []).length;
      const closes = (cleaned.match(/[\]}]/g) || []).length;
      for (let i = 0; i < opens - closes; i++) {
        cleaned += cleaned.lastIndexOf("[") > cleaned.lastIndexOf("{") ? "]" : "}";
      }
      args = JSON.parse(cleaned);
    }

    // Compute day totals if missing
    for (const dayPlan of args.meal_plan) {
      if (!dayPlan.day_total_calories) {
        dayPlan.day_total_calories = dayPlan.meals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
        dayPlan.day_total_protein_g = dayPlan.meals.reduce((s: number, m: any) => s + (m.protein_g || 0), 0);
        dayPlan.day_total_carb_g = dayPlan.meals.reduce((s: number, m: any) => s + (m.carb_g || 0), 0);
        dayPlan.day_total_fat_g = dayPlan.meals.reduce((s: number, m: any) => s + (m.fat_g || 0), 0);
      }
    }

    // Merge locked meals back
    if (keepMeals && keepMeals.length > 0) {
      const lockedByDay: Record<string, Record<number, any>> = {};
      for (const km of keepMeals) {
        if (!lockedByDay[km.day]) lockedByDay[km.day] = {};
        lockedByDay[km.day][km.mealIndex] = km.meal;
      }

      for (const dayPlan of args.meal_plan) {
        const locked = lockedByDay[dayPlan.day];
        if (locked) {
          for (const [idxStr, meal] of Object.entries(locked)) {
            const idx = parseInt(idxStr);
            while (dayPlan.meals.length <= idx) {
              dayPlan.meals.push(dayPlan.meals[dayPlan.meals.length - 1] || meal);
            }
            dayPlan.meals[idx] = meal;
          }
          // Recompute day totals after merge
          dayPlan.day_total_calories = dayPlan.meals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
          dayPlan.day_total_protein_g = dayPlan.meals.reduce((s: number, m: any) => s + (m.protein_g || 0), 0);
          dayPlan.day_total_carb_g = dayPlan.meals.reduce((s: number, m: any) => s + (m.carb_g || 0), 0);
          dayPlan.day_total_fat_g = dayPlan.meals.reduce((s: number, m: any) => s + (m.fat_g || 0), 0);
        }
      }
    }

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
