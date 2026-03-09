import { ChevronLeft, ChevronRight } from "lucide-react";

const screenLabels = ["Cook Guide", "This Week", "Grocery List"];

interface SwipeIndicatorProps {
  activeIndex: number;
  onNavigate: (index: number) => void;
}

const SwipeIndicator = ({ activeIndex, onNavigate }: SwipeIndicatorProps) => {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <span className="text-xs font-medium text-muted-foreground">
        {screenLabels[activeIndex]}
      </span>
      <div className="flex items-center gap-3">
        {/* Left chevron */}
        <button
          onClick={() => onNavigate(activeIndex - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity"
          style={{ opacity: activeIndex === 0 ? 0 : 1, pointerEvents: activeIndex === 0 ? "none" : "auto" }}
          aria-label="Previous screen"
        >
          <ChevronLeft className="h-6 w-6 text-primary/70" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className="flex items-center justify-center"
              aria-label={screenLabels[i]}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "h-2.5 w-2.5 bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]"
                    : "h-2 w-2 border border-muted-foreground/40 bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Right chevron */}
        <button
          onClick={() => onNavigate(activeIndex + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-opacity"
          style={{ opacity: activeIndex === 2 ? 0 : 1, pointerEvents: activeIndex === 2 ? "none" : "auto" }}
          aria-label="Next screen"
        >
          <ChevronRight className="h-6 w-6 text-primary/70" />
        </button>
      </div>
    </div>
  );
};

export default SwipeIndicator;
