import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation, calculateDistance } from "@/hooks/useLocation";
import { useSmartMatching, detectLowQualitySignals, useAiMatchmaking } from "@/hooks/useSmartMatching";
import {
  PremiumHeart,
  PremiumChatBubble,
  PremiumBookmark,
} from "@/components/ui/custom-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Building2,
  Navigation,
  Package,
  Wrench,
  Filter,
  AlertTriangle,
  Loader2,
  Lightbulb,
  Send,
  SlidersHorizontal,
  ShoppingCart,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReputationBadge } from "@/components/ui/reputation-badge";
import { cn } from "@/lib/utils";

interface Business {
  id: string;
  company_name: string;
  industry: string | null;
  business_location: string | null;
  products_services: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  business_type: string | null;
  reputation_score: number | null;
  verified: boolean | null;
  verification_tier: "none" | "basic" | "verified" | "premium" | "elite" | null;
  total_reviews: number | null;
  total_completed_orders: number | null;
}

interface Product {
  id: string;
  name: string;
  business_id: string;
  price?: number | null;
  image_url?: string | null;
}

interface Service {
  id: string;
  name: string;
  business_id: string;
  images?: string[] | null;
  price_min?: number | null;
  price_max?: number | null;
}

interface EnrichedBusiness extends Business {
  is_saved: boolean;
  distance: number | null;
  products: Product[];
  services: Service[];
  warnings: string[];
}

interface RankedBusiness extends EnrichedBusiness {
  matchScore: number;
  trustScore: number;
}

interface SearchInsight {
  id: string;
  ai_match_score?: number;
  ai_insights?: string[];
}

interface SearchAssistPayload {
  aiResults: SearchInsight[];
  relatedItems: string[];
}

const tokenizeSearch = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

const buildRelatedTerms = (term: string, businesses: EnrichedBusiness[]) => {
  const tokens = tokenizeSearch(term);
  const catalogTerms = Array.from(
    new Set(
      businesses.flatMap((business) => [
        business.company_name,
        business.industry ?? "",
        business.products_services ?? "",
        ...business.products.map((product) => product.name),
        ...business.services.map((service) => service.name),
      ]),
    ),
  )
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return catalogTerms
    .filter((item) => {
      const normalized = item.toLowerCase();
      return tokens.some((token) => normalized.includes(token) || token.includes(normalized));
    })
    .slice(0, 6);
};

const buildLocalSearchAssist = (term: string, candidates: RankedBusiness[], businesses: EnrichedBusiness[]): SearchAssistPayload => {
  const aiResults = candidates.slice(0, 6).map((business) => {
    const insights: string[] = [];

    if (business.distance !== null) {
      insights.push(
        business.distance < 1
          ? "Very close to your location."
          : `${business.distance.toFixed(1)}km away from you.`,
      );
    }

    if (business.products.some((product) => product.name.toLowerCase().includes(term.toLowerCase()))) {
      insights.push("Has a matching product listed right now.");
    }

    if (business.services.some((service) => service.name.toLowerCase().includes(term.toLowerCase()))) {
      insights.push("Has a matching service available.");
    }

    if (business.verified) {
      insights.push("Verified business profile.");
    }

    if ((business.total_completed_orders || 0) > 0) {
      insights.push(`Completed ${business.total_completed_orders} orders on String.`);
    }

    return {
      id: business.id,
      ai_match_score: business.matchScore,
      ai_insights: insights.slice(0, 3),
    };
  });

  return {
    aiResults,
    relatedItems: buildRelatedTerms(term, businesses),
  };
};

