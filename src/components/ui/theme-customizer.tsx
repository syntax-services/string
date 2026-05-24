import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Pipette } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Palette = "blue" | "mono" | "rose" | "emerald" | "sunset" | "amber" | "custom";

/** Preset palette definitions — each maps to a CSS `[data-palette]` block in index.css */
const PRESETS: { value: Palette; label: string; swatch: string }[] = [
  { value: "blue",    label: "Blue",    swatch: "#2563EB" },
  { value: "mono",    label: "Mono",    swatch: "#525252" },
  { value: "rose",    label: "Rose",    swatch: "#D08F8F" },
  { value: "emerald", label: "Emerald", swatch: "#95BF47" },
  { value: "sunset",  label: "Sunset",  swatch: "#F68B1E" },
  { value: "amber",   label: "Amber",   swatch: "#FF9900" },
];

import { applyPalette, injectCustomStyle } from "@/lib/theme";

// ── Component ────────────────────────────────────────────────────────────────

export function ThemeCustomizer() {
  const { user, profile } = useAuth();
  const [current, setCurrent] = useState<Palette>("blue");
  const [customHex, setCustomHex] = useState(() => localStorage.getItem("custom_theme_hex") || "#6D5ACD");
  const [showPicker, setShowPicker] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync from profile on mount
  useEffect(() => {
    if (profile?.theme_palette) {
      const p = profile.theme_palette as Palette;
      setCurrent(p);
      if (p === "custom") {
        const stored = localStorage.getItem("custom_theme_hex");
        if (stored) {
          setCustomHex(stored);
          injectCustomStyle(stored);
        }
        setShowPicker(true);
      }
    } else {
      const stored = localStorage.getItem("palette") as Palette | null;
      setCurrent(stored || "blue");
    }
  }, [profile?.theme_palette]);

  /** Apply a palette selection (preset or custom) */
  const select = useCallback(async (palette: Palette, hex?: string) => {
    setCurrent(palette);
    localStorage.setItem("palette", palette);
    applyPalette(palette);

    if (palette === "custom" && hex) {
      injectCustomStyle(hex);
      localStorage.setItem("custom_theme_hex", hex);
    }

    if (user?.id) {
      try {
        await supabase
          .from("profiles")
          .update({ theme_palette: palette })
          .eq("user_id", user.id);
      } catch (err) {
        console.warn("Failed to sync palette:", err);
      }
    }
  }, [user?.id]);

  /** Debounced handler for the color input so we don't spam Supabase */
  const onCustomColorChange = useCallback((hex: string) => {
    setCustomHex(hex);
    injectCustomStyle(hex);
    localStorage.setItem("custom_theme_hex", hex);
    applyPalette("custom");
    setCurrent("custom");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      select("custom", hex);
    }, 500);
  }, [select]);

  return (
    <div className="space-y-4">
      {/* ── Preset Grid ── */}
      <div className="flex flex-wrap gap-3">
        {PRESETS.map((p) => {
          const isActive = current === p.value;
          return (
            <button
              key={p.value}
              type="button"
              aria-label={`Select ${p.label} theme`}
              onClick={() => {
                setShowPicker(false);
                select(p.value);
              }}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
            >
              {/* Swatch circle */}
              <div
                className={cn(
                  "relative h-9 w-9 rounded-full transition-all duration-200",
                  "ring-offset-background",
                  isActive
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : "ring-1 ring-border hover:ring-muted-foreground/50 hover:scale-105"
                )}
                style={{ backgroundColor: p.swatch }}
              >
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className="h-4 w-4 drop-shadow-md"
                      style={{ color: p.value === "amber" ? "#000" : "#fff" }}
                    />
                  </div>
                )}
              </div>
              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {p.label}
              </span>
            </button>
          );
        })}

        {/* ── Custom Swatch ── */}
        <button
          type="button"
          aria-label="Custom theme color"
          onClick={() => {
            setShowPicker((v) => !v);
            if (current !== "custom") {
              select("custom", customHex);
            }
          }}
          className="group flex flex-col items-center gap-1.5 focus:outline-none"
        >
          <div
            className={cn(
              "relative h-9 w-9 rounded-full transition-all duration-200 flex items-center justify-center",
              "ring-offset-background",
              current === "custom"
                ? "ring-2 ring-offset-2 ring-primary scale-110"
                : "ring-1 ring-border hover:ring-muted-foreground/50 hover:scale-105"
            )}
            style={{
              background: current === "custom"
                ? customHex
                : `conic-gradient(from 0deg, #f44, #f90, #ff0, #3c3, #09f, #93f, #f44)`,
            }}
          >
            {current !== "custom" && (
              <Pipette className="h-3.5 w-3.5 text-white drop-shadow-md" />
            )}
            {current === "custom" && (
              <Check
                className="h-4 w-4 drop-shadow-md"
                style={{ color: "#fff" }}
              />
            )}
          </div>
          <span
            className={cn(
              "text-[10px] font-medium tracking-wide transition-colors",
              current === "custom" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Custom
          </span>
        </button>
      </div>

      {/* ── Custom Color Picker (expanded) ── */}
      {showPicker && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={customHex}
              onChange={(e) => onCustomColorChange(e.target.value)}
              className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
            />
            <div
              className="h-8 w-8 rounded-lg ring-1 ring-border shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: customHex }}
            />
          </label>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">Pick any color</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {customHex.toUpperCase()} · tap the swatch to change
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
