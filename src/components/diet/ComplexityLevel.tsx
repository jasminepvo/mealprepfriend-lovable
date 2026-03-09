type Level = "super_simple" | "home_chef" | "master_chef";

const options: Array<{ value: Level; emoji: string; title: string; desc: string; example: string }> = [
  { value: "super_simple", emoji: "🥄", title: "Super Simple", desc: "3 ingredients or fewer. Just season and cook.", example: "Chicken + Sweet Potato + Olive Oil" },
  { value: "home_chef", emoji: "👨‍🍳", title: "Home Chef", desc: "5–8 ingredients. Flavorful and still easy.", example: "Lemongrass Chicken with Fish Sauce & Bok Choy" },
  { value: "master_chef", emoji: "🔪", title: "Master Chef", desc: "8+ ingredients. Bold, layered, restaurant-level flavor.", example: "Herb-Crusted Salmon with Roasted Veg & Garlic Aioli" },
];

interface Props {
  value: Level;
  onChange: (v: Level) => void;
}

const ComplexityLevel = ({ value, onChange }: Props) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">How complex do you want your recipes?</h2>
    <div className="space-y-3">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-full flex items-start gap-4 rounded-lg border-2 px-5 py-4 text-left transition-colors min-h-[72px] ${
            value === opt.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <span className="text-2xl mt-0.5">{opt.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">{opt.title}</span>
              {value === opt.value && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">✓</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
            <p className="text-xs text-muted-foreground/70 mt-1 italic">e.g. "{opt.example}"</p>
          </div>
        </button>
      ))}
    </div>
  </section>
);

export default ComplexityLevel;
