import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMealPrep } from "@/context/MealPrepContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";

const avoidanceOptions = ["None", "Gluten", "Dairy", "Nuts", "Shellfish", "Pork"];

const householdOptions = [
  { value: "just_me", emoji: "🧍", label: "Just me" },
  { value: "me_plus_1", emoji: "👫", label: "Me + 1" },
  { value: "family", emoji: "👨‍👩‍👧‍👦", label: "Family of 3–4" },
];

const Preferences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setFoodAvoidances, setHouseholdSize } = useMealPrep();
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [household, setHousehold] = useState("just_me");
  const [saving, setSaving] = useState(false);

  const toggleAvoidance = (item: string) => {
    if (item === "None") {
      setAvoidances([]);
      return;
    }
    setAvoidances((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev.filter((x) => x !== "None"), item]
    );
  };

  const handleContinue = async () => {
    setSaving(true);
    const finalAvoidances = avoidances.filter((a) => a !== "None");

    // Save to profile
    if (user) {
      await supabase
        .from("profiles")
        .update({
          food_avoidances: finalAvoidances,
          household_size: household,
        } as any)
        .eq("id", user.id);
    }

    setFoodAvoidances(finalAvoidances);
    setHouseholdSize(household);
    setSaving(false);
    navigate("/food-picks");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="px-6 py-8 pb-28">
        <p className="text-sm font-medium text-muted-foreground mb-2">Step 2 of 3</p>
        <h1 className="text-3xl font-bold text-foreground mb-8">A few more things</h1>

        {/* Food avoidances */}
        <section className="mb-10">
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
        <section className="mb-10">
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

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
};

export default Preferences;
