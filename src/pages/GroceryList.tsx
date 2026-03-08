import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";
import { supabase } from "@/integrations/supabase/client";

interface GroceryItem {
  name: string;
  quantity: string;
  estimated_price: number;
}

interface GroceryCategory {
  name: string;
  emoji: string;
  items: GroceryItem[];
}

interface GroceryData {
  categories: GroceryCategory[];
  estimated_total: number;
}

const GroceryList = () => {
  const navigate = useNavigate();
  const { mealPlan, preferences, groceryList, setGroceryList } = useMealPrep();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!mealPlan) {
      navigate("/");
      return;
    }
    if (!groceryList) {
      generateList();
    }
  }, []);

  const generateList = async () => {
    if (!mealPlan) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-grocery-list", {
        body: {
          mealPlan,
          budget: preferences?.weeklyBudget,
        },
      });

      if (fnError) throw fnError;

      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.error) throw new Error(parsed.error);
      setGroceryList(parsed as GroceryData);
    } catch (e: any) {
      console.error("Grocery list error:", e);
      setError("Couldn't generate grocery list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalItems = groceryList?.categories.reduce((sum, cat) => sum + cat.items.length, 0) ?? 0;
  const checkedCount = checkedItems.size;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <span className="text-5xl mb-6 animate-pulse-gentle">🛒</span>
        <h2 className="text-2xl font-bold text-foreground mb-2">Building your grocery list...</h2>
        <p className="text-muted-foreground">Extracting ingredients from your meal plan</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={generateList} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium">
          Try Again
        </button>
      </div>
    );
  }

  if (!groceryList) return null;

  return (
    <div className="min-h-screen bg-background px-6 py-8 pb-28">
      <h1 className="text-3xl font-bold text-foreground mb-1">Grocery List 🛒</h1>
      <p className="text-muted-foreground mb-2">
        {checkedCount} of {totalItems} items checked
      </p>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-muted mb-6 overflow-hidden">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-300"
          style={{ width: totalItems > 0 ? `${(checkedCount / totalItems) * 100}%` : "0%" }}
        />
      </div>

      {/* Estimated total */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 px-5 py-4 mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Estimated total</span>
        <span className="text-xl font-bold text-primary">${groceryList.estimated_total.toFixed(2)}</span>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {groceryList.categories.map((category) => (
          <section key={category.name}>
            <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">
              {category.emoji} {category.name}
            </h2>
            <div className="space-y-2">
              {category.items.map((item) => {
                const key = `${category.name}-${item.name}`;
                const isChecked = checkedItems.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleItem(key)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                      isChecked
                        ? "border-secondary/40 bg-secondary/10 opacity-60"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      isChecked ? "border-secondary bg-secondary" : "border-muted-foreground/40"
                    }`}>
                      {isChecked && <span className="text-xs text-primary-foreground">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${isChecked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      ${item.estimated_price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4 flex gap-3">
        <button
          onClick={() => navigate("/meal-plan")}
          className="flex-1 rounded-lg border-2 border-border px-4 py-3 text-sm font-semibold text-foreground active:scale-[0.98] transition-transform"
        >
          ← Meal Plan
        </button>
        <button
          onClick={() => navigate("/cook-guide")}
          className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
        >
          Cook Guide →
        </button>
      </div>
    </div>
  );
};

export default GroceryList;
