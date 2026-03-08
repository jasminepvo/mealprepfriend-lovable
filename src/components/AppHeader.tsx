import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else {
        // Fallback to email local part
        setDisplayName(user.email?.split("@")[0] ?? "");
      }
    };

    fetchProfile();
  }, [user]);

  const firstName = displayName.split(" ")[0] || "there";
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-card border-b border-border px-6 py-3">
      <span className="text-lg font-bold text-foreground font-sans">
        🥗 MealPrepFriend
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <span className="text-sm">👋 Hi, {firstName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AppHeader;
