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
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center p-4", className)}>
      <style>{`
        @keyframes leftRingMove {
          0% {
            transform: translateX(-35px) scale(0.85);
            opacity: 0.4;
          }
          45%, 55% {
            transform: translateX(-12px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-35px) scale(0.85);
            opacity: 0.4;
          }
        }
        @keyframes rightRingMove {
          0% {
            transform: translateX(35px) scale(0.85);
            opacity: 0.4;
          }
          45%, 55% {
            transform: translateX(12px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(35px) scale(0.85);
            opacity: 0.4;
          }
        }
        @keyframes centerStringPulse {
          0%, 35% {
            width: 0px;
            opacity: 0;
          }
          45%, 55% {
            width: 24px;
            opacity: 1;
          }
          65%, 100% {
            width: 0px;
            opacity: 0;
          }
        }
      `}</style>
      <div className="relative flex items-center justify-center h-16 w-36">
        {/* Left germinating ring */}
        <div 
          className="absolute h-10 w-10 rounded-full border-[3px] border-primary"
          style={{ animation: "leftRingMove 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite" }}
        />
        {/* Right germinating ring */}
        <div 
          className="absolute h-10 w-10 rounded-full border-[3px] border-primary"
          style={{ animation: "rightRingMove 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite" }}
        />
        {/* Connecting String/Bridge */}
        <div 
          className="absolute h-[3px] bg-primary rounded-full"
          style={{ animation: "centerStringPulse 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite" }}
        />
      </div>
      {label && (
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground animate-pulse mt-1">
          {label}
        </p>
      )}
    </div>
  );
}
