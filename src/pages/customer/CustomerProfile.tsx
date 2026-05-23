import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomer } from "@/hooks/useCustomer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  PremiumUser,
  PremiumHome,
  PremiumPlus,
  PremiumBriefcase,
  PremiumStar,
  PremiumPackage,
  PremiumSettings,
  PremiumSupport,
  PremiumHeart,
} from "@/components/ui/custom-icons";
import {
  MapPin,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export default function CustomerProfile() {
  const { profile, signOut } = useAuth();
  const { data: customer } = useCustomer();

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["customer-stats", customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;

      const [ordersRes, jobsRes, reviewsRes, savedRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_id", customer.id),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("customer_id", customer.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("reviewer_id", customer.id),
        supabase.from("saved_businesses").select("id", { count: "exact", head: true }).eq("customer_id", customer.id),
      ]);

      return {
        orders: ordersRes.count || 0,
        jobs: jobsRes.count || 0,
        reviews: reviewsRes.count || 0,
        saved: savedRes.count || 0,
      };
    },
    enabled: !!customer?.id,
  });

  const mainMenuList = [
    { icon: PremiumPackage, label: "My Orders", href: "/customer/orders", count: stats?.orders },
    { icon: PremiumBriefcase, label: "My Jobs", href: "/customer/jobs", count: stats?.jobs },
    { icon: PremiumHeart, label: "Saved", href: "/customer/saved", count: stats?.saved },
    { icon: PremiumStar, label: "My Reviews", href: "/customer/engagement", count: stats?.reviews },
  ];

  const secondaryMenuList = [
    { icon: PremiumSettings, label: "Account Settings", href: "/customer/settings" },
    { icon: PremiumSupport, label: "Help & Support", href: "/contact" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 pb-10">
        
        {/* Profile Header Block */}
        <div className="flex flex-col items-center text-center mt-6 space-y-4">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-indigo-500 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
            <div className="relative h-32 w-32 rounded-full border-4 border-background bg-card flex items-center justify-center overflow-hidden shadow-2xl">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="bg-primary/5 h-full w-full flex items-center justify-center">
                  <PremiumUser className="h-16 w-16 text-primary" active />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-medium tracking-tight text-foreground flex items-center justify-center gap-1.5">
              {profile?.full_name || "User Profile"}
              {customer?.location_verified && (
                <Badge variant="default" className="bg-primary hover:bg-primary px-1.5 py-0.5 rounded-full scale-90">
                  <MapPin className="h-3 w-3 mr-0.5" />
                  Verified
                </Badge>
              )}
            </h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {profile?.user_type || "Customer"}
            </p>
          </div>
        </div>

        {/* Floating Card Container 1 (Main Actions) */}
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
          <div className="divide-y divide-border/30">
            {mainMenuList.map((item, idx) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between px-5 py-4 hover:bg-primary/[0.02] active:bg-primary/[0.04] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-2xl bg-muted/65 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <item.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-foreground/80 group-hover:text-foreground text-sm tracking-wide transition-colors duration-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Floating Card Container 2 (Secondary Actions) */}
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
          <div className="divide-y divide-border/30">
            {secondaryMenuList.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between px-5 py-4 hover:bg-primary/[0.02] active:bg-primary/[0.04] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-2xl bg-muted/65 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <item.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-foreground/80 group-hover:text-foreground text-sm tracking-wide transition-colors duration-300">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            ))}

            {/* Theme Row */}
            <div className="flex items-center justify-between px-5 py-4 hover:bg-primary/[0.02] transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-2xl bg-muted/65 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground/80 text-sm tracking-wide">Dark Theme</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Log Out */}
            <button
              onClick={signOut}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-destructive/[0.02] active:bg-destructive/[0.04] transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-2xl bg-muted/65 flex items-center justify-center group-hover:bg-destructive/10 transition-all duration-300">
                  <LogOut className="h-4.5 w-4.5 text-muted-foreground group-hover:text-destructive transition-colors duration-300" />
                </div>
                <span className="font-medium text-foreground/80 group-hover:text-destructive text-sm tracking-wide transition-colors duration-300">Log Out</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-80">
          Joined {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "—"}
        </p>
      </div>
    </DashboardLayout>
  );
}