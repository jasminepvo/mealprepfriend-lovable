import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMealPrep } from "@/context/MealPrepContext";
import RegenerationSheet from "@/components/RegenerationSheet";
import CuisineSelector from "@/components/diet/CuisineSelector";
import ComplexityLevel from "@/components/diet/ComplexityLevel";
import MealWeightPreference from "@/components/diet/MealWeightPreference";
import HealthySwapsToggle from "@/components/diet/HealthySwapsToggle";
import { ArrowLeft } from "lucide-react";

const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];
const proteinOptions = [
  { emoji: "🐔", label: "Chicken" }, { emoji: "🐟", label: "Fish" }, { emoji: "🥩", label: "Steak" },
  { emoji: "🫙", label: "Ground Beef" }, { emoji: "🦃", label: "Ground Turkey" }, { emoji: "🥚", label: "Eggs" },
];
const carbOptions = [
  { emoji: "🥔", label: "Potato" }, { emoji: "🍠", label: "Sweet Potato" },
  { emoji: "🍚", label: "White Rice" }, { emoji: "🍚", label: "Brown Rice" }, { emoji: "🌽", label: "Corn" },
];
const veggieOptions = [
  { emoji: "🥦", label: "Broccoli" }, { emoji: "🥕", label: "Carrot" }, { emoji: "🫛", label: "Green Beans" },
  { emoji: "🥬", label: "Spinach" }, { emoji: "🫑", label: "Bell Pepper" },
];
const fatOptions = [
  { emoji: "🥑", label: "Avocado" }, { emoji: "🫒", label: "Olive Oil" },
  { emoji: "🥜", label: "Peanut Butter" }, { emoji: "🧀", label: "Cheese" },
];
const budgetOptions = [
  { emoji: "💚", label: "$0–50" }, { emoji: "💛", label: "$50–100" }, { emoji: "🧡", label: "$100–200" },
];
const avoidanceOptions = ["None", "Gluten", "Dairy", "Nuts", "Shellfish", "Pork"];
const householdOptions = [
  { value: "just_me", emoji: "🧍", label: "Just me" },
  { value: "me_plus_1", emoji: "👫", label: "Me + 1" },
  { value: "family", emoji: "👨‍👩‍👧‍👦", label: "Family of 3–4" },
];

interface RadioCardProps { emoji: string; label: string; selected: boolean; onSelect: () => void; }
const RadioCard = ({ emoji, label, selected, onSelect }: RadioCardProps) => (
  <button onClick={onSelect} className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all min-h-[48px] ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}>
    <span className="text-xl">{emoji}</span>
    <span className="text-base font-medium text-foreground flex-1">{label}</span>
    {selected && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">✓</span>}
  </button>
);

