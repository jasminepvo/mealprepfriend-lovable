import { Switch } from "@/components/ui/switch";

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

const HealthySwapsToggle = ({ value, onChange }: Props) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-3 font-sans">Suggest healthier ingredient swaps?</h2>
    <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-5 py-4">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-base font-medium text-foreground">
          {value ? "✅ Yes — show me lighter alternatives" : "Skip swaps — keep traditional recipes"}
        </p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
    <p className="text-sm text-muted-foreground mt-2">
      When on, each recipe includes one optional swap tip, like using coconut aminos instead of soy sauce.
    </p>
  </section>
);

export default HealthySwapsToggle;
