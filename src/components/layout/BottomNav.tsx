import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  PremiumHome,
  PremiumDiscover,
  PremiumPlus,
  PremiumMessage,
  PremiumUser,
} from "@/components/ui/custom-icons";
import { Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const customerNavItems = [
  { href: "/customer", label: "Home", icon: PremiumHome },
  { href: "/customer/discover", label: "Discover", icon: PremiumDiscover },
  { href: "/customer/messages", label: "Inbox", icon: PremiumMessage },
  { href: "/customer/profile", label: "Profile", icon: PremiumUser },
];

export const businessNavItems = [
  { href: "/business", label: "Home", icon: PremiumHome },
  { href: "/business/discover", label: "Discover", icon: PremiumDiscover },
  { href: "/business/messages", label: "Inbox", icon: PremiumMessage },
  { href: "/business/profile", label: "Profile", icon: PremiumUser },
];

export const adminNavItems = [
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/string-admin", label: "Control", icon: Settings },
];

interface BottomNavProps {
  isVisible?: boolean;
}

export function BottomNav({ isVisible = true }: BottomNavProps) {
  const { resolvedUserType } = useAuth();
  const location = useLocation();

  const navItems =
    resolvedUserType === "admin"
      ? adminNavItems
      : resolvedUserType === "business"
        ? businessNavItems
        : customerNavItems;

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl safe-area-bottom transition-transform duration-300 shadow-lg shadow-black/5",
        !isVisible && "translate-y-full"
      )}
    >
      <div className="flex items-center justify-around h-[4.75rem] px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon as React.ComponentType<{ className?: string; active?: boolean }>;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 flex-1 py-2 px-1 transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 transition-transform duration-200",
                isActive && "scale-105"
              )} active={isActive} />
              <span className={cn(
                "text-[10px] font-bold tracking-wide transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
