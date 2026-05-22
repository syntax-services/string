import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Palette = "blue" | "mono";

const palettes: { value: Palette; label: string; description: string; colors: string[] }[] = [
  {
    value: "blue",
    label: "Marketplace Blue",
    description: "Modern blue theme — clean and professional",
    colors: ["#2563EB", "#3B82F6", "#EFF6FF", "#1E293B"],
  },
  {
    value: "mono",
    label: "Classic Monochrome",
    description: "Minimal black, white & grey palette",
    colors: ["#171717", "#737373", "#F5F5F5", "#FFFFFF"],
  },
];

export function ThemeCustomizer() {
  const [current, setCurrent] = useState<Palette>("blue");

  useEffect(() => {
    const stored = localStorage.getItem("palette") as Palette | null;
    setCurrent(stored || "blue");
  }, []);

  const select = (palette: Palette) => {
    setCurrent(palette);
    localStorage.setItem("palette", palette);
    document.documentElement.setAttribute("data-palette", palette);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {palettes.map((p) => {
        const isActive = current === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => select(p.value)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-muted-foreground/40"
            )}
          >
            {/* Color swatches */}
            <div className="flex gap-1.5">
              {p.colors.map((color, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border border-border/40"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div>
              <p className="font-medium text-sm text-foreground">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>

            {isActive && (
              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
