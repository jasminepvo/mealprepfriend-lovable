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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MealPrepProvider>
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MealPrepProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
