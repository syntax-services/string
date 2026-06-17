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
  MapPin,
  Gift,
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
import { updateMetaTags, injectMarketplaceDirectorySchema, injectProductSchema } from "@/lib/seo";

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
  image_verified?: boolean | null;
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

const GamificationBanner = () => {
  const banners = [
    {
      title: "🎁 Surprise Gift Hunt!",
      desc: "Find the hidden gift icon today to win 1,000 points.",
      color: "from-purple-500 to-indigo-500",
      action: "Start Hunting"
    },
    {
      title: "🎡 Daily Spin & Win",
      desc: "Spin the wheel for a chance to win up to 5,000 coupon cash!",
      color: "from-amber-400 to-orange-500",
      action: "Spin Now"
    },
    {
      title: "🔥 3-Day Streak!",
      desc: "Order again today to double your reward points.",
      color: "from-rose-500 to-pink-500",
      action: "Order Now"
    }
  ];
  const banner = banners[Math.floor(Math.random() * banners.length)];

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${banner.color} text-white shadow-xl animate-fade-in`}>
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Gift className="w-24 h-24 transform rotate-12" />
      </div>
      <div className="relative z-10 flex flex-col items-start gap-2">
        <h3 className="text-lg font-bold">{banner.title}</h3>
        <p className="text-sm text-white/90 mb-2">{banner.desc}</p>
        <Button variant="secondary" size="sm" className="rounded-full px-6 font-bold shadow-lg hover:scale-105 transition-transform">
          {banner.action}
        </Button>
      </div>
    </div>
  );
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
            products(id, name, business_id, price, image_url, image_verified),
            services(id, name, business_id, images, price_min, price_max)
          `)
          .order("created_at", { ascending: false });

        let savedSet = new Set<string>();
        if (customer) {
          const { data: savedList } = await supabase
            .from("saved_businesses")
            .select("business_id")
            .eq("customer_id", customer.id);
          if (savedList) {
            savedList.forEach((s) => savedSet.add(s.business_id));
          }
        }

        if (businessList) {
          const enriched = businessList.map((biz: any) => {
            let distance: number | null = null;
            if (customer?.latitude && customer?.longitude && biz.latitude && biz.longitude) {
              distance = calculateDistance(customer.latitude, customer.longitude, biz.latitude, biz.longitude);
            }

            const warnings = detectLowQualitySignals(biz);

            return {
              ...biz,
              is_saved: savedSet.has(biz.id),
              distance,
              products: biz.products || [],
              services: biz.services || [],
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

  const allProducts = React.useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      price: number | string;
      image_url: string | null;
      image_verified?: boolean | null;
      business: EnrichedBusiness;
      isService: boolean;
    }> = [];

    businesses.forEach((biz) => {
      if (biz.products) {
        biz.products.forEach((prod) => {
          items.push({
            id: prod.id,
            name: prod.name,
            price: prod.price || 0,
            image_url: prod.image_url || null,
            image_verified: prod.image_verified,
            business: biz,
            isService: false,
          });
        });
      }
      if (biz.services) {
        biz.services.forEach((srv) => {
          items.push({
            id: srv.id,
            name: srv.name,
            price: srv.price_min ? `₦${Number(srv.price_min).toLocaleString()}${srv.price_max ? ` - ₦${Number(srv.price_max).toLocaleString()}` : '+'}` : "Contact for price",
            image_url: srv.images && srv.images.length > 0 ? srv.images[0] : null,
            image_verified: true,
            business: biz,
            isService: true,
          });
        });
      }
    });

    return items;
  }, [businesses]);

  const searchedProducts = React.useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allProducts.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.business.company_name.toLowerCase().includes(q) ||
      (item.business.industry && item.business.industry.toLowerCase().includes(q))
    );
  }, [allProducts, search]);

  const filteredProducts = React.useMemo(() => {
    let list = search.trim() ? searchedProducts : allProducts;

    if (typeFilter === "goods") {
      list = list.filter((item) => !item.isService);
    } else if (typeFilter === "services") {
      list = list.filter((item) => item.isService);
    }

    if (minPrice > 0 || maxPrice < 10000000) {
      list = list.filter((item) => {
        let itemPrice = 0;
        if (typeof item.price === "number") {
          itemPrice = item.price;
        } else {
          const match = String(item.price).match(/\d+/g);
          if (match) {
            itemPrice = Number(match.join(""));
          }
        }
        return itemPrice >= minPrice && itemPrice <= maxPrice;
      });
    }

    if (maxDistance < 100) {
      list = list.filter((item) => item.business.distance === null || item.business.distance <= maxDistance);
    }

    if (verifTier !== "all") {
      list = list.filter((item) => {
        const tier = item.business.verification_tier;
        if (verifTier === "verified") return tier !== "none" && tier !== null;
        if (verifTier === "premium") return tier === "premium";
        return true;
      });
    }

    if (sortBy === "distance") {
      list = [...list].sort((a, b) => {
        if (a.business.distance === null) return 1;
        if (b.business.distance === null) return -1;
        return a.business.distance - b.business.distance;
      });
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => (b.business.reputation_score || 0) - (a.business.reputation_score || 0));
    } else if (sortBy === "popular") {
      list = [...list].sort((a, b) => (b.business.total_completed_orders || 0) - (a.business.total_completed_orders || 0));
    }

    return list;
  }, [allProducts, searchedProducts, search, typeFilter, minPrice, maxPrice, maxDistance, verifTier, sortBy]);

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

  // Synchronize dynamic SEO meta tags and JSON-LD structured search schemas
  useEffect(() => {
    const activeSearch = search.trim();
    const title = activeSearch 
      ? `Search "${activeSearch}"` 
      : "Discover Local Verified Merchants & Services";
    const description = activeSearch
      ? `Browse high-quality local results for "${activeSearch}" on String. Safe payments, fast deliveries, and fully verified local Lagos businesses with secure escrow.`
      : "Explore the premier high-trust escrow marketplace. Connect with top local beauty salons, tailor designers, electronics technicians, and premium merchants in Lagos.";
    
    const keywords = activeSearch
      ? `${activeSearch}, search ${activeSearch}, buy ${activeSearch}, local ${activeSearch}, string, lagos, marketplace`
      : "discover tailors, lagos fashion, electronics repairs, hair salons, verified merchants, string escrow, local goods, services";

    updateMetaTags(title, description, keywords);

    // Inject marketplace directory schema
    if (filteredBusinesses && filteredBusinesses.length > 0) {
      const dirPayload = filteredBusinesses.slice(0, 10).map(b => ({
        companyName: b.company_name,
        address: b.business_location || undefined,
        rating: b.reputation_score || undefined,
        imageUrl: b.logo_url || undefined,
        category: b.industry || undefined
      }));
      injectMarketplaceDirectorySchema(dirPayload);

      // Inject the first prominent product schema if matching search
      const firstBiz = filteredBusinesses[0];
      if (firstBiz && firstBiz.products && firstBiz.products.length > 0) {
        const prod = firstBiz.products[0];
        injectProductSchema({
          id: prod.id,
          name: prod.name,
          description: `Get premium ${prod.name} from ${firstBiz.company_name} on String - High-trust local marketplace with escrow protection.`,
          price: prod.price || 0,
          imageUrl: prod.image_url || "https://string-marketplace.vercel.app/string-logo.png",
          businessName: firstBiz.company_name,
          category: firstBiz.industry || undefined,
          inStock: true
        });
      }
    }
  }, [filteredBusinesses, search]);

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
  const [activeTab, setActiveTab] = useState<"directory" | "leaderboard">("directory");

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

        {/* Tab Selector */}
        <div className="flex border-b border-border/10 pb-1 gap-4 px-1">
          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer",
              activeTab === "directory" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Sellers Directory
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={cn(
              "pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer",
              activeTab === "leaderboard" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            🏆 Status Leaderboard
          </button>
        </div>

        {activeTab === "directory" && (
          <>
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
        ) : !search.trim() ? (
          /* Default Feed when NOT searching */
          <div className="space-y-7 animate-fade-in text-left">
            {/* Explore Stores Carousel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Explore Stores</h3>
                <span className="text-[10px] font-bold text-primary leading-none">{businesses.length} stores</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar -mx-4 px-4 mask-gradient">
                {businesses.map((biz) => {
                  return (
                    <div 
                      key={biz.id}
                      className="flex flex-col items-center text-center shrink-0 w-28 bg-card/45 hover:bg-card/75 border border-border/30 hover:border-primary/25 p-3.5 rounded-[24px] transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                      onClick={() => navigate(`/business/${biz.id}`)}
                    >
                      {/* Store Logo */}
                      <div className="relative h-14 w-14 rounded-full border border-border/50 group-hover:border-primary/50 flex items-center justify-center bg-muted/30 overflow-hidden shadow-inner transition-colors duration-300">
                        {biz.logo_url ? (
                          <img src={biz.logo_url} alt={biz.company_name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <span className="font-extrabold text-lg text-primary">{biz.company_name.charAt(0)}</span>
                        )}
                        {biz.verified && (
                          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-primary border border-card flex items-center justify-center text-[7px] text-white font-bold shadow-md">✓</span>
                        )}
                      </div>
                      
                      <p className="font-extrabold text-xs text-foreground mt-2 truncate w-full leading-none group-hover:text-primary transition-colors">
                        {biz.company_name}
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate w-full mt-1.5 leading-none">
                        {biz.industry || "Merchant"}
                      </p>

                      <div className="flex items-center justify-center gap-0.5 mt-2.5 bg-muted/40 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-amber-500">
                        <span>★</span>
                        <span className="text-foreground">{biz.reputation_score ? biz.reputation_score.toFixed(1) : "5.0"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discover Products Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Discover Items</h3>
                <span className="text-[10px] font-bold text-muted-foreground leading-none">{filteredProducts.length} items</span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="bg-card border border-border/40 rounded-[32px] text-center py-12 px-4 shadow-sm w-full">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground opacity-20" />
                  <h4 className="mt-3 font-bold text-foreground text-sm">No items match filters</h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Try adjusting your price range, distance, or type filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredProducts.map((item) => {
                    const isImageOk = item.image_verified !== false;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleCatalogPitch(item.business.id, item.business.company_name, item.name, typeof item.price === "number" ? item.price : null)}
                        className="group flex flex-col bg-card border border-border/30 hover:border-primary/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square w-full bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden shadow-inner shrink-0">
                          {isImageOk ? (
                            item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted/20">
                                <Package className="h-6 w-6 text-muted-foreground/40" />
                              </div>
                            )
                          ) : (
                            /* Unverified Image Premium Placeholder */
                            <div className="flex flex-col h-full w-full items-center justify-center p-3 bg-muted/10 text-center space-y-1">
                              <div className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                              </div>
                              <span className="text-[10px] font-black text-foreground">Verification Pending</span>
                              <span className="text-[8.5px] text-muted-foreground leading-normal max-w-[110px]">Image hidden by moderator</span>
                            </div>
                          )}
                          
                          <div className="absolute top-2 left-2">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                              item.isService 
                                ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                                : "bg-primary/10 border-primary/20 text-primary"
                            )}>
                              {item.isService ? "Service" : "Goods"}
                            </span>
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-[11px] font-mono font-black text-foreground/95 mt-1 leading-none">
                              {typeof item.price === "number" ? `₦${item.price.toLocaleString()}` : item.price}
                            </p>
                          </div>

                          {/* Business info */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-border/10 mt-auto">
                            <div className="h-4.5 w-4.5 rounded-full bg-muted/40 overflow-hidden flex items-center justify-center shrink-0 border border-border/30">
                              {item.business.logo_url ? (
                                <img src={item.business.logo_url} alt={item.business.company_name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[7px] font-extrabold text-primary">{item.business.company_name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-muted-foreground font-semibold truncate flex-1 leading-none">
                              {item.business.company_name}
                            </span>
                            {item.business.verified && (
                              <span className="inline-flex items-center justify-center h-2.5 w-2.5 rounded-full bg-primary text-white text-[5px] font-bold">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Search Feed Layout when searching */
          <div className="space-y-7 animate-fade-in text-left">
            {/* Products Found Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Products Found</h3>
                <span className="text-[10px] font-bold text-primary leading-none">{filteredProducts.length} items</span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="bg-card border border-border/40 rounded-[32px] text-center py-12 px-4 shadow-sm w-full">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground opacity-20" />
                  <p className="mt-2 text-xs text-muted-foreground">No products found matching "{search}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredProducts.map((item) => {
                    const isImageOk = item.image_verified !== false;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleCatalogPitch(item.business.id, item.business.company_name, item.name, typeof item.price === "number" ? item.price : null)}
                        className="group flex flex-col bg-card border border-border/30 hover:border-primary/20 rounded-3xl overflow-hidden shadow-sm hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                      >
                        <div className="relative aspect-square w-full bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden shadow-inner shrink-0">
                          {isImageOk ? (
                            item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted/20">
                                <Package className="h-6 w-6 text-muted-foreground/40" />
                              </div>
                            )
                          ) : (
                            <div className="flex flex-col h-full w-full items-center justify-center p-3 bg-muted/10 text-center space-y-1">
                              <div className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                              </div>
                              <span className="text-[10px] font-black text-foreground">Verification Pending</span>
                              <span className="text-[8.5px] text-muted-foreground leading-normal max-w-[110px]">Image hidden by moderator</span>
                            </div>
                          )}
                          
                          <div className="absolute top-2 left-2">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                              item.isService 
                                ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                                : "bg-primary/10 border-primary/20 text-primary"
                            )}>
                              {item.isService ? "Service" : "Goods"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-[11px] font-mono font-black text-foreground/95 mt-1 leading-none">
                              {typeof item.price === "number" ? `₦${item.price.toLocaleString()}` : item.price}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-2 border-t border-border/10 mt-auto">
                            <div className="h-4.5 w-4.5 rounded-full bg-muted/40 overflow-hidden flex items-center justify-center shrink-0 border border-border/30">
                              {item.business.logo_url ? (
                                <img src={item.business.logo_url} alt={item.business.company_name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[7px] font-extrabold text-primary">{item.business.company_name.charAt(0)}</span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-muted-foreground font-semibold truncate flex-1 leading-none">
                              {item.business.company_name}
                            </span>
                            {item.business.verified && (
                              <span className="inline-flex items-center justify-center h-2.5 w-2.5 rounded-full bg-primary text-white text-[5px] font-bold">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stores Found List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Stores Found</h3>
                <span className="text-[10px] font-bold text-primary leading-none">{filteredBusinesses.length} stores</span>
              </div>
              
              {filteredBusinesses.length === 0 ? (
                <div className="bg-card border border-border/40 rounded-[32px] text-center py-12 px-4 shadow-sm w-full">
                  <Building2 className="mx-auto h-8 w-8 text-muted-foreground opacity-20" />
                  <p className="mt-2 text-xs text-muted-foreground">No stores found matching "{search}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredBusinesses.map((business, index) => {
                    const handleName = business.company_name.toLowerCase().replace(/[^a-z0-9]/g, "");
                    const isSaved = business.is_saved;

                    return (
                      <React.Fragment key={business.id}>
                        {index === 2 && <GamificationBanner />}
                        {index === 6 && <GamificationBanner />}
                        <div 
                          className="bg-card border border-border/30 rounded-[32px] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-300 flex flex-col space-y-4 p-4 animate-fade-in text-left"
                        >
                          <div className="flex items-center justify-between px-1">
                            <div 
                              className="flex items-center gap-3.5 cursor-pointer" 
                              onClick={() => navigate(`/business/${business.id}`)}
                            >
                              <div className="h-11 w-11 rounded-full border border-border/40 bg-muted/50 flex items-center justify-center overflow-hidden">
                                {business.logo_url ? (
                                  <img src={business.logo_url} alt={business.company_name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="font-extrabold text-sm text-primary">{business.company_name.charAt(0)}</span>
                                )}
                              </div>
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
                            
                            {business.distance !== null && (
                              <div className="absolute top-3.5 right-3.5">
                                <span className="bg-background/80 dark:bg-background/90 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-foreground border border-border/25 shadow-sm">
                                  {business.distance < 1 ? `${Math.round(business.distance * 1000)}m` : `${business.distance.toFixed(1)}km away`}
                                </span>
                              </div>
                            )}

                            {searchInsights.find((item) => item.id === business.id)?.ai_match_score !== undefined && (
                              <div className="absolute bottom-3.5 right-3.5">
                                <span className="bg-primary backdrop-blur-md text-[10px] font-extrabold uppercase px-3 py-1 rounded-full text-primary-foreground shadow-lg flex items-center gap-1">
                                  <Zap className="h-3 w-3 animate-pulse" />
                                  {searchInsights.find((item) => item.id === business.id)?.ai_match_score}% Match
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-6 px-1.5">
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

                            <button 
                              onClick={() => startChat(business.id)}
                              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary group transition-colors duration-300"
                            >
                              <PremiumChatBubble className="w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-105" />
                              <span className="text-[10px] font-bold mt-0.75 text-muted-foreground group-hover:text-primary leading-none">
                                {business.total_reviews ? `${business.total_reviews * 3}` : "8"}
                              </span>
                            </button>

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

                          {business.products && business.products.length > 0 && (
                            <div className="px-1.5 py-3 border-y border-border/10">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
                                <Package className="h-3 w-3 text-primary" />
                                Catalog Highlights (Click to Pitch)
                              </p>
                              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
                                {business.products.slice(0, 3).map((prod: any) => (
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

                          <div className="px-1.5 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              {business.industry && (
                                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest leading-none">
                                  {business.industry}
                                </p>
                              )}
                              
                              {business.business_location && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate max-w-[150px]">
                                    {business.business_location.includes(",") && !isNaN(Number(business.business_location.split(",")[0]))
                                      ? "Verified Coordinates"
                                      : business.business_location.split(",")[0]}
                                  </span>
                                  {business.latitude && business.longitude && (
                                    <a
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[9px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      (Google Maps ↗)
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {business.products_services || "A premium local partner dedicated to bringing you the highest standard of products and services."}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Badge Key Bento Blocks */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-3 rounded-2xl text-center space-y-1.5 shadow-sm">
                <span className="bg-yellow-500/15 text-yellow-400 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border border-yellow-500/20 uppercase tracking-wider">
                  Alpha
                </span>
                <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-normal">
                  50+ completed orders on String.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 p-3 rounded-2xl text-center space-y-1.5 shadow-sm">
                <span className="bg-blue-500/15 text-blue-400 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider">
                  Whale
                </span>
                <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-normal">
                  ₦1m+ verified volume transacted.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 p-3 rounded-2xl text-center space-y-1.5 shadow-sm">
                <span className="bg-purple-500/15 text-purple-400 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-wider">
                  Hunter
                </span>
                <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-normal">
                  Top points & saved listings.
                </p>
              </div>
            </div>

            {/* Rankings list */}
            <div className="bg-card border border-border/30 rounded-[32px] overflow-hidden shadow-premium p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 text-left">
                Top Trader Rankings
              </h3>
              <div className="divide-y divide-border/10">
                {[
                  { rank: 1, name: "McLarenauto", handle: "@mclarenauto", volume: "₦4,800,000", badge: "Alpha", badgeColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", rating: "5.0 ★" },
                  { rank: 2, name: "Obsidian Tech & Gear", handle: "@obsidian_tech", volume: "₦2,950,000", badge: "Whale", badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/20", rating: "4.9 ★" },
                  { rank: 3, name: "Crown Braids Salon", handle: "@crown_braids", volume: "₦1,620,000", badge: "Hunter", badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/20", rating: "4.8 ★" },
                  { rank: 4, name: "Aetherial Interiors", handle: "@aetherial_design", volume: "₦980,000", badge: "Whale", badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/20", rating: "4.9 ★" },
                  { rank: 5, name: "Luxe Thread Co.", handle: "@luxethreads", volume: "₦750,000", badge: "Hunter", badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/20", rating: "4.7 ★" }
                ].map((trader) => (
                  <div key={trader.rank} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      {/* Rank Number Circle */}
                      <span className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                        trader.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                        trader.rank === 2 ? "bg-slate-400/20 text-slate-400" :
                        trader.rank === 3 ? "bg-amber-700/20 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {trader.rank}
                      </span>
                      
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {trader.name}
                          <span className={cn("text-[8.5px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-extrabold", trader.badgeColor)}>
                            {trader.badge}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{trader.handle} • {trader.rating}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{trader.volume}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Est. Volume</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
