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
    if (complexityLevel === "super_simple") {
      complexityText = "Every recipe must use exactly 3 ingredients or fewer (excluding salt, pepper, and water). No marinades, no sauces, no multi-step techniques.";
    } else if (complexityLevel === "master_chef") {
      complexityText = "Every recipe uses 8+ ingredients. Bold, layered flavors. Techniques like searing, roasting, reducing are welcome. Meals should feel restaurant-quality.";
    } else {
      complexityText = "Every recipe uses 5–8 ingredients. Sauces, marinades, and aromatics are encouraged. Max 3 cooking steps.";
    }

    const biggestMealText = biggestMeal || "midday";

    const swapText = healthySwapsEnabled !== false
      ? `For each recipe, add one optional swap_tip field: a single sentence suggesting a lighter or healthier ingredient substitution that preserves the dish's cultural flavor profile. Examples: "Swap soy sauce for coconut aminos to reduce sodium.", "Use Greek yogurt instead of sour cream for more protein.", "Try cauliflower rice instead of white rice to cut carbs." Never remove traditional seasonings — only suggest alternatives, never mandate them.`
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

    const systemPrompt = `You are a meal prep expert and culturally-aware chef. Generate a 7-day meal plan for a home cook.

USER PROFILE:
- Daily calorie target: ${calories} cal/day
- Macro split: ${proteinPct}% protein, ${carbPct}% carbs, ${fatPct}% fat
- Serving size: ${servingText}
- Weekly budget: ${budget}

INGREDIENTS:
- Primary protein: ${protein}
- Primary carb: ${carb}
- Primary veggie: ${veggie}
- Fat source: ${fat}
- Foods to avoid: ${avoidanceText}

CUISINE & STYLE:
- Preferred cuisines: ${cuisineText}
- Apply cuisines at the meal level, not the week level. Vary cuisines across days and meals naturally.
- Keep the core protein and carb the same across cuisines — only the seasoning, sauce, and cooking technique changes.
  Example: chicken breast can become lemongrass chicken (Vietnamese), chicken parm (Italian), or chicken bulgogi (Korean) — same protein, different cultural preparation.

COMPLEXITY:
${complexityText}

MEAL BALANCE:
- Include only these meal types: ${mealsSelected.join(", ")}
- The user's biggest meal should be ${biggestMealText}.
- Allocate approximately 40% of daily calories to the biggest meal, 35% to the second meal, and 25% to the lightest meal (or distribute evenly across 4 meals if snack is selected).
- If a high-calorie meal appears earlier in the day, ensure subsequent meals are lighter to stay within the daily target.

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
            { role: "user", content: "Generate the meal plan and cook guide now." },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_meal_plan_and_cook_guide",
                description: "Generate a structured 7-day meal plan and Sunday cook guide",
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
                        },
                        required: ["day", "meals"],
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
      // Try to repair truncated JSON from tool call arguments
      let cleaned = toolCall.function.arguments
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x1F\x7F]/g, "");
      // Try to close unclosed arrays/objects
      const opens = (cleaned.match(/[\[{]/g) || []).length;
      const closes = (cleaned.match(/[\]}]/g) || []).length;
      for (let i = 0; i < opens - closes; i++) {
        cleaned += cleaned.lastIndexOf("[") > cleaned.lastIndexOf("{") ? "]" : "}";
      }
      args = JSON.parse(cleaned);
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
