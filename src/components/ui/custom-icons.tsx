import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  active?: boolean;
}

// ============================================================================
// BRANDED "STRING" COBALT CRESCENT VECTOR ICON SUITE
// Inspired by Google Gemini's "Neural Expression" & Apple's ultra-thin aesthetics.
//
// DESIGN PRINCIPLES:
// 1. Ultra-Thin Line Weight: strokeWidth={1.25} for airy, luxury feel.
// 2. Custom Brand Motif: Every icon embeds String's signature crescent-eclipse
//    double-ring design language inside its geometry, making them 100% custom.
// 3. Neural Active States: Activated items stay elegant and thin (strokeWidth={1.65})
//    and render a tiny, razor-sharp active signal indicator, avoiding generic solid fills.
// ============================================================================

export const PremiumHome = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 transition-all duration-300", className)}
    {...props}
  >
    {/* Clean geometric A-frame house */}
    <path d="M3 10.5L12 3l9 7.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 20V10.5z" />
    
    {/* Custom Branded Double-Ring Crescent Window cutout in the center of the house */}
    <circle cx="12" cy="12" r="2.5" />
    <path d="M14.5 12a2.5 2.5 0 0 1-1.5 2.3" opacity={0.8} />

    {/* Neural Active Signal Dot */}
    {active && (
      <circle cx="12" cy="18.5" r="0.75" fill="currentColor" stroke="none" />
    )}
  </svg>
);

export const PremiumDiscover = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 transition-all duration-300", className)}
    {...props}
  >
    {/* Branded String Double-Ring Crescent Magnifying Glass */}
    {/* Left larger circle of magnifying glass lens */}
    <circle cx="10" cy="10" r="5.5" />
    {/* Intersecting right smaller eclipse circle representing String brand */}
    <path d="M14.5 10a4 4 0 0 1-2.5 3.7" opacity={active ? 1 : 0.8} />
    
    {/* Minimalist thin handle */}
    <line x1="21" y1="21" x2="14" y2="14" />

    {/* Neural Active Signal Dot */}
    {active && (
      <circle cx="10" cy="10" r="0.75" fill="currentColor" stroke="none" />
    )}
  </svg>
);

export const PremiumPlus = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 transition-all duration-300", className)}
    {...props}
  >
    {/* Branded Double-Ring Crescent Border Frame */}
    <circle cx="12" cy="12" r="9.5" />
    <path d="M19 12a7 7 0 0 1-4.5 6.5" opacity={0.7} />
    
    {/* Thin linear plus coordinates */}
    <line x1="12" y1="8.5" x2="12" y2="15.5" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
  </svg>
);

export const PremiumMessage = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 transition-all duration-300", className)}
    {...props}
  >
    {/* Branded Folder/Inbox tray outer curve */}
    <path d="M21 11.5v6.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-6.5" />
    
    {/* Custom Intersecting crescent arc center index handler slot */}
    <path d="M3 11.5h5c.5 0 .8.2 1.1.5.8 1.1 1.8 1.8 2.9 1.8s2.1-.7 2.9-1.8c.3-.3.6-.5 1.1-.5h5" />
    
    {/* Incoming message slot outlines */}
    <path d="M6 7.5h12" />
    <path d="M9 4.5h6" opacity={0.7} />

    {/* Neural Active Signal Dot */}
    {active && (
      <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
    )}
  </svg>
);

export const PremiumUser = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 transition-all duration-300", className)}
    {...props}
  >
    {/* Thin head circle */}
    <circle cx="12" cy="7.5" r="3.75" />
    
    {/* Shifting shoulders drawn as a beautiful intersecting crescent eclipse curve */}
    <path d="M5 21a7 7 0 0 1 14 0" />
    <path d="M7 21a5 5 0 0 1 10 0" opacity={0.6} />

    {/* Neural Active Signal Dot */}
    {active && (
      <circle cx="12" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
    )}
  </svg>
);

// ==========================================
// FEED ENGAGEMENT SOCIAL ICONS
// ==========================================

export const PremiumHeart = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={active ? "hsl(var(--destructive))" : "none"}
    stroke={active ? "hsl(var(--destructive))" : "currentColor"}
    strokeWidth={active ? 1.6 : 1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-transform duration-200 active:scale-125 cursor-pointer", className)}
    {...props}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const PremiumChatBubble = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-transform duration-200 hover:scale-105 cursor-pointer", className)}
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
  </svg>
);

export const PremiumBookmark = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-transform duration-200 active:scale-125 cursor-pointer", className)}
    {...props}
  >
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
  </svg>
);

// ==========================================
// REQUEST TYPE ICONS FOR "CREATE A REQUEST"
// ==========================================

export const RequestProductIcon = ({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 text-foreground", className)}
    {...props}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export const RequestServiceIcon = ({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 text-foreground", className)}
    {...props}
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const RequestEmploymentIcon = ({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 text-foreground", className)}
    {...props}
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const RequestCollaborationIcon = ({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 text-foreground", className)}
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const PremiumBriefcase = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <circle cx="12" cy="14" r="2" />
    <path d="M14 14a2 2 0 0 1-1 1.7" opacity={0.8} />
  </svg>
);

export const PremiumStar = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    <path d="M12 7a3 3 0 0 1 2.5 2.5" opacity={0.8} />
  </svg>
);

export const PremiumPackage = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
    <circle cx="12" cy="17" r="1.5" />
  </svg>
);

export const PremiumSettings = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M14 12a2 2 0 0 1-1 1.7" opacity={0.8} fill="none" />
  </svg>
);

export const PremiumWrench = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    <circle cx="7.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const PremiumChart = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const PremiumClipboard = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <circle cx="12" cy="13" r="2" />
    <path d="M14 13a2 2 0 0 1-1 1.7" opacity={0.8} />
  </svg>
);

export const PremiumSupport = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-5 h-5 transition-all duration-300", className)}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2} />
  </svg>
);

export const PremiumStore = ({ className, active = false, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={active ? 1.65 : 1.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6 transition-all duration-300", className)}
    {...props}
  >
    {/* Storefront outer frame */}
    <path d="M3 21h18" />
    <path d="M4 21V10h16v11" />
    
    {/* Elegant store canopy/awning with scalloped curves */}
    <path d="M3 6h18v4H3z" />
    <path d="M3 10c1 0 1.5-.5 2-1s1-.5 2 0 1.5 1 2 1 1.5-.5 2-1 1-.5 2 0 1.5 1 2 1 1.5-.5 2-1 1-.5 2 0 1.5 1 2 1" />
    
    {/* Branded String Double-Ring Crescent Window in the center storefront */}
    <circle cx="12" cy="14.5" r="2.2" />
    <path d="M14.2 14.5a2.2 2.2 0 0 1-1.2 2.0" opacity={0.8} />

    {/* Minimalist door frame below */}
    <path d="M9 21v-4.5h6V21" />

    {/* Neural Active Signal Dot */}
    {active && (
      <circle cx="12" cy="19.5" r="0.75" fill="currentColor" stroke="none" />
    )}
  </svg>
);