const ProfileDiet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPreferences, setFoodAvoidances, setHouseholdSize, setMealPlan, setCookGuide } = useMealPrep();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRegen, setShowRegen] = useState(false);

  const [meals, setMeals] = useState<string[]>([]);
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [veggie, setVeggie] = useState("");
  const [fat, setFat] = useState("");
  const [budget, setBudget] = useState("");
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [household, setHousehold] = useState("just_me");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [complexity, setComplexity] = useState<"super_simple" | "home_chef" | "master_chef">("home_chef");
  const [biggestMeal, setBiggestMeal] = useState<"morning" | "midday" | "evening">("midday");
  const [healthySwaps, setHealthySwaps] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        const d = data as any;
        setMeals(d.meals_selected || []);
        setProtein(d.protein_choice || "");
        setCarb(d.carb_choice || "");
        setVeggie(d.veggie_choice || "");
        setFat(d.fat_choice || "");
        setBudget(d.weekly_budget || "");
        setAvoidances(d.food_avoidances || []);
        setHousehold(d.household_size || "just_me");
        setCuisines(d.cuisine_preferences || []);
        setComplexity(d.complexity_level || "home_chef");
        setBiggestMeal(d.biggest_meal || "midday");
        setHealthySwaps(d.healthy_swaps_enabled ?? true);
      }
      setLoading(false);
    });
  }, [user]);

  const toggleMeal = (m: string) => setMeals(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleAvoidance = (item: string) => {
    if (item === "None") { setAvoidances([]); return; }
    setAvoidances(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev.filter(x => x !== "None"), item]);
  };

  const isValid = meals.length >= 2 && protein && carb && veggie && fat && budget;

  const handleSave = async () => {
    if (!user || !isValid) return;
    setSaving(true);
    const finalAvoidances = avoidances.filter(a => a !== "None");

    await supabase.from("profiles").update({
      meals_selected: meals, protein_choice: protein, carb_choice: carb, veggie_choice: veggie,
      fat_choice: fat, weekly_budget: budget, food_avoidances: finalAvoidances,
      household_size: household, serving_size: household,
      cuisine_preferences: cuisines, complexity_level: complexity,
      biggest_meal: biggestMeal, healthy_swaps_enabled: healthySwaps,
    } as any).eq("id", user.id);

    setPreferences({
      mealsSelected: meals, protein, carb, veggie, fat, weeklyBudget: budget,
      cuisinePreferences: cuisines, complexityLevel: complexity,
      biggestMeal, healthySwapsEnabled: healthySwaps,
    });
    setFoodAvoidances(finalAvoidances);
    setHouseholdSize(household);

    setSaving(false);
    setShowRegen(true);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><span className="text-4xl animate-pulse">🥗</span></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card border-b border-border px-6 py-3">
        <button onClick={() => navigate("/meal-plan?sheet=open")} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="text-lg font-bold text-foreground">Diet & Nutrition</h1>
      </header>

      <div className="px-6 py-8 pb-28">
        {/* Cuisine Style */}
        <CuisineSelector cuisines={cuisines} onChange={setCuisines} />

        {/* Complexity Level */}
        <ComplexityLevel value={complexity} onChange={setComplexity} />

        {/* Meal Weight Preference */}
        <MealWeightPreference value={biggestMeal} onChange={setBiggestMeal} />

        {/* Healthy Swaps */}
        <HealthySwapsToggle value={healthySwaps} onChange={setHealthySwaps} />

        {/* Meals */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Which meals do you prep?</h2>
          <p className="text-sm text-muted-foreground mb-3">Pick at least 2</p>
          <div className="flex flex-wrap gap-2">
            {mealOptions.map(m => (
              <button key={m} onClick={() => toggleMeal(m)} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors min-h-[48px] ${meals.includes(m) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{m}</button>
            ))}
          </div>
        </section>

        {/* Protein */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your protein</h2>
          <div className="grid grid-cols-2 gap-2">
            {proteinOptions.map(o => <RadioCard key={o.label} {...o} selected={protein === o.label} onSelect={() => setProtein(o.label)} />)}
          </div>
        </section>

        {/* Carb */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your carb</h2>
          <div className="grid grid-cols-2 gap-2">
            {carbOptions.map(o => <RadioCard key={o.label} {...o} selected={carb === o.label} onSelect={() => setCarb(o.label)} />)}
          </div>
        </section>

        {/* Veggie */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your veggie</h2>
          <div className="grid grid-cols-2 gap-2">
            {veggieOptions.map(o => <RadioCard key={o.label} {...o} selected={veggie === o.label} onSelect={() => setVeggie(o.label)} />)}
          </div>
        </section>

        {/* Fat */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your fat source</h2>
          <div className="grid grid-cols-2 gap-2">
            {fatOptions.map(o => <RadioCard key={o.label} {...o} selected={fat === o.label} onSelect={() => setFat(o.label)} />)}
          </div>
        </section>

        {/* Budget */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Weekly grocery budget</h2>
          <div className="grid grid-cols-3 gap-2">
            {budgetOptions.map(o => (
              <button key={o.label} onClick={() => setBudget(o.label)} className={`flex flex-col items-center justify-center rounded-lg border-2 px-3 py-4 transition-all min-h-[48px] ${budget === o.label ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                <span className="text-2xl mb-1">{o.emoji}</span>
                <span className="text-sm font-medium text-foreground">{o.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Avoidances */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Any foods to avoid?</h2>
          <div className="flex flex-wrap gap-2">
            {avoidanceOptions.map(item => {
              const isNoneSelected = avoidances.length === 0 && item === "None";
              const isSelected = item === "None" ? isNoneSelected : avoidances.includes(item);
              return (
                <button key={item} onClick={() => toggleAvoidance(item)} className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{item}</button>
              );
            })}
          </div>
        </section>

        {/* Household */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Who are you cooking for?</h2>
          <div className="space-y-3">
            {householdOptions.map(opt => (
              <button key={opt.value} onClick={() => setHousehold(opt.value)} className={`w-full flex items-center gap-4 rounded-lg border-2 px-5 py-4 text-left transition-colors ${household === opt.value ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-base font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button onClick={handleSave} disabled={saving || !isValid} className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 active:scale-[0.98] transition-transform">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <RegenerationSheet
        open={showRegen}
        onOpenChange={setShowRegen}
        onRegenerate={() => { setShowRegen(false); setMealPlan(null); setCookGuide(null); navigate("/meal-plan"); }}
        onKeep={() => { setShowRegen(false); navigate("/meal-plan"); }}
      />
    </div>
  );
};

export default ProfileDiet;
