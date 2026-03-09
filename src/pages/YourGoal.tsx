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
  if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-500" };
  if (bmi < 25) return { label: "Healthy", color: "bg-green-500" };
  if (bmi < 30) return { label: "Overweight", color: "bg-yellow-500" };
  return { label: "Obese", color: "bg-red-500" };
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

  useEffect(() => {
    if (!profile) {
      navigate("/goals");
      return;
    }
    const defaultGoal = getDefaultGoal(profile.currentWeight, profile.goalWeight);
    setSelectedGoal(defaultGoal);
  }, []);

  if (!profile) return null;

  const currentGoal = goalOptions.find((g) => g.key === selectedGoal);
  const calorieTarget = currentGoal ? profile.tdee + currentGoal.calorieDelta : profile.tdee;
  const bmiCat = getBmiCategory(profile.bmi);
  const tdeeRounded = Math.round(profile.tdee / 10) * 10;

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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">BMI</p>
            <p className="text-2xl font-bold text-foreground">{profile.bmi}</p>
            <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium text-primary-foreground ${bmiCat.color}`}>
              {bmiCat.label}
            </span>
          </div>
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

        {/* Goal selection */}
        <h2 className="text-lg font-semibold text-foreground mb-1 font-sans">What's your goal?</h2>
        <p className="text-sm text-muted-foreground mb-4">Select one — we'll set your calories and macros automatically.</p>

        <div className="space-y-3 mb-8">
          {goalOptions.map((goal) => {
            const cal = profile.tdee + goal.calorieDelta;
            const isSelected = selectedGoal === goal.key;
            return (
              <button
                key={goal.key}
                onClick={() => setSelectedGoal(goal.key)}
                className={`w-full rounded-xl border-2 p-5 text-left transition-all ${
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
