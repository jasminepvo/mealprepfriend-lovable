import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMealPrep } from "@/context/MealPrepContext";
import { Slider } from "@/components/ui/slider";
import AppHeader from "@/components/AppHeader";

const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const activityOptions = [
  { value: "sedentary" as const, emoji: "🪑", label: "Sedentary", desc: "Desk job, little or no exercise" },
  { value: "lightly_active" as const, emoji: "🚶", label: "Lightly Active", desc: "Light walks 1–3x per week" },
  { value: "moderately_active" as const, emoji: "🏃", label: "Moderately Active", desc: "Exercise 3–5x per week" },
  { value: "very_active" as const, emoji: "💪", label: "Very Active", desc: "Intense training 6–7x per week" },
];

const goalOptions = [
  { key: "lose_weight", emoji: "🔥", name: "Lose Weight", calorieDelta: -300, protein: 40, carb: 25, fat: 35 },
  { key: "build_muscle", emoji: "💪", name: "Build Muscle", calorieDelta: 200, protein: 45, carb: 35, fat: 20 },
  { key: "maintain", emoji: "⚖️", name: "Maintain", calorieDelta: 0, protein: 30, carb: 40, fat: 30 },
  { key: "gain_weight", emoji: "📈", name: "Gain Weight", calorieDelta: 400, protein: 30, carb: 45, fat: 25 },
];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProfile, setOnboardingCompleted } = useMealPrep();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [sex, setSex] = useState<"female" | "male">("female");
  const [age, setAge] = useState(30);
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [activity, setActivity] = useState<keyof typeof activityMultipliers>("sedentary");
  const [selectedGoal, setSelectedGoal] = useState("maintain");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        const d = data as any;
        const savedUnit = d.unit_preference || "imperial";
        setUnit(savedUnit);
        setSex(d.biological_sex || "female");
        setAge(d.age || 30);
        setActivity(d.activity_level || "sedentary");
        setSelectedGoal(d.selected_goal || "maintain");

        if (savedUnit === "metric") {
          setCurrentWeight(d.weight_kg ? parseFloat(d.weight_kg).toFixed(1) : "");
          setGoalWeight(d.goal_weight_lbs ? (parseFloat(d.goal_weight_lbs) * 0.453592).toFixed(1) : "");
          setHeightCmInput(d.height_cm ? Math.round(parseFloat(d.height_cm)).toString() : "");
        } else {
          setCurrentWeight(d.current_weight_lbs?.toString() || "");
          setGoalWeight(d.goal_weight_lbs?.toString() || "");
          setHeightFt(d.height_ft?.toString() || "");
          setHeightIn(d.height_in?.toString() || "");
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const switchUnit = (newUnit: "imperial" | "metric") => {
    if (newUnit === unit) return;
    if (newUnit === "metric") {
      if (currentWeight) setCurrentWeight((parseFloat(currentWeight) / 2.205).toFixed(1));
      if (goalWeight) setGoalWeight((parseFloat(goalWeight) / 2.205).toFixed(1));
      if (heightFt || heightIn) {
        const totalInches = (parseInt(heightFt || "0") * 12) + parseInt(heightIn || "0");
        setHeightCmInput(Math.round(totalInches * 2.54).toString());
      }
    } else {
      if (currentWeight) setCurrentWeight((parseFloat(currentWeight) * 2.205).toFixed(1));
      if (goalWeight) setGoalWeight((parseFloat(goalWeight) * 2.205).toFixed(1));
      if (heightCmInput) {
        const totalInches = parseFloat(heightCmInput) / 2.54;
        setHeightFt(Math.floor(totalInches / 12).toString());
        setHeightIn(Math.round(totalInches % 12).toString());
      }
    }
    setUnit(newUnit);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const cwDisplay = parseFloat(currentWeight);
    const gwDisplay = parseFloat(goalWeight);

    let weightKg: number, heightCm: number;
    if (unit === "imperial") {
      weightKg = cwDisplay * 0.453592;
      const ft = parseInt(heightFt);
      const inches = parseInt(heightIn);
      heightCm = ft * 30.48 + inches * 2.54;
    } else {
      weightKg = cwDisplay;
      heightCm = parseFloat(heightCmInput);
    }

    const bmr = sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = Math.round(bmr * activityMultipliers[activity]);
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    const goal = goalOptions.find((g) => g.key === selectedGoal) || goalOptions[2];
    const targetCalories = tdee + goal.calorieDelta;

    let storeFt: number, storeIn: number;
    if (unit === "imperial") {
      storeFt = parseInt(heightFt);
      storeIn = parseInt(heightIn);
    } else {
      const totalIn = heightCm / 2.54;
      storeFt = Math.floor(totalIn / 12);
      storeIn = Math.round(totalIn % 12);
    }

    const cwLbs = unit === "imperial" ? cwDisplay : cwDisplay * 2.205;
    const gwLbs = unit === "imperial" ? gwDisplay : gwDisplay * 2.205;

    await supabase
      .from("profiles")
      .update({
        biological_sex: sex,
        age,
        height_ft: storeFt,
        height_in: storeIn,
        current_weight_lbs: parseFloat(cwLbs.toFixed(1)),
        goal_weight_lbs: parseFloat(gwLbs.toFixed(1)),
        activity_level: activity,
        bmi,
        bmr: Math.round(bmr),
        tdee,
        selected_goal: selectedGoal,
        target_calories: targetCalories,
        protein_pct: goal.protein,
        carb_pct: goal.carb,
        fat_pct: goal.fat,
        unit_preference: unit,
        weight_kg: parseFloat(weightKg.toFixed(2)),
        height_cm: parseFloat(heightCm.toFixed(1)),
      } as any)
      .eq("id", user.id);

    setProfile({
      biologicalSex: sex,
      age,
      heightFt: storeFt,
      heightIn: storeIn,
      currentWeight: parseFloat(cwLbs.toFixed(1)),
      goalWeight: parseFloat(gwLbs.toFixed(1)),
      activityLevel: activity,
      bmi,
      bmr: Math.round(bmr),
      tdee,
      selectedGoal,
      targetCalories,
      proteinPct: goal.protein,
      carbPct: goal.carb,
      fatPct: goal.fat,
      unitPreference: unit,
      weightKg: parseFloat(weightKg.toFixed(2)),
      heightCm: parseFloat(heightCm.toFixed(1)),
    });
    setOnboardingCompleted(true);

    setSaving(false);
    navigate("/meal-plan");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-4xl animate-pulse">🥗</span>
      </div>
    );
  }

  const canSave = unit === "imperial"
    ? currentWeight && goalWeight && heightFt && heightIn
    : currentWeight && goalWeight && heightCmInput;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-28">
        <h1 className="text-3xl font-bold text-foreground mb-8">Edit Profile</h1>

        {/* Unit Toggle */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-0 rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => switchUnit("imperial")}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              🇺🇸 Imperial
            </button>
            <button
              onClick={() => switchUnit("metric")}
              className={`px-4 py-3 text-sm font-semibold transition-colors ${
                unit === "metric" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              🌍 Metric
            </button>
          </div>
        </section>

        {/* Biological Sex */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">Biological sex</label>
          <div className="grid grid-cols-2 gap-3">
            {(["female", "male"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className={`rounded-lg border-2 px-4 py-4 text-base font-semibold transition-colors ${
                  sex === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
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
          <Slider value={[age]} onValueChange={(v) => setAge(v[0])} min={18} max={80} step={1} />
        </section>

        {/* Height */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">Height</label>
          {unit === "imperial" ? (
            <div className="grid grid-cols-2 gap-3">
              <input type="number" inputMode="numeric" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="ft" className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="number" inputMode="numeric" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="in" className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          ) : (
            <input type="number" inputMode="numeric" value={heightCmInput} onChange={(e) => setHeightCmInput(e.target.value)} placeholder="cm" className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          )}
        </section>

        {/* Weight */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current weight ({unit === "imperial" ? "lbs" : "kg"})</label>
              <input type="number" inputMode="numeric" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Goal weight ({unit === "imperial" ? "lbs" : "kg"})</label>
              <input type="number" inputMode="numeric" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        </section>

        {/* Activity */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">Activity level</label>
          <div className="space-y-3">
            {activityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActivity(opt.value)}
                className={`w-full flex items-center gap-4 rounded-lg border-2 px-4 py-4 text-left transition-colors ${
                  activity === opt.value ? "border-primary bg-primary/10" : "border-border bg-card"
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

        {/* Goal */}
        <section className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">Goal</label>
          <div className="space-y-3">
            {goalOptions.map((g) => (
              <button
                key={g.key}
                onClick={() => setSelectedGoal(g.key)}
                className={`w-full flex items-center gap-4 rounded-lg border-2 px-4 py-4 text-left transition-colors ${
                  selectedGoal === g.key ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-base font-medium text-foreground">{g.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
