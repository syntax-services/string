import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBusiness } from "@/hooks/useBusiness";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  MessageSquare, Loader2, MapPin, DollarSign, Briefcase, 
  Clock, ShieldCheck, ShoppingBag, Wrench, Users, ArrowUpRight, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

type LeadType = "product" | "service" | "employment" | "collaboration";

const typeConfig: Record<LeadType, { label: string; icon: typeof ShoppingBag; color: string; bg: string }> = {
  product: { label: "Product Request", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  service: { label: "Service Request", icon: Wrench, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  employment: { label: "Job Request", icon: Briefcase, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  collaboration: { label: "Collaboration", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
};

const urgencyColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
  urgent: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse",
};

export default function BusinessLeads() {
  const { data: business } = useBusiness();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  // Fetch all open offers/leads in the system along with customer profiles
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["business-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url, email)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleContactClient = async (lead: any) => {
    if (!business) {
      toast.error("You need to complete your business profile to send pitches.");
      return;
    }
    setStartingChatId(lead.id);

    try {
      // 1. Fetch customer's customer_id pointing to the customers table
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", lead.user_id)
        .maybeSingle();

      if (customerError || !customerData) {
        throw new Error("Unable to locate customer registration details.");
      }

      // 2. Check if a conversation channel already exists between this business and customer
      const { data: existingConv, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", customerData.id)
        .eq("business_id", business.id)
        .maybeSingle();

      let conversationId = existingConv?.id;

      // 3. Create conversation if it does not exist
      if (!existingConv) {
        const { data: newConv, error: insertError } = await supabase
          .from("conversations")
          .insert({
            customer_id: customerData.id,
            business_id: business.id
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        conversationId = newConv.id;

        // Optionally insert an initial message
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: business.user_id,
          sender_type: "business",
          content: `Hi! I noticed your request: "${lead.title}". I would love to help you out with this. Let's discuss details!`
        });
      }

      toast.success("Connection established! Redirecting to chat...");
      navigate("/business/messages");
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate contact with client.");
    } finally {
      setStartingChatId(null);
    }
  };

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = 
      lead.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && lead.offer_type === activeFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-24 lg:pb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ArrowUpRight className="h-6 w-6 text-primary" />
              Leads & Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Pitch to clients and bid on incoming requests matching your trade
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search active leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background/50 backdrop-blur-md rounded-xl"
            />
          </div>
        </div>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar gap-2 p-1 border-b pb-2 mb-4 h-auto bg-transparent">
            <TabsTrigger value="all" className="rounded-xl px-4 py-2 text-xs">
              All Leads ({leads.length})
            </TabsTrigger>
            <TabsTrigger value="product" className="rounded-xl px-4 py-2 text-xs">
              Products Only ({leads.filter(l => l.offer_type === "product").length})
            </TabsTrigger>
            <TabsTrigger value="service" className="rounded-xl px-4 py-2 text-xs">
              Services Only ({leads.filter(l => l.offer_type === "service").length})
            </TabsTrigger>
            <TabsTrigger value="employment" className="rounded-xl px-4 py-2 text-xs">
              Jobs ({leads.filter(l => l.offer_type === "employment").length})
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="rounded-xl px-4 py-2 text-xs">
              Partnerships ({leads.filter(l => l.offer_type === "collaboration").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="dashboard-card animate-pulse h-48 rounded-2xl" />
                ))}
              </div>
            ) : filteredLeads.length === 0 ? (
              <Card className="border-border/40 shadow-xl backdrop-blur-xl bg-background/40 p-12 text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">No matching requests</CardTitle>
                  <CardDescription>
                    There are no open customer requests matching this category at the moment.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-1">
                {filteredLeads.map((lead: any) => {
                  const type = lead.offer_type as LeadType;
                  const config = typeConfig[type] || typeConfig.product;
                  const TypeIcon = config.icon;

                  return (
                    <Card 
                      key={lead.id} 
                      className={cn(
                        "dashboard-card overflow-hidden hover:border-primary/20 transition-all duration-300 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-background/30 backdrop-blur-xl border-border/40 active:scale-[0.995]",
                        lead.urgency === "urgent" && "border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn("px-2.5 py-0.5 rounded-full flex items-center gap-1 text-xs", config.bg, config.color)}>
                                <TypeIcon className="h-3.5 w-3.5" />
                                {config.label}
                              </Badge>
                              {lead.urgency && (
                                <Badge className={cn("px-2.5 py-0.5 rounded-full text-xs font-mono uppercase font-bold", urgencyColors[lead.urgency])}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {lead.urgency}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-foreground mt-2">
                              {lead.title}
                            </h3>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed break-words">
                          {lead.description || "No request description provided."}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium bg-muted/20 border border-border/10 rounded-2xl p-4">
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-foreground/70" /> Budget Range
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {lead.budget_min && lead.budget_max ? (
                                `₦${lead.budget_min.toLocaleString()} - ₦${lead.budget_max.toLocaleString()}`
                              ) : lead.budget_min ? (
                                `₦${lead.budget_min.toLocaleString()}+`
                              ) : lead.budget_max ? (
                                `Up to ₦${lead.budget_max.toLocaleString()}`
                              ) : (
                                "Open Budget"
                              )}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-foreground/70" /> Client Location
                            </span>
                            <span className="text-sm font-semibold text-foreground truncate block">
                              {lead.location || "Anywhere"}
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-1 space-y-0.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Request Author
                            </span>
                            <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                              {lead.profiles?.avatar_url && (
                                <img src={lead.profiles.avatar_url} className="h-4 w-4 rounded-full object-cover border border-border/30" />
                              )}
                              {lead.profiles?.full_name || "Platform Client"}
                            </span>
                          </div>
                        </div>

                        {lead.images && lead.images.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                            {lead.images.map((img: string, idx: number) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="Lead attachment" 
                                className="h-20 w-28 object-cover rounded-xl border border-border/40 hover:scale-105 transition-transform shrink-0" 
                              />
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <Button
                            onClick={() => handleContactClient(lead)}
                            disabled={startingChatId === lead.id}
                            className="rounded-2xl h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-semibold"
                          >
                            {startingChatId === lead.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contact Client & Pitch
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
