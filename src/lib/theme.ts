/**
 * Theme and Palette dynamic application helper
 */

export type Palette = "blue" | "mono" | "rose" | "emerald" | "sunset" | "amber" | "custom";

export function hexToHsl(hex: string): [number, number, number] {
  // Normalize shorthand hex (e.g. #03F -> #0033FF)
  let cleaned = hex.replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map(char => char + char).join("");
  }
  
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function buildCustomPaletteCSS(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  const fg = l > 60 ? "0 0% 0%" : "0 0% 100%";

  return `
    [data-palette="custom"] {
      --primary: ${h} ${Math.min(s, 60)}% ${Math.min(Math.max(l, 40), 58)}%;
      --primary-foreground: ${fg};
      --ring: ${h} ${Math.min(s, 60)}% ${Math.min(Math.max(l, 40), 58)}%;
      --info: ${h} ${Math.min(s, 60)}% ${Math.min(Math.max(l, 40), 58)}%;
      --info-foreground: ${fg};
      --sidebar-primary: ${h} ${Math.min(s, 60)}% ${Math.min(Math.max(l, 40), 58)}%;
      --sidebar-primary-foreground: ${fg};
      --sidebar-ring: ${h} ${Math.min(s, 60)}% ${Math.min(Math.max(l, 40), 58)}%;
    }
    [data-palette="custom"].dark {
      --primary: ${h} ${Math.min(s, 55)}% ${Math.min(Math.max(l, 48), 65)}%;
      --primary-foreground: ${fg};
      --ring: ${h} ${Math.min(s, 55)}% ${Math.min(Math.max(l, 48), 65)}%;
      --info: ${h} ${Math.min(s, 55)}% ${Math.min(Math.max(l, 48), 65)}%;
      --info-foreground: ${fg};
      --sidebar-primary: ${h} ${Math.min(s, 55)}% ${Math.min(Math.max(l, 48), 65)}%;
      --sidebar-primary-foreground: ${fg};
      --sidebar-ring: ${h} ${Math.min(s, 55)}% ${Math.min(Math.max(l, 48), 65)}%;
    }
  `;
}

export function injectCustomStyle(hex: string) {
  let el = document.getElementById("__spa_custom_palette");
  if (!el) {
    el = document.createElement("style");
    el.id = "__spa_custom_palette";
    document.head.appendChild(el);
  }
  el.textContent = buildCustomPaletteCSS(hex);
}

export function applyPalette(palette: string) {
  document.documentElement.setAttribute("data-palette", palette);
  if (palette === "custom") {
    const stored = localStorage.getItem("custom_theme_hex") || "#6D5ACD";
    injectCustomStyle(stored);
  }
}
