import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep, DayPlan, Meal } from "@/context/MealPrepContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Lock, Unlock, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const dayColors = [
  "bg-warm-peach",
  "bg-warm-sage",
  "bg-warm-lavender",
  "bg-warm-sky",
  "bg-warm-rose",
  "bg-warm-butter",
  "bg-warm-mint",
];

const goalEmojis: Record<string, string> = {
  lose_weight: "🔥",
  build_muscle: "💪",
  maintain: "⚖️",
  gain_weight: "📈",
};

const goalNames: Record<string, string> = {
  lose_weight: "Lose Weight",
  build_muscle: "Build Muscle",
  maintain: "Maintain",
  gain_weight: "Gain Weight",
};

const MealPlan = () => {
  const navigate = useNavigate();
  const { profile, preferences, mealPlan, setMealPlan, setCookGuide, foodAvoidances, householdSize } = useMealPrep();
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [lockedMeals, setLockedMeals] = useState<Record<string, Set<number>>>({});

  useEffect(() => {
    if (!profile || !preferences) {
      navigate("/");
      return;
    }
    if (!mealPlan) {
      generatePlan();
    }
  }, []);

  const toggleLock = useCallback((day: string, mealIndex: number) => {
    setLockedMeals(prev => {
      const next = { ...prev };
      const set = new Set(prev[day] || []);
      if (set.has(mealIndex)) set.delete(mealIndex);
      else set.add(mealIndex);
      next[day] = set;
      return next;
    });
  }, []);

  const buildKeepMeals = () => {
    if (!mealPlan) return undefined;
    const keep: Array<{ day: string; mealIndex: number; meal: Meal }> = [];
    mealPlan.forEach(dayPlan => {
      const locked = lockedMeals[dayPlan.day];
      if (locked) {
        locked.forEach(idx => {
          if (dayPlan.meals[idx]) keep.push({ day: dayPlan.day, mealIndex: idx, meal: dayPlan.meals[idx] });
        });
      }
    });
    return keep.length > 0 ? keep : undefined;
  };

  const generatePlan = async (keepMeals?: Array<{ day: string; mealIndex: number; meal: Meal }>) => {
    if (!profile || !preferences) return;
    const isRegen = !!keepMeals;
    if (isRegen) setRegenerating(true);
    else setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          protein: preferences.protein,
          carb: preferences.carb,
          veggie: preferences.veggie,
          fat: preferences.fat,
          mealsSelected: preferences.mealsSelected,
          calories: profile.targetCalories,
          proteinPct: profile.proteinPct,
          carbPct: profile.carbPct,
          fatPct: profile.fatPct,
          budget: preferences.weeklyBudget,
          foodAvoidances,
          householdSize,
          keepMeals,
        },
      });

      if (fnError) throw fnError;
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setMealPlan(parsed.meal_plan as DayPlan[]);
      setCookGuide(parsed.cook_guide as any[]);
    } catch (e: any) {
      console.error("Generation error:", e);
      setError("Something went wrong generating your plan. Please try again.");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  const isMealLocked = (day: string, idx: number) => lockedMeals[day]?.has(idx) ?? false;
  const isMealRegenerating = (day: string, idx: number) => regenerating && !isMealLocked(day, idx);

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
        <button onClick={() => generatePlan()} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium">
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
        {/* Profile summary */}
        {profile && (
          <div className="rounded-xl bg-card border border-border px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-lg">{goalEmojis[profile.selectedGoal] || "⚖️"}</span>
            <span className="text-sm font-medium text-foreground">{goalNames[profile.selectedGoal] || "Maintain"}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{profile.targetCalories} cal/day</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{profile.proteinPct}P {profile.carbPct}C {profile.fatPct}F</span>
          </div>
        )}

        {/* Regenerate button */}
        <button
          onClick={() => generatePlan(buildKeepMeals())}
          disabled={regenerating}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-4 py-3 text-sm font-semibold text-primary mb-6 w-full active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Regenerating..." : "Regenerate Plan ✨"}
        </button>

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold text-foreground">Your Week 🎉</h1>
        </div>
        <p className="text-muted-foreground mb-6">Tap the lock to keep meals you love, then regenerate the rest</p>

        <div className="space-y-4">
          {mealPlan.map((day, i) => (
            <div key={day.day} className={`rounded-xl ${dayColors[i % dayColors.length]} p-5`}>
              <h3 className="text-lg font-bold text-foreground mb-3 font-sans">{day.day}</h3>
              <div className="space-y-2">
                {day.meals.map((meal, j) => {
                  const locked = isMealLocked(day.day, j);
                  const shimmer = isMealRegenerating(day.day, j);
                  return (
                    <div
                      key={j}
                      className={`rounded-lg bg-card/80 backdrop-blur px-4 py-3 flex items-center justify-between transition-all ${
                        locked ? "border-l-4 border-primary" : "border-l-4 border-transparent"
                      } ${shimmer ? "opacity-50" : ""}`}
                    >
                      {shimmer ? (
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm break-words">{meal.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
                            <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs text-foreground">P {meal.protein_g}g</span>
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-foreground">C {meal.carb_g}g</span>
                            <span className="rounded-full bg-accent/60 px-2 py-0.5 text-xs text-foreground">F {meal.fat_g}g</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => toggleLock(day.day, j)}
                        disabled={regenerating}
                        className={`ml-3 p-1.5 rounded-full transition-colors ${
                          locked ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                        aria-label={locked ? "Unlock meal" : "Lock meal"}
                      >
                        {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })}
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
