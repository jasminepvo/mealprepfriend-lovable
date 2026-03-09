import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import FloatingTabBar from "@/components/FloatingTabBar";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface VaultMeal {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  prep_time_min: number;
  is_staple: boolean;
  created_at: string;
}

const Vault = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<VaultMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<VaultMeal | null>(null);

  const fetchMeals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("vault_meals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMeals((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  const toggleStaple = async (meal: VaultMeal) => {
    if (!meal.is_staple) {
      const activeStaples = meals.filter((m) => m.is_staple).length;
      if (activeStaples >= 3) {
        toast({ title: "Max 3 staples per plan", description: "Remove one first.", variant: "destructive" });
        return;
      }
    }
    await supabase
      .from("vault_meals")
      .update({ is_staple: !meal.is_staple } as any)
      .eq("id", meal.id);
    setMeals((prev) => prev.map((m) => m.id === meal.id ? { ...m, is_staple: !m.is_staple } : m));
  };

  const removeMeal = async () => {
    if (!removeTarget) return;
    await supabase.from("vault_meals").delete().eq("id", removeTarget.id);
    setMeals((prev) => prev.filter((m) => m.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-20">
          <span className="text-4xl animate-pulse">⭐</span>
        </div>
        <FloatingTabBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-24">
        <h1 className="text-3xl font-bold text-foreground mb-1">Your Vault ⭐</h1>
        <p className="text-muted-foreground mb-6">Meals you've loved. Tap ⭐ to use in your next plan.</p>

        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🍽️</span>
            <h2 className="text-xl font-bold text-foreground mb-2">Nothing saved yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Tap the ❤️ on any meal this week to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div key={meal.id} className="rounded-xl bg-card border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground text-sm">{meal.meal_name}</p>
                      {meal.is_staple && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">⭐ Staple</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
                      <span className="rounded-full bg-secondary/30 px-2 py-0.5 text-xs text-foreground">P {meal.protein_g}g</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-foreground">C {meal.carb_g}g</span>
                      <span className="rounded-full bg-accent/60 px-2 py-0.5 text-xs text-foreground">F {meal.fat_g}g</span>
                      <span className="text-xs text-muted-foreground">⏱ {meal.prep_time_min}m</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saved {new Date(meal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => toggleStaple(meal)}
                      className={`p-1.5 rounded-full transition-colors ${
                        meal.is_staple ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                      title={meal.is_staple ? "Remove staple" : "Use in next plan"}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => setRemoveTarget(meal)}
                      className="p-1.5 rounded-full text-destructive/70 hover:text-destructive transition-colors"
                      title="Remove from vault"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Remove confirmation */}
      <Sheet open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-8 pt-6">
          <SheetHeader className="items-center text-center">
            <SheetTitle>Remove from Vault?</SheetTitle>
            <SheetDescription>{removeTarget?.meal_name}</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex gap-3">
            <button
              onClick={removeMeal}
              className="flex-1 rounded-lg bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground"
            >
              Remove
            </button>
            <button
              onClick={() => setRemoveTarget(null)}
              className="flex-1 rounded-lg border-2 border-border px-4 py-3 text-sm font-semibold text-foreground"
            >
              Keep
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <FloatingTabBar />
    </div>
  );
};

export default Vault;
