import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomer, useCustomerStats, useCustomerOrders, useCustomerJobs } from "@/hooks/useCustomer";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Package, Briefcase, Bell, DollarSign, ChevronDown, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PremiumHeart,
  PremiumChatBubble,
  PremiumBookmark,
} from "@/components/ui/custom-icons";

interface FeedItem {
  id: string;
  businessName: string;
  businessHandle: string;
  verified?: boolean;
  imageUrl: string;
  category: string;
  likes: string;
  comments: string;
  bookmarks: string;
  hasLiked?: boolean;
  hasBookmarked?: boolean;
  isFollowing?: boolean;
  aspectRatio: string;
}

export default function CustomerOverview() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { data: customer } = useCustomer();
  const { data: stats, isLoading: statsLoading } = useCustomerStats(customer?.id);
  const { data: orders = [] } = useCustomerOrders(customer?.id);
  const { data: jobs = [] } = useCustomerJobs(customer?.id);

  const activeOrders = orders.filter(o =>
    ["pending", "confirmed", "processing", "shipped"].includes(o.status)
  ).slice(0, 3);

  const activeJobs = jobs.filter(j =>
    ["requested", "quoted", "accepted", "ongoing"].includes(j.status)
  ).slice(0, 3);

  const statCards = [
    {
      label: "Active Orders",
      value: stats?.activeOrders || 0,
      icon: Package,
      onClick: () => navigate("/customer/orders"),
      highlight: (stats?.activeOrders || 0) > 0,
    },
    {
      label: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      onClick: () => navigate("/customer/jobs"),
      highlight: (stats?.activeJobs || 0) > 0,
    },
    {
      label: "Saved Businesses",
      value: stats?.savedBusinesses || 0,
      icon: Heart,
      onClick: () => navigate("/customer/saved"),
    },
    {
      label: "Total Spent",
      value: `₦${(stats?.totalSpent || 0).toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getJobStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      requested: "secondary",
      quoted: "default",
      accepted: "default",
      ongoing: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchPersonalizedFeed = async () => {
      let userInterests: string[] = [];
      let preferredCats: string[] = [];

      if (user) {
        const { data: customer } = await supabase
          .from("customers")
          .select("interests, preferred_categories")
          .eq("user_id", user.id)
          .maybeSingle();

        if (customer) {
          userInterests = customer.interests || [];
          preferredCats = customer.preferred_categories || [];
        }
      }

      // High-Fidelity Pinterest Mock Feed Items
      const rawFeed: FeedItem[] = [
        {
          id: "mclaren-supercar",
          businessName: "McLarenauto",
          businessHandle: "@mclarenauto",
          verified: true,
          imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
          category: "Automotive",
          likes: "1.8m",
          comments: "8k",
          bookmarks: "412k",
          aspectRatio: "aspect-[4/3]",
        },
        {
          id: "luxury-interior",
          businessName: "Aetherial Interiors",
          businessHandle: "@aetherial_design",
          verified: true,
          imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
          category: "Home & Decor",
          likes: "142k",
          comments: "2.4k",
          bookmarks: "56k",
          aspectRatio: "aspect-[3/4]",
        },
        {
          id: "braids-hair",
          businessName: "Crown Braids Salon",
          businessHandle: "@crown_braids",
          verified: false,
          imageUrl: "https://images.unsplash.com/photo-1620331350335-96a2f8c5b058?auto=format&fit=crop&q=80&w=800",
          category: "Hair & Beauty",
          likes: "95k",
          comments: "3k",
          bookmarks: "15k",
          aspectRatio: "aspect-square",
        },
        {
          id: "tech-setup",
          businessName: "Obsidian Tech & Gear",
          businessHandle: "@obsidian_tech",
          verified: true,
          imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800",
          category: "Electronics",
          likes: "120k",
          comments: "4.5k",
          bookmarks: "24k",
          aspectRatio: "aspect-[4/5]",
        },
        {
          id: "food-plating",
          businessName: "Gourmet Studio",
          businessHandle: "@gourmet_studio",
          verified: false,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
          category: "Food & Drinks",
          likes: "18k",
          comments: "400",
          bookmarks: "2.1k",
          aspectRatio: "aspect-[3/2]",
        },
        {
          id: "fashion-apparel",
          businessName: "Luxe Thread Co.",
          businessHandle: "@luxethreads",
          verified: true,
          imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
          category: "Fashion",
          likes: "250k",
          comments: "6.2k",
          bookmarks: "78k",
          aspectRatio: "aspect-[3/4]",
        }
      ];

      // Shuffle the feed items first to keep layouts fresh on reload/comeback
      const shuffledFeed = [...rawFeed];
      for (let i = shuffledFeed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledFeed[i], shuffledFeed[j]] = [shuffledFeed[j], shuffledFeed[i]];
      }

      // Personalization logic: Sort items matching interests or categories to the top
      const sortedFeed = shuffledFeed.sort((a, b) => {
        const aMatchesInterest = userInterests.some(interest => a.category.toLowerCase().includes(interest.toLowerCase())) ||
                               preferredCats.some(cat => a.category.toLowerCase().includes(cat.toLowerCase()));
        const bMatchesInterest = userInterests.some(interest => b.category.toLowerCase().includes(interest.toLowerCase())) ||
                               preferredCats.some(cat => b.category.toLowerCase().includes(cat.toLowerCase()));

        if (aMatchesInterest && !bMatchesInterest) return -1;
        if (!aMatchesInterest && bMatchesInterest) return 1;
        return 0;
      });

      setFeedItems(sortedFeed);
    };

    fetchPersonalizedFeed();
  }, [user]);

  const handleFollowToggle = (id: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFollowing: !item.isFollowing } : item
      )
    );
  };

  const handleLikeToggle = (id: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              hasLiked: !item.hasLiked,
              likes: item.hasLiked ? "1.8m" : "1.8m", // simplistic UI count representation
            }
          : item
      )
    );
  };

  const handleBookmarkToggle = (id: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, hasBookmarked: !item.hasBookmarked } : item
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 pb-12">
        {/* Subheader Navigation: For You vs Following */}
        <div className="flex items-center justify-center gap-6 border-b border-border/10 pb-3 relative">
          <div className="relative">
            <button
              onClick={() => {
                setActiveTab("for-you");
                setFilterDropdownOpen(!filterDropdownOpen);
              }}
              className={cn(
                "text-sm font-medium tracking-wide flex items-center gap-1 transition-colors",
                activeTab === "for-you" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              For you
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            
            {filterDropdownOpen && (
              <div className="absolute top-7 left-0 bg-card border border-border/40 rounded-2xl p-2.5 shadow-xl w-36 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <button
                  onClick={() => {
                    setActiveTab("for-you");
                    setFilterDropdownOpen(false);
                  }}
                  className="w-full text-left text-xs p-1.5 rounded-lg hover:bg-muted/50 font-medium"
                >
                  Personalized
                </button>
                <button
                  onClick={() => {
                    setActiveTab("for-you");
                    setFilterDropdownOpen(false);
                    toast.info("Trending categories sorted!");
                  }}
                  className="w-full text-left text-xs p-1.5 rounded-lg hover:bg-muted/50 font-medium"
                >
                  Trending
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("following")}
            className={cn(
              "text-sm font-medium tracking-wide transition-colors",
              activeTab === "following" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Following
          </button>
        </div>

        {/* Home Feed Display */}
        {activeTab === "following" && feedItems.filter(item => item.isFollowing).length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Not following anyone yet</p>
            <p className="text-xs text-muted-foreground/75">Explore the "For you" feed to discover creators</p>
            <Button
              onClick={() => setActiveTab("for-you")}
              variant="outline"
              className="rounded-full px-5 py-2 text-xs font-semibold"
            >
              Explore Feed
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Featured Post - McLaren (matching Image 1) */}
            {feedItems.length > 0 && activeTab === "for-you" && (
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border/20">
                      {feedItems[0].imageUrl ? (
                        <img
                          src={feedItems[0].imageUrl}
                          alt={feedItems[0].businessName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-sm text-foreground/80">{feedItems[0].businessName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm text-foreground">{feedItems[0].businessName}</span>
                        {feedItems[0].verified && (
                          <span className="h-3.5 w-3.5 bg-teal-500/20 text-teal-600 rounded-full flex items-center justify-center text-[9px] font-bold">✓</span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{feedItems[0].businessHandle}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFollowToggle(feedItems[0].id)}
                    className={cn(
                      "rounded-full text-xs font-semibold px-4 h-7.5 transition-all duration-300",
                      feedItems[0].isFollowing
                        ? "bg-muted text-muted-foreground border border-border/20 hover:bg-muted/80"
                        : "bg-[#D08F8F] text-white hover:bg-[#D08F8F]/95 shadow-sm"
                    )}
                  >
                    {feedItems[0].isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>

                {/* Supercar Visual Banner Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] border border-border/30 shadow-md">
                  <img
                    src={feedItems[0].imageUrl}
                    alt={feedItems[0].businessName}
                    className="w-full object-cover aspect-[4/3] hover:scale-101 transition-transform duration-500"
                  />
                </div>

                {/* Social Interaction Bar */}
                <div className="flex items-center gap-4 px-1.5 pt-1 text-muted-foreground">
                  <button
                    onClick={() => handleLikeToggle(feedItems[0].id)}
                    className="flex items-center gap-1.5 group active:scale-95 transition-transform"
                  >
                    <PremiumHeart active={feedItems[0].hasLiked} className={cn("transition-colors", feedItems[0].hasLiked && "text-red-500")} />
                    <span className="text-[11.5px] font-medium tracking-wide">{feedItems[0].likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-foreground">
                    <PremiumChatBubble />
                    <span className="text-[11.5px] font-medium tracking-wide">{feedItems[0].comments}</span>
                  </button>
                  <button
                    onClick={() => handleBookmarkToggle(feedItems[0].id)}
                    className="flex items-center gap-1.5 group active:scale-95 transition-transform ml-auto"
                  >
                    <PremiumBookmark active={feedItems[0].hasBookmarked} className={cn("transition-colors", feedItems[0].hasBookmarked && "text-primary")} />
                    <span className="text-[11.5px] font-medium tracking-wide">{feedItems[0].bookmarks}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Masonry Double Column Grid (for other items, e.g. Braids and Home Interior) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Column 1 */}
              <div className="space-y-4">
                {feedItems
                  .filter((item, idx) => (activeTab === "for-you" ? idx % 2 === 1 : item.isFollowing && idx % 2 === 1))
                  .map(item => (
                    <div key={item.id} className="space-y-2 group cursor-pointer">
                      <div className="relative overflow-hidden rounded-[2rem] border border-border/30 shadow-sm">
                        <img src={item.imageUrl} alt={item.businessName} className="w-full object-cover aspect-[3/4]" />
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</span>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                {feedItems
                  .filter((item, idx) => (activeTab === "for-you" ? idx % 2 === 0 && idx > 0 : item.isFollowing && idx % 2 === 0 && idx > 0))
                  .map(item => (
                    <div key={item.id} className="space-y-2 group cursor-pointer">
                      <div className="relative overflow-hidden rounded-[2rem] border border-border/30 shadow-sm">
                        <img src={item.imageUrl} alt={item.businessName} className="w-full object-cover aspect-square" />
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</span>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

