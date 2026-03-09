import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MealPrepProvider } from "@/context/MealPrepContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Goals from "./pages/Goals";
import YourGoal from "./pages/YourGoal";
import FoodPicks from "./pages/FoodPicks";
import MealPlan from "./pages/MealPlan";
import CookGuide from "./pages/CookGuide";
import GroceryList from "./pages/GroceryList";
import EditProfile from "./pages/EditProfile";
import Vault from "./pages/Vault";
import ProfileAccount from "./pages/ProfileAccount";
import ProfileAboutYou from "./pages/ProfileAboutYou";
import ProfileGoals from "./pages/ProfileGoals";
import ProfileDiet from "./pages/ProfileDiet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MealPrepProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/your-goal" element={<ProtectedRoute><YourGoal /></ProtectedRoute>} />
            <Route path="/food-picks" element={<ProtectedRoute><FoodPicks /></ProtectedRoute>} />
            <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
            <Route path="/grocery-list" element={<ProtectedRoute><GroceryList /></ProtectedRoute>} />
            <Route path="/cook-guide" element={<ProtectedRoute><CookGuide /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
            <Route path="/profile/account" element={<ProtectedRoute><ProfileAccount /></ProtectedRoute>} />
            <Route path="/profile/about" element={<ProtectedRoute><ProfileAboutYou /></ProtectedRoute>} />
            <Route path="/profile/goals" element={<ProtectedRoute><ProfileGoals /></ProtectedRoute>} />
            <Route path="/profile/diet" element={<ProtectedRoute><ProfileDiet /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MealPrepProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
