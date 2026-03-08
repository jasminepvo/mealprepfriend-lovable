import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mealPlan, budget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const mealSummary = mealPlan.map((day: any) =>
      `${day.day}: ${day.meals.map((m: any) => m.name).join(", ")}`
    ).join("\n");

    const systemPrompt = `You are a grocery shopping expert. Given a 7-day meal plan, extract a consolidated grocery list with exact quantities needed for the full week. Group items by category. Budget: ${budget || "not specified"}.

Rules:
- Combine duplicate ingredients across all meals
- Use practical grocery store quantities (e.g. "2 lbs" not "907g")
- Include estimated price per item in USD
- Group into categories: Proteins, Produce, Grains & Starches, Dairy & Fats, Pantry Staples
- Only include items actually needed for the recipes`;

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
          { role: "user", content: `Here is the meal plan:\n${mealSummary}\n\nGenerate the grocery list.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_grocery_list",
              description: "Generate a categorized grocery list with quantities and prices",
              parameters: {
                type: "object",
                properties: {
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Category name like Proteins, Produce, etc." },
                        emoji: { type: "string", description: "Single emoji for the category" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              quantity: { type: "string", description: "e.g. 3 lbs, 2 dozen, 1 bag" },
                              estimated_price: { type: "number", description: "Estimated price in USD" },
                            },
                            required: ["name", "quantity", "estimated_price"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["name", "emoji", "items"],
                      additionalProperties: false,
                    },
                  },
                  estimated_total: { type: "number", description: "Total estimated cost in USD" },
                },
                required: ["categories", "estimated_total"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_grocery_list" } },
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

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-grocery-list error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
