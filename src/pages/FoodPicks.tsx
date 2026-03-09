import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";

const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];

const proteinOptions = [
  { emoji: "🐔", label: "Chicken" },
  { emoji: "🐟", label: "Fish (Tilapia)" },
  { emoji: "🍣", label: "Salmon" },
  { emoji: "🦐", label: "Shrimp" },
  { emoji: "🥩", label: "Steak" },
  { emoji: "🫙", label: "Ground Beef" },
  { emoji: "🦃", label: "Ground Turkey" },
  { emoji: "🐷", label: "Ground Pork" },
  { emoji: "🥚", label: "Eggs" },
  { emoji: "🥓", label: "Turkey Bacon" },
  { emoji: "🧆", label: "Chickpeas" },
  { emoji: "🫘", label: "Black Beans" },
  { emoji: "🥩", label: "Lamb" },
  { emoji: "🍗", label: "Chicken Thighs" },
  { emoji: "🐟", label: "Tuna (canned)" },
  { emoji: "🦞", label: "Cod" },
];

const carbOptions = [
  { emoji: "🥔", label: "White Potato" },
  { emoji: "🍠", label: "Sweet Potato" },
  { emoji: "🍚", label: "White Rice" },
  { emoji: "🟤", label: "Brown Rice" },
  { emoji: "🌽", label: "Corn" },
  { emoji: "🍝", label: "Pasta" },
  { emoji: "🍞", label: "Sourdough Bread" },
  { emoji: "🌾", label: "Oats" },
  { emoji: "🫘", label: "Lentils" },
  { emoji: "🥙", label: "Whole Wheat Tortilla" },
  { emoji: "🍚", label: "Jasmine Rice" },
  { emoji: "🍚", label: "Basmati Rice" },
  { emoji: "🟡", label: "Quinoa" },
  { emoji: "🍞", label: "Whole Wheat Bread" },
  { emoji: "🌾", label: "Farro" },
  { emoji: "🟠", label: "Butternut Squash" },
];

const veggieOptions = [
  { emoji: "🥦", label: "Broccoli" },
  { emoji: "🥕", label: "Carrot" },
  { emoji: "🫛", label: "Green Beans" },
  { emoji: "🥬", label: "Spinach" },
  { emoji: "🫑", label: "Bell Pepper" },
  { emoji: "🥒", label: "Zucchini" },
  { emoji: "🧅", label: "Onion" },
  { emoji: "🍄", label: "Mushrooms" },
  { emoji: "🥬", label: "Bok Choy" },
  { emoji: "🥦", label: "Cauliflower" },
  { emoji: "🍅", label: "Tomato" },
  { emoji: "🧄", label: "Garlic" },
  { emoji: "🥑", label: "Asparagus" },
  { emoji: "🌿", label: "Kale" },
  { emoji: "🥗", label: "Arugula" },
  { emoji: "🫛", label: "Sugar Snap Peas" },
  { emoji: "🧅", label: "Leek" },
  { emoji: "🟣", label: "Purple Cabbage" },
  { emoji: "🥗", label: "Brussels Sprouts" },
  { emoji: "🟠", label: "Butternut Squash" },
  { emoji: "🍆", label: "Eggplant" },
  { emoji: "🥬", label: "Swiss Chard" },
  { emoji: "🟡", label: "Yellow Squash" },
  { emoji: "🌶️", label: "Jalapeño" },
  { emoji: "🫚", label: "Celery" },
];

const fatOptions = [
  { emoji: "🥑", label: "Avocado" },
  { emoji: "🫒", label: "Olive Oil" },
  { emoji: "🥜", label: "Peanut Butter" },
  { emoji: "🧀", label: "Cheese" },
  { emoji: "🥥", label: "Coconut Oil" },
  { emoji: "🌰", label: "Almonds" },
  { emoji: "🌻", label: "Sunflower Butter" },
  { emoji: "🐟", label: "Fatty Fish (Omega-3)" },
  { emoji: "🥚", label: "Egg Yolks" },
  { emoji: "🧈", label: "Ghee" },
  { emoji: "🌰", label: "Walnuts" },
  { emoji: "🫘", label: "Tahini" },
];

