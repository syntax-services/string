import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness, useBusinessProducts, useBusinessServices } from "@/hooks/useBusiness";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VerificationBadge } from "@/components/business/VerificationBadge";
import { BusinessEarningsCard } from "@/components/business/BusinessEarningsCard";
import {
  PremiumClipboard,
  PremiumPackage,
  PremiumWrench,
  PremiumStar,
  PremiumChart,
  PremiumSettings,
} from "@/components/ui/custom-icons";
import {
  Building2,
  MapPin,
  ChevronRight,
  LogOut,
  Wallet,
} from "lucide-react";
import { format } from "date-fns";

export default function BusinessProfile() {
  const { profile, signOut } = useAuth();
  const { data: business } = useBusiness();
  const { data: products = [] } = useBusinessProducts(business?.id);
  const { data: services = [] } = useBusinessServices(business?.id);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["business-stats", business?.id],
    queryFn: async () => {
      if (!business?.id) return null;

      const [ordersRes, jobsRes, reviewsRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("business_id", business.id),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("business_id", business.id),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", business.id),
      ]);

      return {
        orders: ordersRes.count || 0,
        jobs: jobsRes.count || 0,
        reviews: reviewsRes.count || 0,
      };
    },
    enabled: !!business?.id,
  });

  const menuItems = [
    { icon: PremiumClipboard, label: "Orders", href: "/business/orders", count: stats?.orders },
    { icon: PremiumPackage, label: "Products", href: "/business/products", count: products.length },
    { icon: PremiumWrench, label: "Services", href: "/business/services", count: services.length },
    { icon: PremiumStar, label: "Reviews", href: "/business/reviews", count: stats?.reviews },
    { icon: PremiumChart, label: "Analytics", href: "/business/analytics" },
    { icon: PremiumSettings, label: "Settings", href: "/business/settings" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 pb-10">
        
        {/* Profile Header Block */}
        <div className="flex flex-col items-center text-center mt-6 space-y-4">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-indigo-500 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
            <div className="relative h-32 w-32 rounded-full border-4 border-background bg-card flex items-center justify-center overflow-hidden shadow-2xl">
              {business?.cover_image_url ? (
                <img
                  src={business.cover_image_url}
                  alt={business.company_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="bg-primary/5 h-full w-full flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-primary" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-medium tracking-tight text-foreground flex items-center justify-center gap-1.5">
              {business?.company_name || "Business Profile"}
              <VerificationBadge 
                tier={(business?.verification_tier as "none" | "verified" | "premium") || "none"} 
                size="sm"
              />
            </h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {profile?.email}
            </p>
            {business?.location_verified && (
              <div className="flex justify-center pt-1">
                <Badge variant="secondary" className="px-2 py-0.5 rounded-full scale-90">
                  <MapPin className="h-3 w-3 mr-1" />
                  Location Verified
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid Container */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl border border-border/40 p-4 text-center shadow-md">
            <p className="text-lg font-medium text-foreground">{stats?.orders || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Orders</p>
          </div>
          <div className="bg-card rounded-2xl border border-border/40 p-4 text-center shadow-md">
            <p className="text-lg font-medium text-foreground">{stats?.jobs || 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Jobs</p>
          </div>
          <div className="bg-card rounded-2xl border border-border/40 p-4 text-center shadow-md">
            <p className="text-lg font-medium text-foreground">{business?.reputation_score?.toFixed(1) || "—"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Rating</p>
          </div>
        </div>

        {/* Earnings Card */}
        {business && <BusinessEarningsCard businessId={business.id} />}

        {/* Floating Card Container 1 (Main Menu) */}
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
          <div className="divide-y divide-border/30">
            {menuItems.map((item, idx) => (
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

        {/* Theme Settings Container */}
        <div className="bg-card rounded-3xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden">
          <div className="divide-y divide-border/30">
            <div className="flex items-center justify-between px-5 py-4 hover:bg-primary/[0.02] transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-2xl bg-muted/65 flex items-center justify-center">
                  <Building2 className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground/80 text-sm tracking-wide">Dark Theme</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 border-border/40 hover:bg-destructive/5 hover:text-destructive transition-all duration-300 text-sm font-medium tracking-wide active:scale-95"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-80">
          Joined {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "—"}
        </p>
      </div>
    </DashboardLayout>
  );
}