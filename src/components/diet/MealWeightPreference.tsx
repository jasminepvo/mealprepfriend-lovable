type MealWeight = "morning" | "midday" | "evening";

const options: Array<{ value: MealWeight; emoji: string; label: string }> = [
  { value: "morning", emoji: "🌅", label: "Morning" },
  { value: "midday", emoji: "☀️", label: "Midday" },
  { value: "evening", emoji: "🌙", label: "Evening" },
];

interface Props {
  value: MealWeight;
  onChange: (v: MealWeight) => void;
}

const MealWeightPreference = ({ value, onChange }: Props) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-1 font-sans">Where do you prefer your biggest meal?</h2>
    <p className="text-sm text-muted-foreground mb-3">We'll make your other meals lighter to balance your daily calories.</p>
    <div className="grid grid-cols-3 gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-col items-center justify-center rounded-lg border-2 px-3 py-4 transition-all min-h-[72px] ${
            value === opt.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <span className="text-2xl mb-1">{opt.emoji}</span>
          <span className="text-sm font-medium text-foreground">{opt.label}</span>
          {value === opt.value && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground mt-1">✓</span>}
        </button>
      ))}
    </div>
  </section>
);

export default MealWeightPreference;
