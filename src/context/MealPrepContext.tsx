import React, { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfile {
  biologicalSex: "female" | "male";
  age: number;
  heightFt: number;
  heightIn: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  bmi: number;
  bmr: number;
  tdee: number;
  selectedGoal: string;
  targetCalories: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  unitPreference: "imperial" | "metric";
  weightKg: number;
  heightCm: number;
}

export interface Preferences {
  mealsSelected: string[];
  protein: string;
  carb: string;
  veggie: string;
  fat: string;
  weeklyBudget: string;
  cuisinePreferences: string[];
  complexityLevel: "super_simple" | "home_chef" | "master_chef";
  biggestMeal: "morning" | "midday" | "evening";
  healthySwapsEnabled: boolean;
}

export interface Meal {
  name: string;
  calories: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  prep_time_min: number;
  cuisine?: string;
  cook_time_min?: number;
  ingredients?: string[];
  instructions?: string[];
  swap_tip?: string | null;
  meal_type?: string;
}

export interface DayPlan {
  day: string;
  meals: Meal[];
  day_total_calories?: number;
  day_total_protein_g?: number;
  day_total_carb_g?: number;
  day_total_fat_g?: number;
}

export interface CookStep {
  task: string;
  duration_min: number;
  parallel_tip: string;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  estimated_price: number;
}

export interface GroceryCategory {
  name: string;
  emoji: string;
  items: GroceryItem[];
}

export interface GroceryData {
  categories: GroceryCategory[];
  estimated_total: number;
}

interface MealPrepState {
  profile: UserProfile | null;
  preferences: Preferences | null;
  mealPlan: DayPlan[] | null;
  cookGuide: CookStep[] | null;
  groceryList: GroceryData | null;
  foodAvoidances: string[];
  householdSize: string;
  onboardingCompleted: boolean;
  setProfile: (p: UserProfile) => void;
  setPreferences: (p: Preferences) => void;
  setMealPlan: (mp: DayPlan[]) => void;
  setCookGuide: (cg: CookStep[]) => void;
  setGroceryList: (gl: GroceryData) => void;
  setFoodAvoidances: (fa: string[]) => void;
  setHouseholdSize: (hs: string) => void;
  setOnboardingCompleted: (v: boolean) => void;
  reset: () => void;
}

const MealPrepContext = createContext<MealPrepState | undefined>(undefined);

export const MealPrepProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [mealPlan, setMealPlan] = useState<DayPlan[] | null>(null);
  const [cookGuide, setCookGuide] = useState<CookStep[] | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryData | null>(null);
  const [foodAvoidances, setFoodAvoidances] = useState<string[]>([]);
  const [householdSize, setHouseholdSize] = useState("just_me");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const reset = () => {
    setProfile(null);
    setPreferences(null);
    setMealPlan(null);
    setCookGuide(null);
    setGroceryList(null);
    setFoodAvoidances([]);
    setHouseholdSize("just_me");
    setOnboardingCompleted(false);
  };

  return (
    <MealPrepContext.Provider value={{ profile, preferences, mealPlan, cookGuide, groceryList, foodAvoidances, householdSize, onboardingCompleted, setProfile, setPreferences, setMealPlan, setCookGuide, setGroceryList, setFoodAvoidances, setHouseholdSize, setOnboardingCompleted, reset }}>
      {children}
    </MealPrepContext.Provider>
  );
};

export const useMealPrep = () => {
  const ctx = useContext(MealPrepContext);
  if (!ctx) throw new Error("useMealPrep must be used within MealPrepProvider");
  return ctx;
};
