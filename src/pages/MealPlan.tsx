import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep, DayPlan, CookStep } from "@/context/MealPrepContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";

const dayColors = [
  "bg-warm-peach",
  "bg-warm-sage",
  "bg-warm-lavender",
  "bg-warm-sky",
  "bg-warm-rose",
  "bg-warm-butter",
  "bg-warm-mint",
];

const MealPlan = () => {
  const navigate = useNavigate();
  const { profile, preferences, mealPlan, setMealPlan, setCookGuide, foodAvoidances, householdSize } = useMealPrep();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile || !preferences) {
      navigate("/");
      return;
    }
    if (!mealPlan) {
      generatePlan();
    }
  }, []);

  const generatePlan = async () => {
    if (!profile || !preferences) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          protein: preferences.protein,
          carb: preferences.carb,
          veggie: preferences.veggie,
          fat: preferences.fat,
          mealsSelected: preferences.mealsSelected,
          calories: profile.recommendedCalories,
          proteinPct: profile.proteinPct,
          carbPct: profile.carbPct,
          fatPct: profile.fatPct,
          budget: preferences.weeklyBudget,
          foodAvoidances,
          householdSize,
        },
      });

      if (fnError) throw fnError;

      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setMealPlan(parsed.meal_plan as DayPlan[]);
      setCookGuide(parsed.cook_guide as CookStep[]);
    } catch (e: any) {
      console.error("Generation error:", e);
      setError("Something went wrong generating your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <span className="text-5xl mb-6 animate-pulse-gentle">🥦</span>
        <h2 className="text-2xl font-bold text-foreground mb-2">Cooking up your plan...</h2>
        <p className="text-muted-foreground">This usually takes about 15 seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={generatePlan} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium">
          Try Again
        </button>
      </div>
    );
  }

  if (!mealPlan) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-28">
      <h1 className="text-3xl font-bold text-foreground mb-1">Your Week 🎉</h1>
      <p className="text-muted-foreground mb-6">Tap any meal to see details</p>

      <div className="space-y-4">
        {mealPlan.map((day, i) => (
          <div key={day.day} className={`rounded-xl ${dayColors[i % dayColors.length]} p-5`}>
            <h3 className="text-lg font-bold text-foreground mb-3 font-sans">{day.day}</h3>
            <div className="space-y-2">
              {day.meals.map((meal, j) => (
                <div key={j} className="rounded-lg bg-card/80 backdrop-blur px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{meal.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
                      <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs text-foreground">P {meal.protein_g}g</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-foreground">C {meal.carb_g}g</span>
                      <span className="rounded-full bg-accent/60 px-2 py-0.5 text-xs text-foreground">F {meal.fat_g}g</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">⏱ {meal.prep_time_min}m</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4 flex gap-3">
        <button
          onClick={() => navigate("/grocery-list")}
          className="flex-1 rounded-lg border-2 border-primary px-4 py-3 text-sm font-semibold text-primary active:scale-[0.98] transition-transform"
        >
          🛒 Grocery List
        </button>
        <button
          onClick={() => navigate("/cook-guide")}
          className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
        >
          Cook Guide →
        </button>
      </div>
    </div>
    </div>
  );
};

export default MealPlan;
