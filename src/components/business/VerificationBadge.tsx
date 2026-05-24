import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

// ============================================================================
// UNIQUE BRANDED "STRING" VECTOR BADGE MOTIFS
// ============================================================================

// Free Verified Badge: Concentric double-ring custom squircle with a woven string checkmark (Teal-Indigo theme)
export const StringVerifiedIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Outer squircle grid frame representing verified street coordinate grids */}
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" strokeWidth={1.5} opacity={0.6} />
    {/* Concentric inner brand weave loop */}
    <path d="M12 5.5a6.5 6.5 0 0 0-6.5 6.5" strokeWidth={1} strokeDasharray="2 1.5" opacity={0.8} />
    <path d="M12 18.5a6.5 6.5 0 0 0 6.5-6.5" strokeWidth={1} strokeDasharray="2 1.5" opacity={0.8} />
    {/* Concentric double-ring thread helix wrapping checkmark */}
    <path d="M7 12.5a5 5 0 0 0 5 5" strokeWidth={1.25} opacity={0.7} />
    {/* Woven checkmark that merges into a double-helix loop */}
    <path d="M8.5 12.5l2.25 2.25 5.5-6" strokeWidth={2.5} strokeLinejoin="miter" />
  </svg>
);

// Paid Premium Booster Badge: Starburst eclipse double-ring celestial brand insignia (Gold-Orange gradient)
export const StringPremiumIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Celestial overlapping stars rotating to form a 12-point radiant insignia */}
    <path d="M12 2l2.25 4.5H19l-3.5 3 1.5 5-5-3.5-5 3.5 1.5-5-3.5-3h4.75L12 2Z" fill="currentColor" fillOpacity={0.08} />
    <path d="M12 2l2.25 4.5H19l-3.5 3 1.5 5-5-3.5-5 3.5 1.5-5-3.5-3h4.75L12 2Z" strokeWidth={1.5} />
    {/* Overlapping rotated geometric booster square for dynamic active radiance */}
    <rect x="5.5" y="5.5" width="13" height="13" rx="2" transform="rotate(45 12 12)" strokeWidth={0.75} strokeDasharray="3 2" opacity={0.6} />
    {/* Intersecting horizontal matching grid thread */}
    <path d="M2 12h20M12 2v20" strokeWidth={0.5} opacity={0.3} />
    {/* Concentric central target rings for smart match prioritization */}
    <circle cx="12" cy="12" r="3.5" strokeWidth={1} fill="currentColor" fillOpacity={0.15} />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

type VerificationTier = "none" | "verified" | "premium";

interface VerificationBadgeProps {
  tier: VerificationTier;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const tierConfig: Record<VerificationTier, {
  label: string;
  icon: typeof StringVerifiedIcon;
  variant: "default" | "secondary" | "outline";
  className: string;
}> = {
  none: {
    label: "Unverified",
    icon: ({ className }) => (
      <span className={cn("text-xs text-muted-foreground mr-1", className)}>•</span>
    ),
    variant: "outline",
    className: "text-muted-foreground border-muted/50",
  },
  verified: {
    label: "Verified Location",
    icon: StringVerifiedIcon,
    variant: "secondary",
    className: "bg-primary/5 text-primary border-primary/20",
  },
  premium: {
    label: "String Premium Boosted",
    icon: StringPremiumIcon,
    variant: "default",
    className: "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-0 shadow-sm shadow-orange-500/10 animate-fade-in",
  },
};

const sizeConfig = {
  sm: { icon: "h-3.5 w-3.5", text: "text-[9px] font-bold uppercase tracking-wider", padding: "px-2 py-0.5 rounded-full" },
  md: { icon: "h-4 w-4", text: "text-[10px] font-bold uppercase tracking-widest", padding: "px-2.5 py-1 rounded-full" },
  lg: { icon: "h-5 w-5", text: "text-xs font-bold uppercase tracking-widest", padding: "px-3.5 py-1.5 rounded-full" },
};

export function VerificationBadge({
  tier,
  className,
  showLabel = true,
  size = "md",
}: VerificationBadgeProps) {
  const config = tierConfig[tier] || tierConfig.none;
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  if (tier === "none" && !showLabel) {
    return null;
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5 font-medium shrink-0",
        sizeStyles.padding,
        sizeStyles.text,
        config.className,
        className
      )}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

// Just the icon for compact displays
export function VerificationIcon({
  tier,
  className,
  size = "md",
}: Omit<VerificationBadgeProps, "showLabel">) {
  const config = tierConfig[tier] || tierConfig.none;
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  if (tier === "none") {
    return null;
  }

  return (
    <Icon 
      className={cn(
        sizeStyles.icon,
        tier === "verified" && "text-primary",
        tier === "premium" && "text-orange-500",
        className
      )} 
    />
  );
}
