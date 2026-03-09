import { useMealPrep } from "@/context/MealPrepContext";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const CookGuideContent = () => {
  const { cookGuide } = useMealPrep();

  if (!cookGuide || cookGuide.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🗓️</span>
        <h2 className="text-xl font-bold text-foreground mb-2">No cook guide yet</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Generate a meal plan first to see your cook day steps.
        </p>
      </div>
    );
  }

  const totalMinutes = cookGuide.reduce((sum, s) => sum + s.duration_min, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Your Cook Day 🗓️</h1>
      <p className="text-muted-foreground mb-4">
        Follow these steps to prep everything in ~{hours}h {mins > 0 ? `${mins}m` : ""}
      </p>

      <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 mb-6">
        <span className="text-sm font-semibold text-foreground">
          ⏱ Total: {hours}h {mins > 0 ? `${mins}m` : ""}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-0.5 rounded-full hover:bg-primary/20 transition-colors">
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-w-[280px] text-sm">
            <p className="font-semibold mb-1">⏱️ About these times</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Cook times are AI-estimated based on standard prep and cooking times for each recipe.
              Your actual time may vary. First-timers may want to add 30–45 extra minutes.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-3">
        {cookGuide.map((step, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-base">{step.task}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-muted-foreground">⏱ {step.duration_min} min</span>
                </div>
                {step.parallel_tip && (
                  <p className="mt-2 text-sm text-muted-foreground italic">💡 {step.parallel_tip}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CookGuideContent;