const budgetOptions = [
  { emoji: "💚", label: "$0–50" },
  { emoji: "💛", label: "$50–100" },
  { emoji: "🧡", label: "$100–200" },
];

const avoidanceOptions = ["None", "Gluten", "Dairy", "Nuts", "Shellfish", "Pork"];

const householdOptions = [
  { value: "just_me", emoji: "🧍", label: "Just me" },
  { value: "me_plus_1", emoji: "👫", label: "Me + 1" },
  { value: "family", emoji: "👨‍👩‍👧‍👦", label: "Family of 3–4" },
];

interface ToggleCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const ToggleCard = ({ emoji, label, selected, onSelect }: ToggleCardProps) => (
  <button
    onClick={onSelect}
    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all min-h-[48px] ${
      selected
        ? "border-primary bg-primary/10"
        : "border-border bg-card hover:border-primary/30"
    }`}
  >
    <span className="text-xl">{emoji}</span>
    <span className="text-base font-medium text-foreground flex-1">{label}</span>
    {selected && (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">✓</span>
    )}
  </button>
);

interface RadioCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const RadioCard = ({ emoji, label, selected, onSelect }: RadioCardProps) => (
  <button
    onClick={onSelect}
    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all min-h-[48px] ${
      selected
        ? "border-primary bg-primary/10"
        : "border-border bg-card hover:border-primary/30"
    }`}
  >
    <span className="text-xl">{emoji}</span>
    <span className="text-base font-medium text-foreground flex-1">{label}</span>
    {selected && (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">✓</span>
    )}
  </button>
);

