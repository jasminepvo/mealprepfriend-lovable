import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { protein, carb, veggie, fat, mealsSelected, calories, proteinPct, carbPct, fatPct, budget, foodAvoidances, householdSize, keepMeals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const avoidanceText = foodAvoidances && foodAvoidances.length > 0
      ? `\n- STRICTLY avoid these ingredients and anything containing them: ${foodAvoidances.join(", ")}`
      : "";

    const householdText = householdSize === "me_plus_1"
      ? "\n- Scale all portions for 2 people"
      : householdSize === "family"
      ? "\n- Scale all portions for a family of 3-4 people"
      : "\n- Portions for 1 person";

    // Build keep-meals instruction if user locked some meals
    let keepMealsText = "";
    if (keepMeals && keepMeals.length > 0) {
      const grouped: Record<string, Array<{ mealIndex: number; meal: any }>> = {};
      for (const km of keepMeals) {
        if (!grouped[km.day]) grouped[km.day] = [];
        grouped[km.day].push({ mealIndex: km.mealIndex, meal: km.meal });
      }
      keepMealsText = `\n\nIMPORTANT — LOCKED MEALS:
The user has locked certain meals that MUST remain EXACTLY as provided below. Do NOT regenerate or modify these meals.
Only generate new meals for the UNLOCKED slots. Place the locked meals at their exact indices.

Locked meals by day:
${JSON.stringify(grouped, null, 2)}

For each day, if a meal index is locked, output that exact meal object unchanged. Only generate fresh meals for the remaining indices.`;
    }

    const systemPrompt = `You are a meal prep expert helping busy women meal prep a week of healthy food in one Sunday cooking session. Generate a 7-day meal plan and a Sunday cook guide.

Rules:
- Use ${protein} as the main protein, ${carb} as the carb, ${veggie} as the veggie, and ${fat} as the fat source
- Include only these meal types: ${mealsSelected.join(", ")}
- Target ${calories} calories/day with ${proteinPct}% protein, ${carbPct}% carbs, ${fatPct}% fat
- Weekly grocery budget: ${budget}
- Keep recipes to 5 ingredients or less
- Western meals only
- Make meals simple and batch-friendly for Sunday prep
- The cook guide should have steps that can be completed in about 3 hours total
- Include parallel tips so the user can multitask efficiently${avoidanceText}${householdText}${keepMealsText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
                              name: { type: "string" },
                              calories: { type: "number" },
                              protein_g: { type: "number" },
                              carb_g: { type: "number" },
                              fat_g: { type: "number" },
                              prep_time_min: { type: "number" },
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
                        task: { type: "string" },
                        duration_min: { type: "number" },
                        parallel_tip: { type: "string" },
                      },
                      required: ["task", "duration_min", "parallel_tip"],
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

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const args = JSON.parse(toolCall.function.arguments);

    // Merge locked meals back to guarantee they're untouched
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
            // Ensure array is long enough
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
