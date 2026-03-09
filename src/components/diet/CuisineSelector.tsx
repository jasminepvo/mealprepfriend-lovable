import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

const presetCuisines = [
  { flag: "🇻🇳", label: "Vietnamese" },
  { flag: "🇯🇵", label: "Japanese" },
  { flag: "🇰🇷", label: "Korean" },
  { flag: "🇺🇸", label: "American" },
  { flag: "🇲🇽", label: "Mexican" },
  { flag: "🇮🇹", label: "Italian" },
  { flag: "🇬🇷", label: "Mediterranean" },
  { flag: "🇮🇳", label: "Indian" },
  { flag: "🇨🇳", label: "Chinese" },
  { flag: "🇹🇭", label: "Thai" },
];

interface Props {
  cuisines: string[];
  onChange: (cuisines: string[]) => void;
}

const CuisineSelector = ({ cuisines, onChange }: Props) => {
  const [customInput, setCustomInput] = useState("");
  const presetLabels = presetCuisines.map(c => c.label);
  const customCuisines = cuisines.filter(c => !presetLabels.includes(c));

  const toggle = (label: string) => {
    if (cuisines.includes(label)) {
      onChange(cuisines.filter(c => c !== label));
    } else {
      if (cuisines.length >= 5) return;
      onChange([...cuisines, label]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || cuisines.includes(trimmed) || cuisines.length >= 5) return;
    onChange([...cuisines, trimmed]);
    setCustomInput("");
  };

  const removeCustom = (label: string) => {
    onChange(cuisines.filter(c => c !== label));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addCustom(); }
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-1 font-sans">What cuisines do you love?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Pick 1–2 for the best grocery list. Mix and match at meal level — we'll keep the core ingredients the same.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {presetCuisines.map(({ flag, label }) => {
          const selected = cuisines.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[40px] ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
              {selected && <span className="ml-0.5">✓</span>}
            </button>
          );
        })}

        {customCuisines.map(label => (
          <span key={label} className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium min-h-[40px]">
            {label} ✓
            <button onClick={() => removeCustom(label)} className="ml-1 hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your own (e.g. Peruvian)..."
          className="flex-1"
        />
        <button
          onClick={addCustom}
          disabled={!customInput.trim() || cuisines.length >= 5}
          className="flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 w-10 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {cuisines.length >= 5 && (
        <p className="text-sm text-destructive mt-2">Max 5 cuisines. Remove one to add another.</p>
      )}

      {cuisines.length >= 3 && cuisines.length < 5 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            3+ cuisines may increase your grocery list. Stick to 1–2 for the most budget-friendly plan — unless you already have pantry staples at home!
          </p>
        </div>
      )}
    </section>
  );
};

export default CuisineSelector;