const FoodPicks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, setPreferences, setFoodAvoidances, setHouseholdSize, setOnboardingCompleted } = useMealPrep();
  const [meals, setMeals] = useState<string[]>([]);
  const [proteins, setProteins] = useState<string[]>([]);
  const [carbs, setCarbs] = useState<string[]>([]);
  const [veggies, setVeggies] = useState<string[]>([]);
  const [fat, setFat] = useState("");
  const [budget, setBudget] = useState("");
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [household, setHousehold] = useState("just_me");
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  };

  const toggleMeal = (m: string) => {
    setMeals((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  const toggleAvoidance = (item: string) => {
    if (item === "None") {
      setAvoidances([]);
      return;
    }
    setAvoidances((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev.filter((x) => x !== "None"), item]
    );
  };

  const isValid = meals.length >= 2 && proteins.length >= 1 && carbs.length >= 1 && veggies.length >= 1 && fat && budget;

  const handleGenerate = async () => {
    setAttempted(true);
    if (!profile || !user || !isValid) return;
    setSaving(true);

    const finalAvoidances = avoidances.filter((a) => a !== "None");

    setPreferences({
      mealsSelected: meals,
      protein: proteins.join(", "),
      carb: carbs.join(", "),
      veggie: veggies.join(", "),
      fat,
      weeklyBudget: budget,
      cuisinePreferences: [],
      complexityLevel: "home_chef",
      biggestMeal: "midday",
      healthySwapsEnabled: true,
    });
    setFoodAvoidances(finalAvoidances);
    setHouseholdSize(household);
    setOnboardingCompleted(true);

    await supabase
      .from("profiles")
      .update({
        biological_sex: profile.biologicalSex,
        age: profile.age,
        height_ft: profile.heightFt,
        height_in: profile.heightIn,
        current_weight_lbs: profile.currentWeight,
        goal_weight_lbs: profile.goalWeight,
        activity_level: profile.activityLevel,
        bmi: profile.bmi,
        bmr: profile.bmr,
        tdee: profile.tdee,
        selected_goal: profile.selectedGoal,
        target_calories: profile.targetCalories,
        protein_pct: profile.proteinPct,
        carb_pct: profile.carbPct,
        fat_pct: profile.fatPct,
        meals_selected: meals,
        protein_choice: proteins.join(", "),
        carb_choice: carbs.join(", "),
        veggie_choice: veggies.join(", "),
        fat_choice: fat,
        weekly_budget: budget,
        food_avoidances: finalAvoidances,
        household_size: household,
        serving_size: household,
        onboarding_completed: true,
        unit_preference: profile.unitPreference,
        weight_kg: profile.weightKg,
        height_cm: profile.heightCm,
      } as any)
      .eq("id", user.id);

    setSaving(false);
    navigate("/meal-plan");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-32">
        <p className="text-sm font-medium text-muted-foreground mb-2">Step 3 of 3</p>
        <h1 className="text-3xl font-bold text-foreground mb-8">What do you want to eat?</h1>

        {/* Meals */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Which meals do you prep?</h2>
          <p className="text-sm text-muted-foreground mb-3">Pick at least 2</p>
          <div className="flex flex-wrap gap-2">
            {mealOptions.map((m) => (
              <button
                key={m}
                onClick={() => toggleMeal(m)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors min-h-[48px] ${
                  meals.includes(m)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* Protein — multiselect pills */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your proteins</h2>
          <p className="text-sm text-muted-foreground mb-3">Select all that you like</p>
          <div className="flex flex-wrap gap-2">
            {proteinOptions.map((o) => (
              <button key={o.label} onClick={() => toggleSelection(proteins, setProteins, o.label)} className={`rounded-full px-2.5 py-3 text-sm font-medium transition-colors min-h-[44px] ${proteins.includes(o.label) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
          {attempted && proteins.length === 0 && (
            <p className="text-sm text-destructive mt-2">Pick at least one option.</p>
          )}
        </section>

        {/* Carb — multiselect pills */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your carbs</h2>
          <p className="text-sm text-muted-foreground mb-3">Select all that you like</p>
          <div className="flex flex-wrap gap-2">
            {carbOptions.map((o) => (
              <button key={o.label} onClick={() => toggleSelection(carbs, setCarbs, o.label)} className={`rounded-full px-2.5 py-3 text-sm font-medium transition-colors min-h-[44px] ${carbs.includes(o.label) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
          {attempted && carbs.length === 0 && (
            <p className="text-sm text-destructive mt-2">Pick at least one option.</p>
          )}
        </section>

        {/* Veggie — multiselect pills */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your veggies</h2>
          <p className="text-sm text-muted-foreground mb-3">Select all that you like</p>
          <div className="flex flex-wrap gap-2">
            {veggieOptions.map((o) => (
              <button key={o.label} onClick={() => toggleSelection(veggies, setVeggies, o.label)} className={`rounded-full px-2.5 py-3 text-sm font-medium transition-colors min-h-[44px] ${veggies.includes(o.label) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
          {attempted && veggies.length === 0 && (
            <p className="text-sm text-destructive mt-2">Pick at least one option.</p>
          )}
        </section>

        {/* Fat — single select */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your fat source</h2>
          <div className="grid grid-cols-2 gap-2">
            {fatOptions.map((o) => (
              <RadioCard key={o.label} {...o} selected={fat === o.label} onSelect={() => setFat(o.label)} />
            ))}
          </div>
        </section>

        {/* Budget */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Weekly grocery budget</h2>
          <div className="grid grid-cols-3 gap-2">
            {budgetOptions.map((o) => (
              <button
                key={o.label}
                onClick={() => setBudget(o.label)}
                className={`flex flex-col items-center justify-center rounded-lg border-2 px-3 py-4 transition-all min-h-[48px] ${
                  budget === o.label
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-2xl mb-1">{o.emoji}</span>
                <span className="text-sm font-medium text-foreground">{o.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Food avoidances */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Any foods to avoid?</h2>
          <div className="flex flex-wrap gap-2">
            {avoidanceOptions.map((item) => {
              const isNoneSelected = avoidances.length === 0 && item === "None";
              const isSelected = item === "None" ? isNoneSelected : avoidances.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleAvoidance(item)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        {/* Household size */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Who are you cooking for?</h2>
          <div className="space-y-3">
            {householdOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHousehold(opt.value)}
                className={`w-full flex items-center gap-4 rounded-lg border-2 px-5 py-4 text-left transition-colors ${
                  household === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-base font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleGenerate}
          disabled={!isValid || saving}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {saving ? "Saving..." : "Generate My Meal Plan ✨"}
        </button>
      </div>
    </div>
  );
};

export default FoodPicks;
