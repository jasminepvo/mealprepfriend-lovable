import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface RegenerationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: () => void;
  onKeep: () => void;
}

const RegenerationSheet = ({ open, onOpenChange, onRegenerate, onKeep }: RegenerationSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-8 pt-6">
        <SheetHeader className="items-center text-center">
          <span className="text-4xl mb-2">✨</span>
          <SheetTitle className="text-xl">Your goals have changed</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
            Your current meal plan was made for your old goals. Want to generate a new one that matches?
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <button
            onClick={onRegenerate}
            className="w-full rounded-lg bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
          >
            Regenerate My Plan ✨
          </button>
          <button
            onClick={onKeep}
            className="w-full rounded-lg border-2 border-border px-4 py-3.5 text-base font-semibold text-foreground active:scale-[0.98] transition-transform"
          >
            Keep Current Plan
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          You can always regenerate later from the Meals screen.
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default RegenerationSheet;
