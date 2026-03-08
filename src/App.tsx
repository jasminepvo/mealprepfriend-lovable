import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MealPrepProvider } from "@/context/MealPrepContext";
import Welcome from "./pages/Welcome";
import Goals from "./pages/Goals";
import FoodPicks from "./pages/FoodPicks";
import MealPlan from "./pages/MealPlan";
import CookGuide from "./pages/CookGuide";
import GroceryList from "./pages/GroceryList";
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
            <Route path="/" element={<Welcome />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/food-picks" element={<FoodPicks />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/grocery-list" element={<GroceryList />} />
            <Route path="/cook-guide" element={<CookGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MealPrepProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
