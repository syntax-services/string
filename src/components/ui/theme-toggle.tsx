import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = stored === "dark" || (!stored && prefersDark);
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const toggle = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    const themeStr = newValue ? "dark" : "light";
    localStorage.setItem("theme", themeStr);
    document.documentElement.classList.toggle("dark", newValue);

    if (user?.id) {
      try {
        await supabase
          .from("profiles")
          .update({ theme_mode: themeStr })
          .eq("user_id", user.id);
      } catch (err) {
        console.warn("Failed to sync theme to database:", err);
      }
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9">
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
