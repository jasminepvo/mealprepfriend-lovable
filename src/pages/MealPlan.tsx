import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep, DayPlan, Meal } from "@/context/MealPrepContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import BottomTabBar from "@/components/BottomTabBar";
import { Lock, Unlock, RefreshCw, Heart, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const dayColors = [
  "bg-warm-peach", "bg-warm-sage", "bg-warm-lavender", "bg-warm-sky",
  "bg-warm-rose", "bg-warm-butter", "bg-warm-mint",
];

const goalEmojis: Record<string, string> = { lose_weight: "🔥", build_muscle: "💪", maintain: "⚖️", gain_weight: "📈" };
const goalNames: Record<string, string> = { lose_weight: "Lose Weight", build_muscle: "Build Muscle", maintain: "Maintain", gain_weight: "Gain Weight" };

const MealPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, preferences, mealPlan, setMealPlan, setCookGuide, foodAvoidances, householdSize } = useMealPrep();
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [lockedMeals, setLockedMeals] = useState<Record<string, Set<number>>>({});
  const [favoritedMeals, setFavoritedMeals] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{ name: string; key: string } | null>(null);
  const [stapleCount, setStapleCount] = useState(0);
  const [showStapleBanner, setShowStapleBanner] = useState(true);

  // Load favorites and staple count
  useEffect(() => {
    if (!user) return;
    supabase.from("vault_meals").select("meal_name, is_staple").eq("user_id", user.id).then(({ data }) => {
      if (data) {
        setFavoritedMeals(new Set((data as any[]).map(d => d.meal_name)));
        setStapleCount((data as any[]).filter(d => d.is_staple).length);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!profile || !preferences) { navigate("/"); return; }
    if (!mealPlan) generatePlan();
  }, []);

  const toggleLock = useCallback((day: string, mealIndex: number) => {
    setLockedMeals(prev => {
      const next = { ...prev };
      const set = new Set(prev[day] || []);
      if (set.has(mealIndex)) set.delete(mealIndex); else set.add(mealIndex);
      next[day] = set;
      return next;
    });
  }, []);

  const buildKeepMeals = () => {
    if (!mealPlan) return undefined;
    const keep: Array<{ day: string; mealIndex: number; meal: Meal }> = [];
    mealPlan.forEach(dayPlan => {
      const locked = lockedMeals[dayPlan.day];
      if (locked) locked.forEach(idx => { if (dayPlan.meals[idx]) keep.push({ day: dayPlan.day, mealIndex: idx, meal: dayPlan.meals[idx] }); });
    });
    return keep.length > 0 ? keep : undefined;
  };

  const generatePlan = async (keepMeals?: Array<{ day: string; mealIndex: number; meal: Meal }>) => {
    if (!profile || !preferences) return;
    const isRegen = !!keepMeals;
    if (isRegen) setRegenerating(true); else setLoading(true);
    setError("");

    // Get active staples
    let stapleMeals: string[] = [];
    if (user) {
      const { data } = await supabase.from("vault_meals").select("meal_name").eq("user_id", user.id).eq("is_staple", true);
      if (data) stapleMeals = (data as any[]).map(d => d.meal_name);
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          protein: preferences.protein, carb: preferences.carb, veggie: preferences.veggie, fat: preferences.fat,
          mealsSelected: preferences.mealsSelected, calories: profile.targetCalories,
          proteinPct: profile.proteinPct, carbPct: profile.carbPct, fatPct: profile.fatPct,
          budget: preferences.weeklyBudget, foodAvoidances, householdSize, keepMeals,
          stapleMeals: stapleMeals.length > 0 ? stapleMeals : undefined,
          cuisinePreferences: preferences.cuisinePreferences,
          complexityLevel: preferences.complexityLevel,
          biggestMeal: preferences.biggestMeal,
          healthySwapsEnabled: preferences.healthySwapsEnabled,
        },
      });
      if (fnError) throw fnError;
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      setMealPlan(parsed.meal_plan as DayPlan[]);
      setCookGuide(parsed.cook_guide as any[]);
    } catch (e: any) {
      console.error("Generation error:", e);
      setError("Something went wrong generating your plan. Please try again.");
    } finally { setLoading(false); setRegenerating(false); }
  };

  const toggleFavorite = async (meal: Meal) => {
    if (!user) return;
    const key = meal.name;
    if (favoritedMeals.has(key)) {
      setRemoveTarget({ name: key, key });
    } else {
      // Optimistic add
      setFavoritedMeals(prev => new Set([...prev, key]));
      await supabase.from("vault_meals").insert({
        user_id: user.id, meal_name: meal.name, calories: Math.round(meal.calories),
        protein_g: Math.round(meal.protein_g * 10) / 10, carb_g: Math.round(meal.carb_g * 10) / 10, fat_g: Math.round(meal.fat_g * 10) / 10,
        prep_time_min: Math.round(meal.prep_time_min),
        protein_choice: preferences?.protein, carb_choice: preferences?.carb, veggie_choice: preferences?.veggie,
      } as any);
      toast({ title: "❤️ Saved to your Vault", duration: 2000 });
    }
  };

  const confirmRemoveFavorite = async () => {
    if (!removeTarget || !user) return;
    setFavoritedMeals(prev => { const n = new Set(prev); n.delete(removeTarget.key); return n; });
    await supabase.from("vault_meals").delete().eq("user_id", user.id).eq("meal_name", removeTarget.key);
    setRemoveTarget(null);
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
        <button onClick={() => generatePlan()} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium">Try Again</button>
      </div>
    );
  }

  if (!mealPlan) return null;

  const hasPlan = !!mealPlan;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-40">
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
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-4 py-3 text-sm font-semibold text-primary mb-4 w-full active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Regenerating..." : "Regenerate Plan ✨"}
        </button>

        {/* Staples banner */}
        {stapleCount > 0 && showStapleBanner && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 mb-4 flex items-center justify-between">
            <button onClick={() => navigate("/vault")} className="text-sm text-foreground font-medium">
              ⭐ Using {stapleCount} of your staples this week
            </button>
            <button onClick={() => setShowStapleBanner(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}

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
                  const isFav = favoritedMeals.has(meal.name);
                  return (
                    <div key={j} className={`rounded-lg bg-card/80 backdrop-blur px-4 py-3 flex items-center justify-between transition-all ${locked ? "border-l-4 border-primary" : "border-l-4 border-transparent"} ${shimmer ? "opacity-50" : ""}`}>
                      {shimmer ? (
                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
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
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => toggleFavorite(meal)} disabled={regenerating} className={`p-1.5 rounded-full transition-colors ${isFav ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`} aria-label={isFav ? "Remove from vault" : "Save to vault"}>
                          <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                        </button>
                        <button onClick={() => toggleLock(day.day, j)} disabled={regenerating} className={`p-1.5 rounded-full transition-colors ${locked ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`} aria-label={locked ? "Unlock meal" : "Lock meal"}>
                          {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              {/* Day total summary */}
              {(() => {
                const totalCal = day.day_total_calories ?? day.meals.reduce((s, m) => s + m.calories, 0);
                const totalP = day.day_total_protein_g ?? day.meals.reduce((s, m) => s + m.protein_g, 0);
                const totalC = day.day_total_carb_g ?? day.meals.reduce((s, m) => s + m.carb_g, 0);
                const totalF = day.day_total_fat_g ?? day.meals.reduce((s, m) => s + m.fat_g, 0);
                const offTarget = profile ? Math.abs(totalCal - profile.targetCalories) > 100 : false;
                return (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        Day total: {Math.round(totalCal)} cal · P {Math.round(totalP)}g · C {Math.round(totalC)}g · F {Math.round(totalF)}g
                      </span>
                      {offTarget && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5">
                              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>This day is slightly off target. Tap Regenerate to adjust.</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })()}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky footer above tab bar */}
        <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4 flex gap-3 z-20">
          {hasPlan ? (
            <>
              <button onClick={() => navigate("/grocery-list")} className="flex-1 rounded-lg border-2 border-primary px-4 py-3 text-sm font-semibold text-primary active:scale-[0.98] transition-transform">🛒 Grocery List</button>
              <button onClick={() => navigate("/cook-guide")} className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform">Cook Guide →</button>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button disabled className="flex-1 rounded-lg border-2 border-border px-4 py-3 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed">🛒 Grocery List</button>
                </TooltipTrigger>
                <TooltipContent>Generate your meal plan first to unlock this.</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button disabled className="flex-1 rounded-lg bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed">Cook Guide →</button>
                </TooltipTrigger>
                <TooltipContent>Generate your meal plan first to unlock this.</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Remove favorite confirmation */}
      <Sheet open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-8 pt-6">
          <SheetHeader className="items-center text-center">
            <SheetTitle>Remove from Vault?</SheetTitle>
            <SheetDescription>{removeTarget?.name}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex gap-3">
            <button onClick={confirmRemoveFavorite} className="flex-1 rounded-lg bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground">Remove</button>
            <button onClick={() => setRemoveTarget(null)} className="flex-1 rounded-lg border-2 border-border px-4 py-3 text-sm font-semibold text-foreground">Keep</button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomTabBar />
    </div>
  );
};

export default MealPlan;
