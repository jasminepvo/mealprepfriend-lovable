import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";
import { Slider } from "@/components/ui/slider";
import AppHeader from "@/components/AppHeader";

const activityOptions = [
  { value: "sedentary" as const, emoji: "🪑", label: "Sedentary", desc: "Desk job, little or no exercise" },
  { value: "lightly_active" as const, emoji: "🚶", label: "Lightly Active", desc: "Light walks 1–3x per week" },
  { value: "moderately_active" as const, emoji: "🏃", label: "Moderately Active", desc: "Exercise 3–5x per week" },
  { value: "very_active" as const, emoji: "💪", label: "Very Active", desc: "Intense training 6–7x per week" },
];

const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const Goals = () => {
  const navigate = useNavigate();
  const { setProfile } = useMealPrep();
  const [sex, setSex] = useState<"female" | "male">("female");
  const [age, setAge] = useState(30);
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [activity, setActivity] = useState<keyof typeof activityMultipliers | "">("");

  const canContinue = currentWeight && goalWeight && activity && heightFt && heightIn;

  const handleNext = () => {
    if (!activity || !canContinue) return;
    const cw = parseFloat(currentWeight);
    const gw = parseFloat(goalWeight);
    const ft = parseInt(heightFt);
    const inches = parseInt(heightIn);

    const weightKg = cw * 0.453592;
    const heightCm = ft * 30.48 + inches * 2.54;
    const totalInches = ft * 12 + inches;

    // Mifflin-St Jeor
    const bmr = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = Math.round(bmr * activityMultipliers[activity]);
    const bmi = parseFloat(((cw / (totalInches * totalInches)) * 703).toFixed(1));

    // Default goal/macros will be set on YourGoal screen
    setProfile({
      biologicalSex: sex,
      age,
      heightFt: ft,
      heightIn: inches,
      currentWeight: cw,
      goalWeight: gw,
      activityLevel: activity,
      bmi,
      bmr: Math.round(bmr),
      tdee,
      selectedGoal: "",
      targetCalories: tdee,
      proteinPct: 30,
      carbPct: 40,
      fatPct: 30,
    });
    navigate("/your-goal");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-28">
        <p className="text-sm font-medium text-muted-foreground mb-2">Step 1 of 3</p>
        <h1 className="text-3xl font-bold text-foreground mb-8">About You</h1>

        {/* Biological Sex */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-1">Biological sex</label>
          <p className="text-xs text-muted-foreground mb-3">(used for calorie calculation)</p>
          <div className="grid grid-cols-2 gap-3">
            {(["female", "male"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className={`rounded-lg border-2 px-4 py-4 text-base font-semibold transition-colors ${
                  sex === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {s === "female" ? "Female" : "Male"}
              </button>
            ))}
          </div>
        </section>

        {/* Age */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">Age</label>
          <p className="text-center text-4xl font-bold text-foreground mb-4">{age}</p>
          <Slider
            value={[age]}
            onValueChange={(v) => setAge(v[0])}
            min={18}
            max={80}
            step={1}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">18</span>
            <span className="text-xs text-muted-foreground">80</span>
          </div>
        </section>

        {/* Height */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">Height</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                inputMode="numeric"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                placeholder="ft"
                min={3}
                max={7}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground mt-1 block">feet</span>
            </div>
            <div>
              <input
                type="number"
                inputMode="numeric"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                placeholder="in"
                min={0}
                max={11}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground mt-1 block">inches</span>
            </div>
          </div>
        </section>

        {/* Weight */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current weight (lbs)</label>
              <input
                type="number"
                inputMode="numeric"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
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
                onChange={(e) => setGoalWeight(e.target.value)}
                placeholder="e.g. 140"
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </section>

        {/* Activity Level */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">How active are you?</label>
          <div className="space-y-3">
            {activityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActivity(opt.value)}
                className={`w-full flex items-center gap-4 rounded-lg border-2 px-4 py-4 text-left transition-colors ${
                  activity === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <span className="block text-base font-medium text-foreground">{opt.label}</span>
                  <span className="block text-sm text-muted-foreground">{opt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Goals;
