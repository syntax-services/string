import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useBusiness, 
  useBusinessStats, 
  useBusinessOrders, 
  useBusinessJobs 
} from "@/hooks/useBusiness";
import { 
  MessageSquare, Package, Briefcase, Star, DollarSign, 
  ArrowUpRight, Award, ShieldCheck, CheckCircle2, TrendingUp, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function BusinessOverview() {
  const { profile } = useAuth();
  const { data: business, isLoading: businessLoading } = useBusiness();
  const { data: stats, isLoading: statsLoading } = useBusinessStats(business?.id);
  const { data: orders = [], isLoading: ordersLoading } = useBusinessOrders(business?.id);
  const { data: jobs = [], isLoading: jobsLoading } = useBusinessJobs(business?.id);
  const navigate = useNavigate();

  // Fetch open leads count in the platform
  const { data: leadsCount = 0 } = useQuery({
    queryKey: ["open-leads-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      if (error) throw error;
      return count || 0;
    }
  });

  const isLoading = businessLoading || statsLoading || ordersLoading || jobsLoading;

  // 1. Calculate Daily Net Revenue for last 7 days
  const revenueData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = date.toISOString().split("T")[0];

    // Daily Orders Net Revenue
    const dayOrdersRevenue = orders
      .filter((o) => o.status === "delivered" && o.created_at.startsWith(dateStr))
      .reduce((sum, o) => sum + (Number(o.total || 0) - Number(o.commission_amount || 0) - Number(o.platform_fee || 0)), 0);

    // Daily Jobs Net Revenue
    const dayJobsRevenue = jobs
      .filter((j) => j.status === "completed" && j.created_at.startsWith(dateStr))
      .reduce((sum, j) => sum + (Number(j.final_price || 0) * 0.9), 0);

    return {
      day: dateString,
      revenue: Math.round(dayOrdersRevenue + dayJobsRevenue),
    };
  }).reverse();

  // 2. Build Live Activity Stream
  const activityStream = [
    ...orders.map((o) => ({
      id: o.id,
      type: "order",
      title: `Order Received`,
      description: `Order #${o.id.slice(0, 8)} • ₦${Number(o.total || 0).toLocaleString()}`,
      status: o.status,
      date: new Date(o.created_at),
    })),
    ...jobs.map((j) => ({
      id: j.id,
      type: "job",
      title: `Job ${j.status === "completed" ? "Completed" : "Requested"}`,
      description: j.services?.name || "Job Service Request",
      status: j.status,
      date: new Date(j.created_at),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())
   .slice(0, 4);

  // 3. Reputation & Growth center metrics
  const reputationScore = business?.reputation_score || 0;
  const verificationTier = business?.verification_tier || "none";
  const completedTotal = (stats?.completedOrders || 0) + (stats?.completedJobs || 0);
  const nextTarget = 10;
  const progressPercent = Math.min((completedTotal / nextTarget) * 100, 100);

  let repTier = "New Partner";
  if (reputationScore >= 4.5) repTier = "Elite Top Trader 🌟";
  else if (reputationScore >= 4.0) repTier = "Highly Recommended 👍";
  else if (reputationScore > 0) repTier = "Rising Star 🚀";

  const statCards = [
    { 
      label: "Pending Orders", 
      value: stats?.pendingOrders || 0, 
      icon: Package, 
      onClick: () => navigate("/business/orders"),
      highlight: (stats?.pendingOrders || 0) > 0,
    },
    { 
      label: "Job Requests", 
      value: stats?.pendingJobs || 0, 
      icon: Briefcase,
      onClick: () => navigate("/business/jobs"),
      highlight: (stats?.pendingJobs || 0) > 0,
    },
    { 
      label: "Market Leads", 
      value: leadsCount, 
      icon: ArrowUpRight,
      onClick: () => navigate("/business/leads"),
      highlight: leadsCount > 0,
    },
    { 
      label: "Net Earnings", 
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 lg:pb-8 animate-fade-in">
        
        {/* Glowing Welcoming Hero Block */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-background/40 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/5">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              {business?.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={business.company_name} 
                  className="h-16 w-16 rounded-2xl object-cover border border-border/60 shadow-md shadow-black/5 shrink-0" 
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                  {business?.company_name?.charAt(0) || "B"}
                </div>
              )}
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                  {business?.company_name || "Welcome back"}
                  {verificationTier !== "none" && (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Logged in as <span className="font-semibold text-foreground/80">{profile?.full_name?.split(" ")[0]}</span> • 
                  {business?.industry ? ` ${business.industry}` : " Business Operator"}
                </p>
              </div>
            </div>

            {/* Quick overview badges */}
            <div className="flex gap-2 shrink-0">
              <div className="rounded-2xl border border-border/40 bg-card/40 px-4 py-2.5 text-center shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Reputation</p>
                <p className="text-base font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {reputationScore > 0 ? reputationScore.toFixed(1) : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-card/40 px-4 py-2.5 text-center shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-[9px]">Status</p>
                <p className="text-xs font-bold text-primary mt-1.5 capitalize">
                  {verificationTier === "premium" ? "Gold Elite" : verificationTier === "verified" ? "Verified" : "Standard"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-8 w-16 mt-2" />
              </div>
            ))
          ) : (
            statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`stat-card relative overflow-hidden transition-all duration-300 ${stat.onClick ? "cursor-pointer active:scale-95 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5" : ""} ${stat.highlight ? "border-primary/30 bg-primary/[0.02]" : "bg-card/50"}`}
                  onClick={stat.onClick}
                >
                  {stat.highlight && (
                    <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-primary m-3 animate-ping" />
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <Icon className={`h-4 w-4 ${stat.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold mt-2 text-foreground">
                    {stat.value}
                  </p>
                  {stat.highlight && stat.onClick && (
                    <p className="text-[10px] font-bold text-primary mt-1">Tap to review</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Primary Dashboard Core: Charts & Reputation Progress */}
        <div className="grid gap-4 lg:grid-cols-3">
          
          {/* sleek Glassmorphic Chart */}
          <div className="lg:col-span-2 dashboard-card flex flex-col justify-between h-[300px]">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                Revenue Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Net dynamic earnings from completed services & product deliveries</p>
            </div>
            
            <div className="h-48 mt-4 w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : revenueData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.2)" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(v: number) => [`₦${v.toLocaleString()}`, "Net Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border)/0.6)",
                        borderRadius: "1rem",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/40 rounded-2xl bg-muted/5 p-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-1" />
                  <span className="text-xs font-semibold">No recorded sales this week</span>
                </div>
              )}
            </div>
          </div>

          {/* Gamified Growth progress */}
          <div className="dashboard-card flex flex-col justify-between h-[300px]">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                Growth & Reputation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Scale your profile ranking weight</p>
            </div>

            <div className="space-y-4 my-2">
              <div className="rounded-2xl bg-muted/40 border border-border/20 p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Badge</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{repTier}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reputationScore >= 4.5 
                    ? "Maximum search priority active! You are an elite platform partner." 
                    : "Complete more deliveries and secure high ratings to scale matching weight."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Order Target ({completedTotal}/{nextTarget})</span>
                  <span className="text-primary">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/10">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!business?.location_verified) {
                  navigate("/business/verify");
                } else if (business?.verification_tier !== "premium") {
                  navigate("/business/boost");
                } else {
                  navigate("/business/settings");
                }
              }}
              className="w-full text-center py-2 bg-primary/10 hover:bg-primary/15 text-primary rounded-xl font-bold text-xs transition-all duration-300"
            >
              {!business?.location_verified 
                ? "Get Verified (Free)" 
                : business?.verification_tier !== "premium" 
                  ? "Boost Visibility (Premium)" 
                  : "Configure Settings"}
            </button>
          </div>
        </div>

        {/* Bottom Grid: Live Activity Stream & Actions/Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          
          {/* Live Chronological Activity Stream */}
          <div className="dashboard-card space-y-4">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Operations Stream</h3>
              <p className="text-xs text-muted-foreground">Live chronological feed of customer interactions</p>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : activityStream.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border border-dashed border-border/40 rounded-2xl bg-muted/5 flex flex-col items-center justify-center">
                <Clock className="h-7 w-7 text-muted-foreground/40 mb-1" />
                <p className="text-xs font-semibold">No operational updates yet</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activityStream.map((act, index) => {
                  const isOrder = act.type === "order";
                  const Icon = isOrder ? Package : Briefcase;
                  return (
                    <div key={index} className="flex items-center justify-between gap-3 text-xs border-b border-border/20 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground">{act.title}</p>
                          <p className="text-muted-foreground truncate">{act.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {formatDistanceToNow(act.date, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="dashboard-card flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">Quick Navigation</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate("/business/products")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    Manage Products
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button 
                  onClick={() => navigate("/business/services")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    Manage Services
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button 
                  onClick={() => navigate("/business/leads")}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors text-sm flex items-center justify-between group text-primary font-bold"
                >
                  <span className="flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-2 animate-pulse text-primary" />
                    Browse Active Leads
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button 
                  onClick={() => navigate("/business/messages")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    View Messages
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {!isLoading && business && (
              <div className="border-t border-border/20 pt-4 mt-4 text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Merchant Type</span>
                  <span className="font-semibold text-foreground capitalize">{business.business_type || "Goods"}</span>
                </div>
                <div className="flex justify-between">
                  <span>GPS Tracking</span>
                  <span className="font-semibold text-foreground">{business.location_verified ? "Active & Pinned" : "Inactive"}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}