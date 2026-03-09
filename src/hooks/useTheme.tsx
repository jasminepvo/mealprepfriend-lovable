import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Theme = "light" | "dark";

const getStoredTheme = (): Theme => {
  try {
    return (localStorage.getItem("theme") as Theme) || "light";
  } catch {
    return "light";
  }
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

// Apply immediately on load to prevent flash
applyTheme(getStoredTheme());

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const { user } = useAuth();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
    if (user) {
      supabase
        .from("profiles")
        .update({ theme_preference: t } as any)
        .eq("id", user.id)
        .then();
    }
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Load from DB on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("theme_preference")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.theme_preference && data.theme_preference !== theme) {
          setThemeState(data.theme_preference as Theme);
          localStorage.setItem("theme", data.theme_preference as string);
          applyTheme(data.theme_preference as Theme);
        }
      });
  }, [user]);

  return { theme, setTheme, toggleTheme };
};
