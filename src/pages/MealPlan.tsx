import { useEffect, useState, useCallback, useRef, TouchEvent, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep, DayPlan, Meal } from "@/context/MealPrepContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import FloatingTabBar from "@/components/FloatingTabBar";
import { Lock, Unlock, RefreshCw, Heart, AlertTriangle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

interface GroceryItem { name: string; quantity: string; estimated_price: number; }
interface GroceryCategory { name: string; emoji: string; items: GroceryItem[]; }
interface GroceryData { categories: GroceryCategory[]; estimated_total: number; }

const MealPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, preferences, mealPlan, setMealPlan, setCookGuide, cookGuide, groceryList, setGroceryList, foodAvoidances, householdSize } = useMealPrep();
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [lockedMeals, setLockedMeals] = useState<Record<string, Set<number>>>({});
  const [favoritedMeals, setFavoritedMeals] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<{ name: string; key: string } | null>(null);
  const [stapleCount, setStapleCount] = useState(0);
  const [showStapleBanner, setShowStapleBanner] = useState(true);

  // Grocery list state
  const [groceryLoading, setGroceryLoading] = useState(false);
  const [groceryError, setGroceryError] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Swipe carousel state: 0=Cook Guide, 1=This Week, 2=Grocery List
  const [activeScreen, setActiveScreen] = useState(1);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mouseStartX = useRef(0);

  // Swipe tutorial overlay
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialDismissing, setTutorialDismissing] = useState(false);
  const [arrowPulse, setArrowPulse] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("mealprepfriend_swipe_tutorial_seen");
    if (!seen) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

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

  // Auto-generate grocery list when swiping to it
  useEffect(() => {
    if (activeScreen === 2 && mealPlan && !groceryList && !groceryLoading) {
      generateGroceryList();
    }
  }, [activeScreen, mealPlan, groceryList]);

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

  const generateGroceryList = async () => {
    if (!mealPlan) return;
    setGroceryLoading(true); setGroceryError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-grocery-list", { body: { mealPlan, budget: preferences?.weeklyBudget } });
      if (fnError) throw fnError;
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) throw new Error(parsed.error);
      setGroceryList(parsed as GroceryData);
    } catch (e: any) {
      console.error("Grocery list error:", e);
      setGroceryError("Couldn't generate grocery list. Please try again.");
    } finally { setGroceryLoading(false); }
  };

  const toggleGroceryItem = (key: string) => {
    setCheckedItems(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const toggleFavorite = async (meal: Meal) => {
    if (!user) return;
    const key = meal.name;
    if (favoritedMeals.has(key)) {
      setRemoveTarget({ name: key, key });
    } else {
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

  // Swipe handlers
  const handleTouchStart = (e: TouchEvent) => {
    const el = contentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    if (touchY > rect.bottom - 80) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = touchY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(swipeOffset) < 10) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }
    if ((activeScreen === 0 && dx > 0) || (activeScreen === 2 && dx < 0)) {
      setSwipeOffset(dx * 0.3);
    } else {
      setSwipeOffset(dx);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    const threshold = 60;
    if (swipeOffset < -threshold && activeScreen < 2) {
      setActiveScreen(prev => prev + 1);
    } else if (swipeOffset > threshold && activeScreen > 0) {
      setActiveScreen(prev => prev - 1);
    }
    setSwipeOffset(0);
  };

  const navigateScreen = (index: number) => {
    if (index >= 0 && index <= 2) setActiveScreen(index);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: MouseEvent) => {
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - mouseStartX.current;
    if ((activeScreen === 0 && dx > 0) || (activeScreen === 2 && dx < 0)) {
      setSwipeOffset(dx * 0.3);
    } else {
      setSwipeOffset(dx);
    }
  };
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60;
    if (swipeOffset < -threshold && activeScreen < 2) setActiveScreen(prev => prev + 1);
    else if (swipeOffset > threshold && activeScreen > 0) setActiveScreen(prev => prev - 1);
    setSwipeOffset(0);
  };

  const dismissTutorial = () => {
    setTutorialDismissing(true);
    localStorage.setItem("mealprepfriend_swipe_tutorial_seen", "true");
    setTimeout(() => {
      setShowTutorial(false);
      setTutorialDismissing(false);
      setArrowPulse(true);
      setTimeout(() => setArrowPulse(false), 1000);
    }, 200);
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
        <button onClick={() => generatePlan()} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium">Try Again</button>
      </div>
    );
  }

  if (!mealPlan) return null;

  // Grocery list computed values
  const totalItems = groceryList?.categories.reduce((sum, cat) => sum + cat.items.length, 0) ?? 0;
  const checkedCount = checkedItems.size;

  // Cook guide computed values
  const cookTotalMinutes = cookGuide?.reduce((sum, s) => sum + s.duration_min, 0) ?? 0;
  const cookHours = Math.floor(cookTotalMinutes / 60);
  const cookMins = cookTotalMinutes % 60;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Fixed edge arrows */}
      <button
        onClick={() => navigateScreen(activeScreen - 1)}
        className="fixed left-0 z-50 flex flex-col items-center justify-center gap-1 border border-border border-l-0"
        style={{
          top: "50vh",
          transform: "translateY(-50%)",
          width: 36,
          height: 72,
          borderRadius: "0 12px 12px 0",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          boxShadow: "2px 0 12px rgba(0,0,0,0.08)",
          opacity: activeScreen === 0 ? 0 : 1,
          pointerEvents: activeScreen === 0 ? "none" : "auto",
          transition: "opacity 200ms ease, transform 200ms ease",
          ...(arrowPulse ? { animation: "arrow-pulse 400ms ease 2" } : {}),
        }}
        aria-label="Previous screen"
      >
        <ChevronLeft className="text-primary/70" style={{ width: 20, height: 20 }} />
        <span style={{ fontSize: 18 }}>{activeScreen === 2 ? "📅" : "🍳"}</span>
      </button>

      <button
        onClick={() => navigateScreen(activeScreen + 1)}
        className="fixed right-0 z-50 flex flex-col items-center justify-center gap-1 border border-border border-r-0"
        style={{
          top: "50vh",
          transform: "translateY(-50%)",
          width: 36,
          height: 72,
          borderRadius: "12px 0 0 12px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          boxShadow: "-2px 0 12px rgba(0,0,0,0.08)",
          opacity: activeScreen === 2 ? 0 : 1,
          pointerEvents: activeScreen === 2 ? "none" : "auto",
          transition: "opacity 200ms ease, transform 200ms ease",
          ...(arrowPulse ? { animation: "arrow-pulse 400ms ease 200ms 2" } : {}),
        }}
        aria-label="Next screen"
      >
        <span style={{ fontSize: 18 }}>{activeScreen === 0 ? "📅" : "🛒"}</span>
        <ChevronRight className="text-primary/70" style={{ width: 20, height: 20 }} />
      </button>

      {/* Swipe tutorial overlay */}
      {showTutorial && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(4px)",
            animation: tutorialDismissing ? "fadeOut 200ms ease forwards" : "fadeIn 300ms ease",
          }}
          onClick={dismissTutorial}
        >
          <div
            className="bg-card rounded-3xl text-center"
            style={{ padding: "32px 24px", maxWidth: 300, width: "85%", boxShadow: "0 24px 48px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-6">
              <ChevronLeft className="text-muted-foreground" style={{ width: 28, height: 28 }} />
              <span style={{ fontSize: 32 }}>👆</span>
              <ChevronRight className="text-muted-foreground" style={{ width: 28, height: 28 }} />
            </div>
            <h3 className="font-bold text-foreground mt-4" style={{ fontSize: 18 }}>Swipe to navigate</h3>
            <p className="text-muted-foreground mt-2 leading-relaxed" style={{ fontSize: 14 }}>
              Swipe left for your Grocery List 🛒<br />
              Swipe right for your Cook Guide 🍳
            </p>
            <button
              onClick={dismissTutorial}
              className="w-full mt-6 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
            >
              Got it! Let's eat 🎉
            </button>
          </div>
        </div>
      )}

      {/* Swipeable content area */}
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${activeScreen * (100 / 3)}% + ${swipeOffset}px))`,
            transition: isSwiping ? "none" : "transform 300ms ease-in-out",
            width: "300%",
          }}
        >
          {/* Screen 0: Cook Guide */}
          <div className="w-full shrink-0 px-6 py-4 pb-28" style={{ width: "calc(100% / 3)" }}>
            {!cookGuide || cookGuide.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🗓️</span>
                <h2 className="text-xl font-bold text-foreground mb-2">No cook guide yet</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Generate a meal plan first to see your cook day steps.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Your Cook Day 🗓️</h1>
                <p className="text-muted-foreground mb-4">
                  Follow these steps to prep everything in ~{cookHours}h {cookMins > 0 ? `${cookMins}m` : ""}
                </p>

                <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 mb-6">
                  <span className="text-sm font-semibold text-foreground">
                    ⏱ Total: {cookHours}h {cookMins > 0 ? `${cookMins}m` : ""}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-0.5 rounded-full hover:bg-primary/20 transition-colors">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[280px] text-sm">
                      <p className="font-semibold mb-1">⏱️ About these times</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Cook times are AI-estimated based on standard prep and cooking times for each recipe.
                        Your actual time may vary. First-timers may want to add 30–45 extra minutes.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  {cookGuide.map((step, i) => (
                    <div key={i} className="rounded-xl bg-card border border-border p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-base">{step.task}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-muted-foreground">⏱ {step.duration_min} min</span>
                          </div>
                          {step.parallel_tip && (
                            <p className="mt-2 text-sm text-muted-foreground italic">💡 {step.parallel_tip}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Screen 1: This Week */}
          <div className="w-full shrink-0 px-6 py-4 pb-28" style={{ width: "calc(100% / 3)" }}>
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
          </div>

          {/* Screen 2: Grocery List */}
          <div className="w-full shrink-0 px-6 py-4 pb-28" style={{ width: "calc(100% / 3)" }}>
            {groceryLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="text-5xl mb-6 animate-pulse-gentle">🛒</span>
                <h2 className="text-2xl font-bold text-foreground mb-2">Building your grocery list...</h2>
                <p className="text-muted-foreground">Extracting ingredients from your meal plan</p>
              </div>
            ) : groceryError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-destructive mb-4">{groceryError}</p>
                <button onClick={generateGroceryList} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium">Try Again</button>
              </div>
            ) : !groceryList ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🛒</span>
                <h2 className="text-xl font-bold text-foreground mb-2">No grocery list yet</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Generate a meal plan first to see your grocery list.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-foreground">Grocery List 🛒</h1>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-muted/50 transition-colors">
                        <Info className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-[280px] text-sm">
                      <p className="font-semibold mb-1">💡 About these prices</p>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Prices are AI-estimated averages based on typical US retail grocery costs. Actual prices vary by store, brand, and location.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-muted-foreground mb-2">{checkedCount} of {totalItems} items checked</p>

                <div className="w-full h-2 rounded-full bg-muted mb-6 overflow-hidden">
                  <div className="h-full rounded-full bg-secondary transition-all duration-300" style={{ width: totalItems > 0 ? `${(checkedCount / totalItems) * 100}%` : "0%" }} />
                </div>

                <div className="rounded-xl bg-primary/10 border border-primary/20 px-5 py-4 mb-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Estimated total</span>
                  <span className="text-xl font-bold text-primary">${groceryList.estimated_total.toFixed(2)}</span>
                </div>

                <div className="space-y-6">
                  {groceryList.categories.map(category => (
                    <section key={category.name}>
                      <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">{category.emoji} {category.name}</h2>
                      <div className="space-y-2">
                        {category.items.map(item => {
                          const key = `${category.name}-${item.name}`;
                          const isChecked = checkedItems.has(key);
                          return (
                            <button key={key} onClick={() => toggleGroceryItem(key)} className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${isChecked ? "border-secondary/40 bg-secondary/10 opacity-60" : "border-border bg-card"}`}>
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${isChecked ? "border-secondary bg-secondary" : "border-muted-foreground/40"}`}>
                                {isChecked && <span className="text-xs text-primary-foreground">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.quantity}</p>
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">${item.estimated_price.toFixed(2)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
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

      <FloatingTabBar />
    </div>
  );
};

export default MealPlan;
