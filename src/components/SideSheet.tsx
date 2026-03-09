import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";

interface SideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  email: string;
}

const navItems = [
  { emoji: "👤", label: "My Profile", path: "/profile/account" },
  { emoji: "🎯", label: "My Goals", path: "/profile/goals" },
  { emoji: "🥗", label: "Diet & Nutrition", path: "/profile/diet" },
  { emoji: "⚙️", label: "Account Settings", path: "/profile/about" },
];

const SideSheet = ({ open, onOpenChange, displayName, email }: SideSheetProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const firstName = displayName.split(" ")[0] || "there";
  const initial = firstName.charAt(0).toUpperCase();

  const handleNav = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const handleLogout = () => {
    onOpenChange(false);
    signOut();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[80%] sm:max-w-sm p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <SheetTitle className="text-lg font-bold text-foreground">{displayName || "User"}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="border-t border-border" />

        <nav className="py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="flex-1 text-base font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </nav>

        <div className="border-t border-border" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="text-xl">→</span>
          <span className="text-base font-medium text-destructive">Log out</span>
        </button>
      </SheetContent>
    </Sheet>
  );
};

export default SideSheet;
