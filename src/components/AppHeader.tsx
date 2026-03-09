import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun } from "lucide-react";
import SideSheet from "@/components/SideSheet";

const AppHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else {
        setDisplayName(user.email?.split("@")[0] ?? "");
      }
    };

    fetchProfile();
  }, [user]);

  const firstName = displayName.split(" ")[0] || "there";
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card border-b border-border px-6 py-3">
        <button
          onClick={() => navigate("/meal-plan")}
          className="text-lg font-bold text-foreground font-sans hover:opacity-80 transition-opacity"
        >
          🥗 MealPrepFriend
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-foreground" />
            )}
          </button>

          <button
            onClick={() => setSheetOpen(true)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      <SideSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        displayName={displayName}
        email={email}
      />
    </>
  );
};

export default AppHeader;
