import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMealPrep } from "@/context/MealPrepContext";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const {
    onboardingCompleted,
    setOnboardingCompleted,
    setProfile,
    setPreferences,
    setFoodAvoidances,
    setHouseholdSize,
  } = useMealPrep();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        const d = data as any;
        if (d.onboarding_completed) {
          setOnboardingCompleted(true);
          setProfile({
            biologicalSex: d.biological_sex || "female",
            age: d.age || 30,
            heightFt: d.height_ft || 5,
            heightIn: d.height_in || 4,
            currentWeight: d.current_weight_lbs || 150,
            goalWeight: d.goal_weight_lbs || 150,
            activityLevel: d.activity_level || "moderately_active",
            bmi: d.bmi || 0,
            bmr: d.bmr || 0,
            tdee: d.tdee || 0,
            selectedGoal: d.selected_goal || "maintain",
            targetCalories: d.target_calories || 2000,
            proteinPct: d.protein_pct || 30,
            carbPct: d.carb_pct || 40,
            fatPct: d.fat_pct || 30,
            unitPreference: d.unit_preference || "imperial",
            weightKg: d.weight_kg || 0,
            heightCm: d.height_cm || 0,
          });
          setPreferences({
            mealsSelected: d.meals_selected || [],
            protein: d.protein_choice || "",
            carb: d.carb_choice || "",
            veggie: d.veggie_choice || "",
            fat: d.fat_choice || "",
            weeklyBudget: d.weekly_budget || "",
            cuisinePreferences: (d as any).cuisine_preferences || [],
            complexityLevel: (d as any).complexity_level || "home_chef",
            biggestMeal: (d as any).biggest_meal || "midday",
            healthySwapsEnabled: (d as any).healthy_swaps_enabled ?? true,
          });
          setFoodAvoidances(d.food_avoidances || []);
          setHouseholdSize(d.household_size || "just_me");
        }
      }
      setProfileChecked(true);
      setProfileLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-4xl animate-pulse">🥗</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Returning user: redirect to meal plan if on welcome/goals
  if (profileChecked && onboardingCompleted) {
    const onboardingPaths = ["/", "/goals", "/your-goal", "/food-picks"];
    if (onboardingPaths.includes(location.pathname)) {
      return <Navigate to="/meal-plan" replace />;
    }
  }

  // New user on non-onboarding pages: send to onboarding
  if (profileChecked && !onboardingCompleted) {
    const allowedPaths = ["/", "/goals", "/your-goal", "/food-picks"];
    const profilePaths = ["/profile/account", "/profile/about", "/profile/goals", "/profile/diet", "/edit-profile", "/vault"];
    if (!allowedPaths.includes(location.pathname) && !profilePaths.includes(location.pathname)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
