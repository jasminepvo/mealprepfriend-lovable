import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";
import AppHeader from "@/components/AppHeader";

const goalOptions = [
  {
    key: "lose_weight",
    emoji: "🔥",
    name: "Lose Weight",
    desc: "High protein, lower carbs to burn fat",
    calorieDelta: -300,
    protein: 40,
    carb: 25,
    fat: 35,
  },
  {
    key: "build_muscle",
    emoji: "💪",
    name: "Build Muscle",
    desc: "More protein and calories to grow strength",
    calorieDelta: 200,
    protein: 45,
    carb: 35,
    fat: 20,
  },
  {
    key: "maintain",
    emoji: "⚖️",
    name: "Maintain",
    desc: "Balanced nutrition to stay where you are",
    calorieDelta: 0,
    protein: 30,
    carb: 40,
    fat: 30,
  },
  {
    key: "gain_weight",
    emoji: "📈",
    name: "Gain Weight",
    desc: "More carbs and calories to build mass",
    calorieDelta: 400,
    protein: 30,
    carb: 45,
    fat: 25,
  },
];

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return {
    label: "Underweight",
    pillColor: "bg-blue-500",
    context: "Your goal weight suggests you want to build more mass — we'll help with that.",
  };
  if (bmi < 25) return {
    label: "Healthy range",
    pillColor: "bg-green-500",
    context: "You're in a great place. Let's keep you there.",
  };
  if (bmi < 30) return {
    label: "Overweight",
    pillColor: "bg-yellow-500",
    context: "A modest calorie deficit will help you reach your goal gradually and sustainably.",
  };
  return {
    label: "Obese",
    pillColor: "bg-red-500",
    context: "Small consistent changes make a big difference. We'll start you with a gentle deficit.",
  };
}

function getBmiBarPosition(bmi: number): number {
  // Map BMI 15–40 to 0–100%
  const clamped = Math.max(15, Math.min(40, bmi));
  return ((clamped - 15) / 25) * 100;
}

function getDefaultGoal(currentWeight: number, goalWeight: number): string {
  if (goalWeight < currentWeight) return "lose_weight";
  if (goalWeight > currentWeight) return "gain_weight";
  return "maintain";
}

const YourGoal = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useMealPrep();

  const [selectedGoal, setSelectedGoal] = useState("");
  const [animateBmi, setAnimateBmi] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate("/goals");
      return;
    }
    const defaultGoal = getDefaultGoal(profile.currentWeight, profile.goalWeight);
    setSelectedGoal(defaultGoal);
    // Trigger BMI bar animation after mount
    const timer = setTimeout(() => setAnimateBmi(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!profile) return null;

  const currentGoal = goalOptions.find((g) => g.key === selectedGoal);
  const calorieTarget = currentGoal ? profile.tdee + currentGoal.calorieDelta : profile.tdee;
  const bmiCat = getBmiCategory(profile.bmi);
  const tdeeRounded = Math.round(profile.tdee / 10) * 10;
  const bmiPosition = getBmiBarPosition(profile.bmi);

  const handleContinue = () => {
    if (!currentGoal) return;
    setProfile({
      ...profile,
      selectedGoal: currentGoal.key,
      targetCalories: calorieTarget,
      proteinPct: currentGoal.protein,
      carbPct: currentGoal.carb,
      fatPct: currentGoal.fat,
    });
    navigate("/food-picks");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-28">
        <p className="text-sm font-medium text-muted-foreground mb-2">Step 2 of 3</p>
        <h1 className="text-3xl font-bold text-foreground mb-6">Your Goal</h1>

        {/* Grouped Stats Container — Law of Common Region */}
        <div className="rounded-2xl bg-muted/50 p-4 mb-8 space-y-4">
          {/* BMI Card — Enhanced */}
          <div className="rounded-xl bg-card border border-border p-5">
            <p className="text-xs text-muted-foreground mb-1 text-center">BMI</p>
            <p className="text-3xl font-bold text-foreground text-center mb-3">{profile.bmi}</p>

            {/* Gradient BMI bar */}
            <div className="relative h-3 rounded-full overflow-hidden mb-2"
              style={{
                background: "linear-gradient(to right, hsl(210, 80%, 60%), hsl(140, 60%, 50%) 30%, hsl(50, 80%, 55%) 60%, hsl(0, 70%, 55%))"
              }}
            >
              {/* Triangle indicator */}
              <div
                className="absolute top-0 transition-all duration-700 ease-out"
                style={{ left: animateBmi ? `${bmiPosition}%` : "0%", transform: "translateX(-50%)" }}
              >
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground" />
              </div>
            </div>

            {/* Color pill label */}
            <div className="flex justify-center mt-2 mb-2">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium text-primary-foreground ${bmiCat.pillColor}`}>
                {bmiCat.label}
              </span>
            </div>

            {/* Context sentence */}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {bmiCat.context}
            </p>
          </div>

          {/* TDEE & Calorie Target row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Daily Burn</p>
              <p className="text-2xl font-bold text-foreground">{tdeeRounded}</p>
              <span className="text-xs text-muted-foreground">TDEE</span>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Target</p>
              <p className="text-2xl font-bold text-primary">{calorieTarget}</p>
              <span className="text-xs text-muted-foreground">cal/day</span>
            </div>
          </div>
        </div>

        {/* Goal selection */}
        <h2 className="text-lg font-semibold text-foreground mb-1 font-sans">What's your goal?</h2>
        <p className="text-sm text-muted-foreground mb-4">Select one — we'll set your calories and macros automatically.</p>

        {/* Goal cards — Fitts' Law: min 72px, full width, generous padding */}
        <div className="space-y-3 mb-8">
          {goalOptions.map((goal) => {
            const cal = profile.tdee + goal.calorieDelta;
            const isSelected = selectedGoal === goal.key;
            return (
              <button
                key={goal.key}
                onClick={() => setSelectedGoal(goal.key)}
                className={`w-full rounded-xl border-2 px-5 py-5 text-left transition-all min-h-[72px] ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="text-base font-semibold text-foreground">{goal.name}</span>
                  <span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                    {cal} cal/day
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{goal.desc}</p>
                <div className="flex gap-2">
                  <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-medium text-foreground">P {goal.protein}%</span>
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-foreground">C {goal.carb}%</span>
                  <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-medium text-foreground">F {goal.fat}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live macro bars */}
        {currentGoal && (
          <div className="rounded-xl bg-card border border-border p-5 mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 font-sans">Macro Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Protein", pct: currentGoal.protein, color: "bg-secondary" },
                { label: "Carbs", pct: currentGoal.carb, color: "bg-primary" },
                { label: "Fat", pct: currentGoal.fat, color: "bg-accent" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.pct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all duration-500 ease-out`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleContinue}
          disabled={!selectedGoal}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          This looks good →
        </button>
      </div>
    </div>
  );
};

export default YourGoal;
