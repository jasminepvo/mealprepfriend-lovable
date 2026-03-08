import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";

const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];

const proteinOptions = [
  { emoji: "🐔", label: "Chicken" },
  { emoji: "🐟", label: "Fish" },
  { emoji: "🥩", label: "Steak" },
  { emoji: "🫙", label: "Ground Beef" },
  { emoji: "🦃", label: "Ground Turkey" },
  { emoji: "🥚", label: "Eggs" },
];

const carbOptions = [
  { emoji: "🥔", label: "Potato" },
  { emoji: "🍠", label: "Sweet Potato" },
  { emoji: "🍚", label: "White Rice" },
  { emoji: "🍚", label: "Brown Rice" },
  { emoji: "🌽", label: "Corn" },
];

const veggieOptions = [
  { emoji: "🥦", label: "Broccoli" },
  { emoji: "🥕", label: "Carrot" },
  { emoji: "🫛", label: "Green Beans" },
  { emoji: "🥬", label: "Spinach" },
  { emoji: "🫑", label: "Bell Pepper" },
];

const fatOptions = [
  { emoji: "🥑", label: "Avocado" },
  { emoji: "🫒", label: "Olive Oil" },
  { emoji: "🥜", label: "Peanut Butter" },
  { emoji: "🧀", label: "Cheese" },
];

const budgetOptions = [
  { emoji: "💚", label: "$0–50" },
  { emoji: "💛", label: "$50–100" },
  { emoji: "🧡", label: "$100–200" },
];

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
  const { setPreferences } = useMealPrep();
  const [meals, setMeals] = useState<string[]>([]);
  const [protein, setProtein] = useState("");
  const [carb, setCarb] = useState("");
  const [veggie, setVeggie] = useState("");
  const [fat, setFat] = useState("");
  const [budget, setBudget] = useState("");

  const toggleMeal = (m: string) => {
    setMeals((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  const isValid = meals.length >= 2 && protein && carb && veggie && fat && budget;

  const handleGenerate = () => {
    setPreferences({
      mealsSelected: meals,
      protein,
      carb,
      veggie,
      fat,
      weeklyBudget: budget,
    });
    navigate("/meal-plan");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8 pb-32">
      <p className="text-sm font-medium text-muted-foreground mb-2">Step 2 of 2</p>
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

      {/* Protein */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your protein</h2>
        <div className="grid grid-cols-2 gap-2">
          {proteinOptions.map((o) => (
            <RadioCard key={o.label} {...o} selected={protein === o.label} onSelect={() => setProtein(o.label)} />
          ))}
        </div>
      </section>

      {/* Carb */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your carb</h2>
        <div className="grid grid-cols-2 gap-2">
          {carbOptions.map((o) => (
            <RadioCard key={o.label} {...o} selected={carb === o.label} onSelect={() => setCarb(o.label)} />
          ))}
        </div>
      </section>

      {/* Veggie */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Pick your veggie</h2>
        <div className="grid grid-cols-2 gap-2">
          {veggieOptions.map((o) => (
            <RadioCard key={o.label} {...o} selected={veggie === o.label} onSelect={() => setVeggie(o.label)} />
          ))}
        </div>
      </section>

      {/* Fat */}
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

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleGenerate}
          disabled={!isValid}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          Generate My Meal Plan ✨
        </button>
      </div>
    </div>
  );
};

export default FoodPicks;
