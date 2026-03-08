import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";

const activityOptions = [
  { value: "sedentary" as const, label: "Sedentary", desc: "Desk job, little exercise" },
  { value: "lightly_active" as const, label: "Lightly Active", desc: "Walks 1-3x/week" },
  { value: "moderately_active" as const, label: "Moderately Active", desc: "Exercises 3-5x/week" },
  { value: "very_active" as const, label: "Very Active", desc: "Intense exercise 6-7x/week" },
];

const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

function calculateTDEE(weight: number, activity: keyof typeof activityMultipliers) {
  // Mifflin-St Jeor for female, 35yo, 5'4" (162.56 cm)
  const weightKg = weight * 0.453592;
  const heightCm = 162.56;
  const age = 35;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * activityMultipliers[activity]);
}

const Goals = () => {
  const navigate = useNavigate();
  const { setProfile } = useMealPrep();
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [activity, setActivity] = useState<keyof typeof activityMultipliers | "">("");
  const [showResults, setShowResults] = useState(false);
  const [calories, setCalories] = useState(0);

  const canCalculate = currentWeight && goalWeight && activity;

  const handleCalculate = () => {
    if (!activity) return;
    const cw = parseFloat(currentWeight);
    const gw = parseFloat(goalWeight);
    let tdee = calculateTDEE(cw, activity);
    let recommended = tdee;

    if (gw < cw) recommended = tdee - 300;
    else if (gw > cw) recommended = tdee + 200;

    setCalories(recommended);
    setShowResults(true);
  };

  const handleContinue = () => {
    if (!activity) return;
    const cw = parseFloat(currentWeight);
    const gw = parseFloat(goalWeight);
    const tdee = calculateTDEE(cw, activity);

    setProfile({
      currentWeight: cw,
      goalWeight: gw,
      activityLevel: activity,
      tdee,
      recommendedCalories: calories,
      proteinPct: 30,
      carbPct: 40,
      fatPct: 30,
    });
    navigate("/preferences");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <p className="text-sm font-medium text-muted-foreground mb-2">Step 1 of 2</p>
      <h1 className="text-3xl font-bold text-foreground mb-8">Tell us about you</h1>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Current weight (lbs)</label>
          <input
            type="number"
            inputMode="numeric"
            value={currentWeight}
            onChange={(e) => { setCurrentWeight(e.target.value); setShowResults(false); }}
            placeholder="e.g. 160"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Goal weight (lbs)</label>
          <input
            type="number"
            inputMode="numeric"
            value={goalWeight}
            onChange={(e) => { setGoalWeight(e.target.value); setShowResults(false); }}
            placeholder="e.g. 140"
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Activity level</label>
          <div className="space-y-3">
            {activityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setActivity(opt.value); setShowResults(false); }}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                  activity === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <span className="block text-base font-medium text-foreground">{opt.label}</span>
                <span className="block text-sm text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!showResults ? (
        <button
          onClick={handleCalculate}
          disabled={!canCalculate}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          Next →
        </button>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Your daily calorie target</p>
            <p className="text-3xl font-bold text-foreground mb-4">{calories} calories</p>
            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
                Protein 30%
              </span>
              <span className="rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-foreground">
                Carbs 40%
              </span>
              <span className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                Fat 30%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              These are starting recommendations. You can always adjust.
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
          >
            This looks good →
          </button>
        </div>
      )}
    </div>
  );
};

export default Goals;
