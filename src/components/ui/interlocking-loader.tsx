import React from "react";
import { cn } from "@/lib/utils";

interface InterlockingLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeConfig = {
  sm: "h-8 w-8",
  md: "h-14 w-14",
  lg: "h-24 w-24",
};

export function InterlockingLoader({
  className,
  size = "md",
  label = "Loading String Secure Platform...",
}: InterlockingLoaderProps) {
  const sizeClass = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center p-4", className)}>
      <div className={cn("relative flex items-center justify-center", sizeClass)}>
        {/* Interlocking ring 1: Outer spinner */}
        <div className="absolute inset-0 rounded-full border-[3.5px] border-primary/10 border-t-primary animate-spin" />
        
        {/* Interlocking ring 2: Inner counter-rotating brand loop */}
        <div className="absolute inset-1.5 rounded-full border-[2.5px] border-transparent border-b-primary/60 border-l-primary/60 animate-[spin_1.2s_linear_infinite_reverse]" />
        
        {/* Center brand dot */}
        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-md shadow-primary/20" />
      </div>
      {label && (
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground animate-pulse mt-1">
          {label}
        </p>
      )}
    </div>
  );
}