export default function CustomerDiscover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { location, requestLocation, loading: locationLoading } = useUserLocation();

  const [businesses, setBusinesses] = useState<EnrichedBusiness[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("smart");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [verifTier, setVerifTier] = useState<string>("all");

  const aiMatchmaking = useAiMatchmaking();
  const [searchInsights, setSearchInsights] = useState<SearchInsight[]>([]);
  const [relatedItems, setRelatedItems] = useState<string[]>([]);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestedItem, setSuggestedItem] = useState("");
  const [suggestionDetails, setSuggestionDetails] = useState("");
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: customer } = await supabase
          .from("customers")
          .select("id, latitude, longitude")
          .eq("user_id", user.id)
          .maybeSingle();

        if (customer) {
          setCustomerId(customer.id);
          if (customer.latitude && customer.longitude) {
            setUserLocation({ lat: customer.latitude, lng: customer.longitude });
          }
        }

        const { data: businessList } = await supabase
          .from("public_businesses")
          .select(`
            id, company_name, industry, business_location, products_services, 
            cover_image_url, logo_url, latitude, longitude, business_type, 
            reputation_score, verified, verification_tier, total_reviews, total_completed_orders,
            products(id, name, business_id, price, image_url),
            services(id, name, business_id, images, price_min, price_max),
            saved_businesses!left(id)
          `)
          .eq("saved_businesses.customer_id", customer?.id || "")
          .order("created_at", { ascending: false });

        if (businessList) {
          const enriched = businessList.map((biz: EnrichedBusiness & { saved_businesses?: { id: string }[] }) => {
            let distance: number | null = null;
            if (customer?.latitude && customer?.longitude && biz.latitude && biz.longitude) {
              distance = calculateDistance(customer.latitude, customer.longitude, biz.latitude, biz.longitude);
            }

            const warnings = detectLowQualitySignals(biz);

            return {
              ...biz,
              is_saved: biz.saved_businesses?.length > 0,
              distance,
              products: biz.products?.slice(0, 5) || [],
              services: biz.services?.slice(0, 5) || [],
              warnings,
            };
          });

          setBusinesses(enriched);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, location]);

  const toggleSave = async (businessId: string) => {
    if (!customerId) return;

    const business = businesses.find((b) => b.id === businessId);
    if (!business) return;

    try {
      if (business.is_saved) {
        await supabase.from("saved_businesses").delete().eq("customer_id", customerId).eq("business_id", businessId);
        setBusinesses((prev) => prev.map((b) => b.id === businessId ? { ...b, is_saved: false } : b));
        toast({ title: "Removed from favorites" });
      } else {
        await supabase.from("saved_businesses").insert({ customer_id: customerId, business_id: businessId });
        setBusinesses((prev) => prev.map((b) => b.id === businessId ? { ...b, is_saved: true } : b));
        toast({ title: "Saved to favorites" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  const startChat = async (businessId: string) => {
    if (!customerId) return;

    try {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", customerId)
        .eq("business_id", businessId)
        .maybeSingle();

      if (!existingConv) {
        await supabase.from("conversations").insert({ customer_id: customerId, business_id: businessId });
      }

      navigate("/customer/messages");
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to start chat" });
    }
  };

  const handleCatalogPitch = async (businessId: string, companyName: string, productName: string, productPrice?: number | null) => {
    if (!customerId || !user) {
      toast({ title: "Please log in", description: "You must be logged in to pitch a seller." });
      return;
    }

    try {
      // 1. Establish conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", customerId)
        .eq("business_id", businessId)
        .maybeSingle();

      let conversationId = conv?.id;

      if (!conversationId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ customer_id: customerId, business_id: businessId })
          .select("id")
          .single();

        if (newConv) {
          conversationId = newConv.id;
        }
      }

      if (!conversationId) throw new Error("Could not initialize conversation context.");

      // 2. Dispatch direct pitch message into the conversation
      const priceText = productPrice ? ` (₦${Number(productPrice).toLocaleString()})` : "";
      const pitchMsg = `Hi ${companyName}, I'm highly interested in purchasing your "${productName}"${priceText} listed in your catalog highlights. Is this item currently available?`;

      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: pitchMsg
        });

      if (msgError) throw msgError;

      // Play synthesized messaging chime!
      try {
        const { playChatAlert } = await import("@/hooks/useAudioSignals");
        playChatAlert();
      } catch (err) {
        console.warn("Audio chime failed:", err);
      }

      toast({
        title: "Catalog pitch sent successfully! 🚀",
        description: `Direct query for "${productName}" dispatched to ${companyName}.`,
      });

      // Navigate to chat
      navigate("/customer/messages");
    } catch (err: any) {
      console.error("Direct catalog pitch failed:", err);
      toast({
        variant: "destructive",
        title: "Pitch dispatch failed",
        description: err.message || "Failed to start conversation.",
      });
    }
  };

  const smartMatched = useSmartMatching<EnrichedBusiness>(businesses, {
    userLatitude: userLocation?.lat,
    userLongitude: userLocation?.lng,
    preferredType: typeFilter === "all" ? "all" : (typeFilter as "goods" | "services"),
  }) as RankedBusiness[];

  let filteredBusinesses: RankedBusiness[] = smartMatched.filter((b) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      b.company_name.toLowerCase().includes(searchLower) ||
      b.industry?.toLowerCase().includes(searchLower) ||
      b.business_location?.toLowerCase().includes(searchLower) ||
      b.products.some((p) => p.name.toLowerCase().includes(searchLower)) ||
      b.services.some((s) => s.name.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    if (typeFilter === "goods" && !(b.business_type === "goods" || b.products.length > 0)) {
      return false;
    }
    if (typeFilter === "services" && !(b.business_type === "services" || b.services.length > 0)) {
      return false;
    }

    // Radius distance filter
    if (maxDistance < 100 && b.distance !== null && b.distance > maxDistance) {
      return false;
    }

    // Price range filters (check products or services prices)
    if (minPrice > 0 || maxPrice < 10000000) {
      const hasProductInPrice = b.products.some(p => Number(p.price || 0) >= minPrice && Number(p.price || 0) <= maxPrice);
      const hasServiceInPrice = b.services.some(s => Number(s.price || 0) >= minPrice && Number(s.price || 0) <= maxPrice);
      if (!hasProductInPrice && !hasServiceInPrice) return false;
    }

    // Verification tier filters
    if (verifTier !== "all") {
      if (verifTier === "verified" && b.verification_tier === "none") return false;
      if (verifTier === "premium" && b.verification_tier !== "premium") return false;
    }

    return true;
  });

  if (sortBy !== "smart") {
    filteredBusinesses = [...filteredBusinesses].sort((a, b) => {
      if (sortBy === "distance") {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      }
      if (sortBy === "rating") {
        return (b.reputation_score || 0) - (a.reputation_score || 0);
      }
      if (sortBy === "popular") {
        return (b.total_completed_orders || 0) - (a.total_completed_orders || 0);
      }
      return 0;
    });
  }

  const openSuggestionDialog = () => {
    const trimmedSearch = search.trim();
    setSuggestedItem(trimmedSearch);
    setSuggestionDetails("");
    setSuggestionOpen(true);
  };

  const applySearchAssist = (result: SearchAssistPayload, title: string, description: string) => {
    setSearchInsights(result.aiResults);
    setRelatedItems(result.relatedItems);
    toast({ title, description });
  };

  const handleSearchAssist = () => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      toast({ title: "Enter what you want to find first" });
      return;
    }

    const rankedCandidates = filteredBusinesses.length > 0 ? filteredBusinesses : smartMatched.slice(0, 8);
    const localFallback = buildLocalSearchAssist(trimmedSearch, rankedCandidates, businesses);

    aiMatchmaking.mutate(
      {
        userPreferences: { search_term: trimmedSearch, type_filter: typeFilter },
        businesses: rankedCandidates,
      },
      {
        onSuccess: (results) => {
          applySearchAssist(
            {
              aiResults: results.aiResults.length > 0 ? results.aiResults : localFallback.aiResults,
              relatedItems: results.relatedItems.length > 0 ? results.relatedItems : localFallback.relatedItems,
            },
            "Search highlights ready",
            "We ranked the closest businesses and related search terms for you.",
          );
        },
        onError: () => {
          applySearchAssist(
            localFallback,
            localFallback.aiResults.length > 0 ? "Showing the closest matches we found" : "No exact match yet",
            localFallback.aiResults.length > 0
              ? "Search assistance is using your current catalog and location data."
              : "You can suggest this item so businesses know what customers want next.",
          );
        },
      },
    );
  };

  const handleSuggestionSubmit = async () => {
    const normalizedSuggestedItem = suggestedItem.trim() || search.trim();

    if (!user || !normalizedSuggestedItem) {
      toast({
        title: "Add the item you want",
        description: "Tell us what product or service you could not find.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingSuggestion(true);

    try {
      const { error } = await supabase.from("item_search_suggestions").insert({
        user_id: user.id,
        customer_id: customerId,
        search_term: search.trim() || normalizedSuggestedItem,
        suggested_item: normalizedSuggestedItem,
        details: suggestionDetails.trim() || null,
      });

      if (error) throw error;

      setSuggestionOpen(false);
      setSuggestedItem("");
      setSuggestionDetails("");
      toast({
        title: "Suggestion sent",
        description: "Thanks. We will use this to guide what sellers add next.",
      });
    } catch (error) {
      console.error("Error submitting item suggestion:", error);
      toast({
        title: "We could not save your suggestion",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");

  const categories = [
    { label: "Real Estate & Property", value: "Real Estate & Property" },
    { label: "Fashion & Clothings", value: "Fashion & Clothings" },
    { label: "Furniture", value: "Furniture" },
    { label: "Interior Design & Home Decor", value: "Interior Design & Home Decor" },
    { label: "Automobile & Transport", value: "Automobile & Transport" },
    { label: "Health & Medical", value: "Health & Medical" },
    { label: "Electronics & Gadgets", value: "Electronics & Gadgets" },
    { label: "Beauty & Personal Care", value: "Beauty & Personal Care" },
    { label: "Food & Agriculture", value: "Food & Agriculture" },
    { label: "Technology & Digital Products", value: "Technology & Digital Products" },
    { label: "Travel & Hospitality", value: "Travel & Hospitality" },
    { label: "Education & Learning", value: "Education & Learning" }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-5 pb-20 px-3 md:px-0">
        
        {/* Premium Sticky Consolidated Header Panel */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md pt-3 pb-2 border-b border-border/10 -mx-4 px-4 space-y-3">
          {/* Main search and primary action row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search products, services, businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-11 rounded-full bg-muted/30 border-border/40 focus:bg-background focus:ring-primary/20 shadow-inner"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                "h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm shrink-0",
                filterOpen
                  ? "bg-primary border-transparent text-primary-foreground"
                  : "border-border/40 hover:bg-accent bg-card text-foreground"
              )}
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>

            {/* Shopping cart shortcut button next to search */}
            <button 
              onClick={() => navigate("/customer/orders")}
              className="h-11 w-11 rounded-full border border-border/40 hover:bg-accent flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm shrink-0 bg-card text-foreground"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Extended Filters Dashboard (Sticky and Interactive) */}
          {filterOpen && (
            <div className="p-4 rounded-2xl bg-card border border-border/30 shadow-lg space-y-4 animate-fade-in text-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Filter & Sort Options</p>
                <button 
                  onClick={() => {
                    // Reset all filters
                    setSearch("");
                    setTypeFilter("all");
                    setSortBy("smart");
                    setMinPrice(0);
                    setMaxPrice(10000000);
                    setMaxDistance(100);
                    setVerifTier("all");
                  }}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-bold"
                >
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type & Sort Selection */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-muted-foreground uppercase">Feed Type</Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full rounded-xl h-9 text-xs">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="goods">Products</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-muted-foreground uppercase">Sort by</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full rounded-xl h-9 text-xs">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smart">Best Match</SelectItem>
                          <SelectItem value="distance">Nearest</SelectItem>
                          <SelectItem value="rating">Top Rated</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category Dropdown Selector */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Category</Label>
                    <Select 
                      value={categories.some(cat => cat.value.toLowerCase() === search.toLowerCase()) ? search : "all"} 
                      onValueChange={(val) => setSearch(val === "all" ? "" : val)}
                    >
                      <SelectTrigger className="w-full rounded-xl h-9 text-xs">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Granular Sliders / Thresholds */}
                <div className="space-y-3">
                  {/* Price Range */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Price Range ($)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice || ""}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="h-8 rounded-lg text-xs"
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice === 10000000 ? "" : maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : 10000000)}
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Distance Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label className="text-[11px] font-bold text-muted-foreground uppercase">Max Distance</Label>
                      <span className="text-[11px] font-bold text-primary">{maxDistance >= 100 ? "Anywhere" : `${maxDistance} km`}</span>
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Verification Tier */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Verification Tier</Label>
                    <Select value={verifTier} onValueChange={setVerifTier}>
                      <SelectTrigger className="w-full rounded-xl h-9 text-xs">
                        <SelectValue placeholder="Verification Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Verification Levels</SelectItem>
                        <SelectItem value="verified">Verified Sellers</SelectItem>
                        <SelectItem value="premium">Premium Sellers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action and AI assistance line */}
              <div className="flex justify-end pt-1 border-t border-border/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={handleSearchAssist}
                  disabled={aiMatchmaking.isPending || !search.trim()}
                >
                  {aiMatchmaking.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Zap className="mr-1 h-3 w-3 text-primary animate-pulse" />}
                  AI Assist Match
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mockup Location Request Box (Image 2 - minimalist coordinates outline) */}
        {!userLocation && (
          <div className="rounded-[20px] border border-border/40 bg-card p-4 flex items-center justify-between shadow-premium transition-all duration-200">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-full border border-foreground/10 flex items-center justify-center bg-muted/10 text-foreground shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 rotate-45">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground leading-none">Enable location</p>
                <p className="text-xs text-muted-foreground leading-normal mt-0.5">See nearby business first</p>
              </div>
            </div>
            <button
              onClick={requestLocation}
              disabled={locationLoading}
              className="px-4 py-1.75 rounded-full border border-border/60 text-xs font-bold hover:bg-accent active:scale-95 transition-all shadow-sm shrink-0"
            >
              {locationLoading ? "Loading..." : "Enable"}
            </button>
          </div>
        )}

        {/* Search highlights overlay */}
        {relatedItems.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Related:</span>
            {relatedItems.map((item, idx) => (
              <button
                key={idx}
                className="bg-muted hover:bg-muted/80 text-[10px] font-bold px-3 py-1 rounded-full text-foreground transition-all duration-300"
                onClick={() => setSearch(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Business listings feed count */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {filteredBusinesses.length} Active Seller{filteredBusinesses.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Main Masonry / Feed Listings */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border/40 rounded-[32px] p-4 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-1/3 bg-muted rounded" />
                    <div className="h-2 w-1/4 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-48 rounded-[24px] bg-muted w-full" />
              </div>
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-card border border-border/40 rounded-[32px] text-center py-16 px-4 shadow-premium">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="mt-4 font-bold text-foreground text-lg">No businesses found</h3>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {search ? "No matches found for your current search. Try different keywords or filters." : "We're expanding! Check back soon for new businesses in your area."}
            </p>
            {search.trim() && (
              <div className="mt-5">
                <Button onClick={openSuggestionDialog} className="bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
                  Suggest "{search.trim()}"
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBusinesses.map((business) => {
              const handleName = business.company_name.toLowerCase().replace(/[^a-z0-9]/g, "");
              const isSaved = business.is_saved;

              return (
                <div 
                  key={business.id} 
                  className="bg-card border border-border/30 rounded-[32px] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-300 flex flex-col space-y-4 p-4 animate-fade-in"
                >
                  {/* Card Header (Profile Info & Follow/Save Action) */}
                  <div className="flex items-center justify-between px-1">
                    <div 
                      className="flex items-center gap-3.5 cursor-pointer" 
                      onClick={() => navigate(`/business/${business.id}`)}
                    >
                      {/* Round Business Avatar */}
                      <div className="h-11 w-11 rounded-full border border-border/40 bg-muted/50 flex items-center justify-center overflow-hidden">
                        {business.logo_url ? (
                          <img src={business.logo_url} alt={business.company_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-extrabold text-sm text-primary">{business.company_name.charAt(0)}</span>
                        )}
                      </div>
                      
                      {/* Name & Handle details */}
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground hover:text-primary transition-colors text-sm flex items-center gap-1.5 leading-none">
                          {business.company_name}
                          {business.verified && (
                            <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-primary text-white text-[8px] font-bold">✓</span>
                          )}
                        </span>
                        <span className="text-[11px] text-muted-foreground tracking-wide mt-1">@{handleName}</span>
                      </div>
                    </div>

                    {/* Follow/Save capsule action button */}
                    <button
                      onClick={() => toggleSave(business.id)}
                      className={cn(
                        "text-xs font-bold px-4 py-1.75 rounded-full transition-all duration-300 border active:scale-95",
                        isSaved
                          ? "bg-accent text-accent-foreground border-transparent"
                          : "bg-primary text-primary-foreground border-transparent shadow-sm shadow-primary/20 hover:bg-primary/95"
                      )}
                    >
                      {isSaved ? "Following" : "Follow"}
                    </button>
                  </div>

                  {/* Card Cover Image with location overlays */}
                  <div 
                    className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gradient-to-br from-muted/50 to-muted group cursor-pointer shadow-inner"
                    onClick={() => navigate(`/business/${business.id}`)}
                  >
                    {business.cover_image_url ? (
                      <img src={business.cover_image_url} alt={business.company_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-5xl font-bold text-slate-200 dark:text-slate-800">{business.company_name.charAt(0)}</span>
                      </div>
                    )}
                    
                    {/* Distance overlay chip (Google-style pin) */}
                    {business.distance !== null && (
                      <div className="absolute top-3.5 right-3.5">
                        <span className="bg-background/80 dark:bg-background/90 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-foreground border border-border/25 shadow-sm">
                          {business.distance < 1 ? `${Math.round(business.distance * 1000)}m` : `${business.distance.toFixed(1)}km away`}
                        </span>
                      </div>
                    )}

                    {/* Search match highlights indicator overlay */}
                    {searchInsights.find((item) => item.id === business.id)?.ai_match_score !== undefined && (
                      <div className="absolute bottom-3.5 right-3.5">
                        <span className="bg-primary backdrop-blur-md text-[10px] font-extrabold uppercase px-3 py-1 rounded-full text-primary-foreground shadow-lg flex items-center gap-1">
                          <Zap className="h-3 w-3 animate-pulse" />
                          {searchInsights.find((item) => item.id === business.id)?.ai_match_score}% Match
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Social Actions Bar (Likes, comments, saves) */}
                  <div className="flex items-center gap-6 px-1.5">
                    {/* Like Action */}
                    <button 
                      onClick={() => {
                        toast({ title: "Liked business listing", description: `You sent a support signal to ${business.company_name}!` });
                      }}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-destructive group transition-colors duration-300"
                    >
                      <PremiumHeart className="w-5.5 h-5.5 transition-transform duration-300 group-active:scale-125" />
                      <span className="text-[10px] font-bold mt-0.75 text-muted-foreground group-hover:text-destructive leading-none">
                        {business.reputation_score ? `${(business.reputation_score * 12).toFixed(0)}k` : "1.2k"}
                      </span>
                    </button>

                    {/* Chat Action */}
                    <button 
                      onClick={() => startChat(business.id)}
                      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary group transition-colors duration-300"
                    >
                      <PremiumChatBubble className="w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-105" />
                      <span className="text-[10px] font-bold mt-0.75 text-muted-foreground group-hover:text-primary leading-none">
                        {business.total_reviews ? `${business.total_reviews * 3}` : "8"}
                      </span>
                    </button>

                    {/* Save Action */}
                    <button 
                      onClick={() => toggleSave(business.id)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 transition-colors duration-300 group",
                        isSaved ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <PremiumBookmark className="w-5.5 h-5.5 transition-transform duration-300 group-active:scale-125" active={isSaved} />
                      <span className="text-[10px] font-bold mt-0.75 text-muted-foreground group-hover:text-primary leading-none">
                        {isSaved ? "Saved" : "Save"}
                      </span>
                    </button>
                  </div>

                  {/* Mini-Catalog Showcase Horizontal Grid */}
                  {business.products && business.products.length > 0 && (
                    <div className="px-1.5 py-3 border-y border-border/10">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
                        <Package className="h-3 w-3 text-primary" />
                        Catalog Highlights (Click to Pitch)
                      </p>
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
                        {business.products.slice(0, 3).map((prod) => (
                          <button
                            key={prod.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCatalogPitch(business.id, business.company_name, prod.name, prod.price);
                            }}
                            className="flex items-center gap-2.5 p-1.5 bg-muted/40 hover:bg-muted/70 rounded-2xl border border-border/20 transition-all text-left shrink-0 active:scale-95 group/prod"
                          >
                            <div className="h-9 w-9 rounded-full border border-border/30 bg-card overflow-hidden flex items-center justify-center shrink-0">
                              {prod.image_url ? (
                                <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="space-y-0.5 pr-1 text-[11px]">
                              <p className="font-semibold text-foreground max-w-[90px] truncate leading-tight group-hover/prod:text-primary transition-colors">{prod.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground">₦{Number(prod.price || 0).toLocaleString()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata: Industry type, Location, Products/Services description */}
                  <div className="px-1.5 space-y-2">
                    {business.industry && (
                      <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest leading-none">
                        {business.industry}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {business.products_services || "A premium local partner dedicated to bringing you the highest standard of products and services."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={suggestionOpen} onOpenChange={setSuggestionOpen}>
        <DialogContent className="border-0 bg-background shadow-2xl sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl">Suggest a missing item</DialogTitle>
            <DialogDescription className="leading-6">
              Tell us what product or service you could not find. We will use this demand signal to guide what sellers add next.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="suggested-item" className="text-sm font-medium text-foreground">
                Product or service name
              </label>
              <Input
                id="suggested-item"
                value={suggestedItem}
                onChange={(event) => setSuggestedItem(event.target.value)}
                placeholder="Example: smoked turkey, event MC, solar battery"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="suggestion-details" className="text-sm font-medium text-foreground">
                Extra details
              </label>
              <Textarea
                id="suggestion-details"
                value={suggestionDetails}
                onChange={(event) => setSuggestionDetails(event.target.value)}
                placeholder="Add size, location, preferred quality, budget, or anything else that helps."
                className="min-h-[120px] border-0 bg-muted/40 shadow-none focus-visible:ring-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-0 bg-muted hover:bg-muted/80" onClick={() => setSuggestionOpen(false)}>
              Maybe later
            </Button>
            <Button onClick={handleSuggestionSubmit} disabled={submittingSuggestion} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {submittingSuggestion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Category Filter Bottom Drawer Dialog (Image 4) */}
      <Dialog open={categoryDrawerOpen} onOpenChange={setCategoryDrawerOpen}>
        <DialogContent className="border-0 bg-background shadow-2xl sm:max-w-md rounded-[32px] p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Choose suggested</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Select choice of interest that suits your preference
            </DialogDescription>
          </DialogHeader>

          {/* Grid of Capsules (Image 4) */}
          <div className="flex flex-wrap gap-2.5 py-4">
            {categories.map((cat) => {
              const isSelected = search.toLowerCase() === cat.value.toLowerCase();
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSearch(cat.value);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full border text-[11px] font-semibold tracking-wide transition-all active:scale-95 duration-200",
                    isSelected
                      ? "bg-primary border-transparent text-primary-foreground shadow-md shadow-primary/10"
                      : "border-border/60 hover:bg-accent/40 text-foreground bg-card"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end mt-2">
            {/* Round floating check button at the bottom right */}
            <button
              onClick={() => setCategoryDrawerOpen(false)}
              className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
