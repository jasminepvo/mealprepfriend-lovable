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

    const systemPrompt = `You are a registered dietitian and meal prep chef. Generate a 7-day meal plan with accurate macros.

CALORIE RULES:
- Use USDA values per 100g to calculate macros for each ingredient by weight.
- meal_calories = (protein_g × 4) + (carb_g × 4) + (fat_g × 9). Round to nearest 5.
- Daily total must be within ±75 cal of ${calories}. Adjust portion sizes if needed.

CALORIE DISTRIBUTION (based on biggest meal = ${biggestMealText}):
  morning: B:40% L:35% D:25% | midday: B:25% L:40% D:35% | evening: B:25% L:30% D:45%
  If snack selected, take 15% from smallest meal for snack.

COOK TIME: ${cookTimeText}

USER PROFILE:
- Target: ${calories} cal/day | Macros: ${proteinPct}P/${carbPct}C/${fatPct}F
- Servings: ${servingText} | Budget: ${budget}
- Protein: ${protein} | Carb: ${carb} | Veggie: ${veggie} | Fat: ${fat}
- Avoid: ${avoidanceText}
- Cuisines: ${cuisineText} (vary at meal level, keep core ingredients same)
- Complexity: ${complexityText}
- Meals: ${mealsSelected.join(", ")}

HEALTHY SWAPS: ${swapText}

RULES:
- Batch-cook friendly, overlapping ingredients, ~3hr cook guide with parallel tips.${keepMealsText}${stapleText}`;

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
          max_tokens: 16384,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate the 7-day meal plan and cook guide now. Include day_total fields." },
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
