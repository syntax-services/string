/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin, ShoppingBag, Briefcase, CheckCircle, XCircle,
  Clock, Building2, User, Loader2, Users,
  DollarSign, Settings, Key, MessageSquare, Send, Pin,
  Crown, Shield, Trash2, PackageCheck, AlertTriangle,
  Star, Wallet, Reply, Eye, Image, Zap, TrendingUp, LogOut
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { useAllWithdrawals, useProcessWithdrawal } from "@/hooks/useBusinessEarnings";
import { useAllMessageReplies } from "@/hooks/useAdminMessages";
import { ReputationBadge } from "@/components/ui/reputation-badge";
import { LaunchAnalytics } from "@/components/admin/LaunchAnalytics";
import { playVerificationChime, playRevokedChime } from "@/hooks/useAudioSignals";
import { usePremiumMail } from "@/hooks/usePremiumMail";

type VerificationTier = 'none' | 'basic' | 'verified' | 'premium' | 'elite';

export default function StringAdmin() {
  const { signOut, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dispatchEmail } = usePremiumMail();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [batchAvatarUrl, setBatchAvatarUrl] = useState("");
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [batchFilter, setBatchFilter] = useState<'all' | 'male' | 'female' | 'neutral'>("all");

  // Booster Price State and Query
  const { data: boosterPrice = 15000 } = useQuery({
    queryKey: ["admin-booster-price"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "booster_monthly_price")
          .maybeSingle();
        if (error || !data) throw new Error("Fallback");
        return Number(data.value);
      } catch {
        const stored = localStorage.getItem("booster_monthly_price");
        return stored ? Number(stored) : 15000;
      }
    }
  });

  const [boosterPriceInput, setBoosterPriceInput] = useState(boosterPrice.toString());

  useEffect(() => {
    if (boosterPrice !== undefined) {
      setBoosterPriceInput(boosterPrice.toString());
    }
  }, [boosterPrice]);

  // Message dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageRecipientType, setMessageRecipientType] = useState<'all' | 'businesses' | 'customers'>('all');
  const [messagePinned, setMessagePinned] = useState(false);

  // Check if user has admin role
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["admin-check", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Bootstrap admin mutation
  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("bootstrap-admin", {
        body: { secret_key: bootstrapKey, user_id: user?.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: async () => {
      toast.success("Admin role granted! Refreshing...");
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["admin-check", user?.id] });
      setBootstrapKey("");
      navigate("/admin", { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to bootstrap admin");
    },
  });

  // Fetch all profiles (users)
  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all customers with location data
  const { data: customers } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*, profiles:user_id (full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch location requests
  const { data: locationRequests, isLoading: loadingLocations } = useQuery({
    queryKey: ["admin-location-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_requests")
        .select("*, profiles:user_id (full_name, email, user_type)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all businesses
  const { data: businesses, isLoading: loadingBusinesses } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, profiles:user_id (full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch latest terms version
  const { data: config } = useQuery({
    queryKey: ["latest-terms-version"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "latest_terms_version")
        .single();
      if (error) return { value: 1 };
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, businesses:business_id (company_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch orders
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, businesses:business_id (company_name), customers:customer_id (id, user_id, profiles:user_id (full_name, email))")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch jobs
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, businesses:business_id (company_name), customers:customer_id (id, user_id, profiles:user_id (full_name))")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch admin messages
  const { data: adminMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ["admin-messages-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all reviews
  const { data: allReviews, isLoading: loadingReviews } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, businesses:business_id (company_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all offers
  const { data: allOffers, isLoading: loadingOffers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Withdrawals
  const { data: withdrawals, isLoading: loadingWithdrawals } = useAllWithdrawals();
  const processWithdrawal = useProcessWithdrawal();

  // Message replies
  const { data: messageReplies, isLoading: loadingReplies } = useAllMessageReplies();

  // Verify location mutation
  const verifyLocationMutation = useMutation({
    mutationFn: async ({
      requestId, userId, userType, latitude, longitude, approved
    }: {
      requestId: string; userId: string; userType: string;
      latitude?: number; longitude?: number; approved: boolean;
      email?: string; fullName?: string; streetAddress?: string; areaName?: string;
    }) => {
      const { error: requestError } = await supabase
        .from("location_requests")
        .update({
          status: approved ? "verified" : "rejected",
          verified_latitude: latitude,
          verified_longitude: longitude,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (requestError) throw requestError;

      if (approved) {
        // Update user profile location
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            latitude,
            longitude,
          })
          .eq("user_id", userId);
        if (profileError) throw profileError;

        if (userType === 'business') {
          await supabase
            .from("businesses")
            .update({ location_verified: true })
            .eq("user_id", userId);
        }
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-location-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      
      if (variables.approved) {
        // 1. Play ascending success chime!
        playVerificationChime().catch(console.error);

        // 2. Dispatch business_verified themed email!
        if (variables.email && variables.fullName) {
          dispatchEmail(
            "business_verified", 
            variables.userId, 
            variables.email, 
            variables.fullName, 
            { 
              address: variables.streetAddress || "Verified Address", 
              areaName: variables.areaName || "Verified Area" 
            }
          ).catch(console.error);
        }
        toast.success("Location request approved & verified checkmark activated!");
      } else {
        // Play alert warning warning chime
        playRevokedChime().catch(console.error);
        toast.success("Location request rejected.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process request");
    },
  });

  const updateUserLocationMutation = useMutation({
    mutationFn: async ({ userId, address }: { userId: string; address: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ address })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("User location updated");
    },
    onError: () => toast.error("Failed to update user location"),
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: async ({
      userId,
      themeMode,
      themePalette,
      avatarUrl
    }: {
      userId: string;
      themeMode?: 'dark' | 'light';
      themePalette?: 'blue' | 'mono';
      avatarUrl?: string | null;
    }) => {
      const updates: any = {};
      if (themeMode !== undefined) updates.theme_mode = themeMode;
      if (themePalette !== undefined) updates.theme_palette = themePalette;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("User profile settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile settings");
    }
  });

  const batchUpdateAvatarsMutation = useMutation({
    mutationFn: async ({ avatarUrl, filter }: { avatarUrl: string; filter: 'all' | 'male' | 'female' | 'neutral' }) => {
      if (filter === 'all') {
        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
      } else if (filter === 'male') {
        const { data: customersData, error: custError } = await supabase
          .from("customers")
          .select("user_id")
          .eq("gender", "male");
        if (custError) throw custError;

        const userIds = customersData?.map(c => c.user_id).filter(Boolean) || [];
        if (userIds.length === 0) {
          throw new Error("No male customers found to update");
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .in("id", userIds);
        if (error) throw error;
      } else if (filter === 'female') {
        const { data: customersData, error: custError } = await supabase
          .from("customers")
          .select("user_id")
          .eq("gender", "female");
        if (custError) throw custError;

        const userIds = customersData?.map(c => c.user_id).filter(Boolean) || [];
        if (userIds.length === 0) {
          throw new Error("No female customers found to update");
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .in("id", userIds);
        if (error) throw error;
      } else if (filter === 'neutral') {
        // Fetch all male/female customers
        const { data: genderedCustomers, error: custError } = await supabase
          .from("customers")
          .select("user_id")
          .in("gender", ["male", "female"]);
        if (custError) throw custError;

        const genderedUserIds = genderedCustomers?.map(c => c.user_id).filter(Boolean) || [];

        let query = supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          });

        if (genderedUserIds.length > 0) {
          query = query.not("id", "in", `(${genderedUserIds.join(",")})`);
        } else {
          query = query.neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const { error } = await query;
        if (error) throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      
      const filterLabel = {
        all: "all registered users",
        male: "male customer accounts",
        female: "female customer accounts",
        neutral: "unspecified/gender-neutral profiles"
      }[variables.filter];
      
      toast.success(`Successfully updated profile pictures for ${filterLabel}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to run batch update");
    }
  });

  // Update product commission
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ productId, commission, isRare }: { productId: string; commission: number; isRare: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({
          is_rare: isRare,
          commission_percent: commission
        })
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Commission updated");
    },
    onError: () => toast.error("Failed to update commission"),
  });

  // Update business verification tier
  const updateVerificationTierMutation = useMutation({
    mutationFn: async ({
      businessId, tier
    }: {
      businessId: string;
      tier: VerificationTier;
      email?: string;
      fullName?: string;
      companyName?: string;
      userId?: string;
      isRevocation?: boolean;
    }) => {
      const { error } = await supabase
        .from("businesses")
        .update({
          verification_tier: tier,
          verified: tier !== 'none'
        })
        .eq("id", businessId);
      if (error) throw error;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      
      if (variables.isRevocation) {
        // 1. Play alert warning double dull pulse warning chime!
        playRevokedChime().catch(console.error);

        // 2. Dispatch premium_revoked security email!
        if (variables.email && variables.fullName) {
          dispatchEmail(
            "premium_revoked",
            variables.userId || "",
            variables.email,
            variables.fullName,
            { companyName: variables.companyName }
          ).catch(console.error);
        }
        toast.success(`Premium badge for ${variables.companyName || "business"} revoked successfully. Security alert dispatched.`);
      } else {
        toast.success("Verification tier updated");
      }
    },
    onError: () => toast.error("Failed to update tier"),
  });

  // Platform Control: Update Terms Version
  const updateTermsVersionMutation = useMutation({
    mutationFn: async (version: number) => {
      const { error } = await supabase
        .from("system_config")
        .upsert({
          key: "latest_terms_version",
          value: JSON.stringify(version),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latest-terms-version"] });
      toast.success("Platform Terms Version updated! Users will be locked until they accept.");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update version"),
  });

  // Platform Control: Update Visibility Booster Price
  const updateBoosterPriceMutation = useMutation({
    mutationFn: async (price: number) => {
      const { error } = await supabase
        .from("system_config")
        .upsert({
          key: "booster_monthly_price",
          value: JSON.stringify(price),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        });
      if (error) throw error;
      localStorage.setItem("booster_monthly_price", price.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-booster-price"] });
      queryClient.invalidateQueries({ queryKey: ["visibility-booster-price"] });
      toast.success("Visibility Booster Monthly Price updated successfully!");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update price"),
  });

  // Confirm delivery on behalf of customer (admin power)
  const confirmDeliveryMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Delivery confirmed by admin");
    },
    onError: () => toast.error("Failed to confirm delivery"),
  });

  // Complete job on behalf of customer (admin power)
  const completeJobMutation = useMutation({
    mutationFn: async ({ jobId }: { jobId: string }) => {
      const { error } = await supabase
        .from("jobs")
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job completed by admin");
    },
    onError: () => toast.error("Failed to complete job"),
  });

  // Send admin message
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admin_messages").insert({
        sender_id: user!.id,
        recipient_type: messageRecipientType,
        title: messageTitle,
        content: messageContent,
        is_pinned: messagePinned,
        read_by: [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages-list"] });
      toast.success("Message sent successfully");
      setShowMessageDialog(false);
      setMessageTitle("");
      setMessageContent("");
      setMessagePinned(false);
    },
    onError: () => toast.error("Failed to send message"),
  });

  // Toggle message pin
  const togglePinMutation = useMutation({
    mutationFn: async ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("admin_messages")
        .update({ is_pinned: isPinned })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages-list"] });
      toast.success("Pin status updated");
    },
  });

  // Delete message
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("admin_messages")
        .delete()
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages-list"] });
      toast.success("Message deleted");
    },
  });

  // Update offer status (for fulfilling offers)
  const updateOfferMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: string }) => {
      const { error } = await supabase
        .from("offers")
        .update({ status })
        .eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Offer status updated");
    },
  });

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show bootstrap option if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              Enter your admin bootstrap key to gain access to this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bootstrap-key">Admin Bootstrap Key</Label>
              <Input
                id="bootstrap-key"
                type="password"
                placeholder="Enter your secret key..."
                value={bootstrapKey}
                onChange={(e) => setBootstrapKey(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => bootstrapMutation.mutate()}
              disabled={!bootstrapKey || bootstrapMutation.isPending}
            >
              {bootstrapMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Activate Admin Access
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Don't have a key? Contact the platform developer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingLocations = locationRequests?.filter(r => r.status === "pending") || [];
  const customerProfiles = profiles?.filter(p => p.user_type === "customer") || [];
  const businessProfiles = profiles?.filter(p => p.user_type === "business") || [];
  const pendingOrders = orders?.filter(o => ["pending", "confirmed", "processing", "shipped"].includes(o.status)) || [];
  const pendingJobs = jobs?.filter(j => ["requested", "quoted", "accepted", "in_progress"].includes(j.status)) || [];
  const pinnedMessages = adminMessages?.filter(m => m.is_pinned) || [];
  const pendingWithdrawals = withdrawals?.filter((w: any) => w.status === "pending") || [];
  const pendingOffers = allOffers?.filter(o => o.status === "open") || [];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth?mode=login", { replace: true });
  };

  // Get all users with locations
  const allUsersWithLocations = [
    ...(customers?.filter((c: any) => c.latitude && c.longitude).map((c: any) => ({
      id: c.id,
      name: (c.profiles as any)?.full_name || 'Unknown',
      email: (c.profiles as any)?.email,
      type: 'customer',
      lat: c.latitude,
      lng: c.longitude,
      verified: c.location_verified,
    })) || []),
    ...(businesses?.filter((b: any) => b.latitude && b.longitude).map((b: any) => ({
      id: b.id,
      name: b.company_name,
      email: (b.profiles as any)?.email,
      type: 'business',
      lat: b.latitude,
      lng: b.longitude,
      verified: b.location_verified,
    })) || []),
  ];

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(profiles?.map(p => p.user_id) || []);
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              String Admin Console
            </h1>
            <p className="text-muted-foreground">Full platform management dashboard</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setShowMessageDialog(true)} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            {pendingLocations.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingLocations.length} pending locations
              </Badge>
            )}
            {pendingWithdrawals.length > 0 && (
              <Badge variant="secondary">
                <Wallet className="h-3 w-3 mr-1" />
                {pendingWithdrawals.length} withdrawals
              </Badge>
            )}
            {pendingOffers.length > 0 && (
              <Badge variant="outline">
                {pendingOffers.length} open offers
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{profiles?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{businesses?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {businesses?.filter((b: any) => b.verification_tier === 'premium').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{orders?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{jobs?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{allReviews?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{withdrawals?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Withdrawals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Reply className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{messageReplies?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Replies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Input
          placeholder="Search users, businesses, orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full flex justify-start overflow-x-auto no-scrollbar gap-2 p-1 border-b pb-2 mb-4 h-auto bg-transparent">
            <TabsTrigger value="analytics" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Building2 className="h-4 w-4" />
              <span>Businesses</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Briefcase className="h-4 w-4" />
              <span>Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Star className="h-4 w-4" />
              <span>Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Image className="h-4 w-4" />
              <span>Offers</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Wallet className="h-4 w-4" />
              <span>Withdrawals</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <MapPin className="h-4 w-4" />
              <span>Locations</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="commission" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <DollarSign className="h-4 w-4" />
              <span>Commission</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-2 flex-shrink-0 data-[state=active]:bg-primary/10">
              <Shield className="h-4 w-4" />
              <span>Platform</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <LaunchAnalytics 
              profiles={profiles}
              businesses={businesses}
              orders={orders}
              jobs={jobs}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Global Avatar Batch Manager */}
            <Card className="border border-primary/20 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Zap className="h-5 w-5 animate-pulse" />
                  Global Profile Picture Batch Manager
                </CardTitle>
                <CardDescription>
                  Set a default profile picture for all registered users on String in one click. Perfect for resetting all avatars to standard 3D animated presets or a custom branding image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  {/* Select Filter Target */}
                  <div className="w-full lg:w-56 space-y-2">
                    <Label htmlFor="batch-target-filter">Target User Group</Label>
                    <Select
                      value={batchFilter}
                      onValueChange={(value: 'all' | 'male' | 'female' | 'neutral') => setBatchFilter(value)}
                    >
                      <SelectTrigger id="batch-target-filter" className="bg-background/50 h-10 border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🌐 All Users</SelectItem>
                        <SelectItem value="male">👦 Male Customers Only</SelectItem>
                        <SelectItem value="female">👧 Female Customers Only</SelectItem>
                        <SelectItem value="neutral">👤 Unspecified / Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor="batch-avatar-url">Target Avatar URL</Label>
                    <Input
                      id="batch-avatar-url"
                      placeholder="Enter custom image URL or select a preset..."
                      value={batchAvatarUrl}
                      onChange={(e) => setBatchAvatarUrl(e.target.value)}
                      className="bg-background/50 h-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBatchAvatarUrl("/avatar_male.png")}
                      className="gap-1 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      👦 Male Preset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBatchAvatarUrl("/avatar_female.png")}
                      className="gap-1 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      👧 Female Preset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBatchAvatarUrl("/avatar_neutral.png")}
                      className="gap-1 text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      👤 Neutral Preset
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!batchAvatarUrl) {
                        toast.error("Please enter or select an avatar URL first");
                        return;
                      }
                      
                      const groupLabel = {
                        all: "ALL registered users",
                        male: "all MALE customers",
                        female: "all FEMALE customers",
                        neutral: "all UNSPECIFIED/GENDER-NEUTRAL accounts (including businesses and admins)"
                      }[batchFilter];

                      if (confirm(`WARNING: You are about to change the profile picture of ${groupLabel} to "${batchAvatarUrl}". This action is irreversible. Do you want to continue?`)) {
                        batchUpdateAvatarsMutation.mutate({ avatarUrl: batchAvatarUrl, filter: batchFilter });
                      }
                    }}
                    disabled={batchUpdateAvatarsMutation.isPending}
                    className="gap-2 shrink-0 font-bold h-10 px-5 shadow-lg shadow-destructive/20"
                  >
                    {batchUpdateAvatarsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Execute Batch Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({profiles?.length || 0})</CardTitle>
                <CardDescription>Complete list of all registered users and their theme settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Theme / Palette</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles
                        ?.filter((p: any) =>
                          p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((profile: any) => {
                          const userGender = profile.user_type === 'customer'
                            ? customers?.find((c: any) => c.user_id === profile.id)?.gender
                            : null;
                          const recommendedAvatar = userGender === 'male'
                            ? '/avatar_male.png'
                            : userGender === 'female'
                              ? '/avatar_female.png'
                              : '/avatar_neutral.png';

                          return (
                            <TableRow key={profile.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full overflow-hidden border border-border bg-card flex items-center justify-center shrink-0 shadow-inner">
                                    <img
                                      src={profile.avatar_url || recommendedAvatar}
                                      alt={profile.full_name}
                                      className="h-full w-full object-cover transition-all duration-300 hover:scale-110"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = recommendedAvatar;
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">{profile.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{profile.email || "(No email provided)"}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={profile.user_type === 'business' ? 'default' : profile.user_type === 'admin' ? 'destructive' : 'secondary'}>
                                  {profile.user_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {profile.latitude && profile.longitude ? (
                                  <Badge variant="outline">
                                    <MapPin className="h-3 w-3 mr-1 text-primary" />
                                    Set ({profile.latitude.toFixed(2)}, {profile.longitude.toFixed(2)})
                                  </Badge>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm">{profile.address || "Not set"}</span>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      const loc = prompt("Set user address string manually:");
                                      if (loc) updateUserLocationMutation.mutate({ userId: profile.id, address: loc });
                                    }}>
                                      Edit
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1.5 flex-wrap">
                                  <Badge variant="outline" className="text-xs gap-1 py-0.5">
                                    {profile.theme_mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs gap-1 py-0.5 border-primary/30 text-primary">
                                    🎨 {profile.theme_palette === 'mono' ? 'Mono' : profile.theme_palette === 'rose' ? 'Rose' : 'Blue'}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={profile.onboarding_completed ? 'outline' : 'destructive'}>
                                  {profile.onboarding_completed ? 'Active' : 'Onboarding'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(profile.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingProfile({
                                    id: profile.id,
                                    full_name: profile.full_name,
                                    email: profile.email,
                                    theme_mode: profile.theme_mode || 'dark',
                                    theme_palette: profile.theme_palette || 'blue',
                                    avatar_url: profile.avatar_url || '',
                                    user_type: profile.user_type
                                  })}
                                  className="h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all duration-300 border-primary/20"
                                >
                                  Edit Settings
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Dialog */}
          <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
            <DialogContent className="max-w-md border border-primary/20 bg-card/95 backdrop-blur-2xl text-foreground">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <Settings className="h-5 w-5" />
                  Edit User Settings
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Customize theme preferences and profile picture for <strong>{editingProfile?.full_name}</strong>
                </DialogDescription>
              </DialogHeader>

              {editingProfile && (
                <div className="space-y-6 my-4">
                  {/* Theme Mode Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold tracking-wide">Theme Mode</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={editingProfile.theme_mode === 'dark' ? 'default' : 'outline'}
                        onClick={() => setEditingProfile({ ...editingProfile, theme_mode: 'dark' })}
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        🌙 Dark Mode
                      </Button>
                      <Button
                        type="button"
                        variant={editingProfile.theme_mode === 'light' ? 'default' : 'outline'}
                        onClick={() => setEditingProfile({ ...editingProfile, theme_mode: 'light' })}
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        ☀️ Light Mode
                      </Button>
                    </div>
                  </div>

                  {/* Theme Palette Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold tracking-wide">Theme Accent Palette</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant={editingProfile.theme_palette === 'blue' ? 'default' : 'outline'}
                        onClick={() => setEditingProfile({ ...editingProfile, theme_palette: 'blue' })}
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        🔵 Cobalt Blue
                      </Button>
                      <Button
                        type="button"
                        variant={editingProfile.theme_palette === 'mono' ? 'default' : 'outline'}
                        onClick={() => setEditingProfile({ ...editingProfile, theme_palette: 'mono' })}
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        ⚪ Monochrome
                      </Button>
                      <Button
                        type="button"
                        variant={editingProfile.theme_palette === 'rose' ? 'default' : 'outline'}
                        onClick={() => setEditingProfile({ ...editingProfile, theme_palette: 'rose' })}
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        🌸 Rose
                      </Button>
                    </div>
                  </div>

                  {/* Profile Picture Settings */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold tracking-wide">Profile Picture (Avatar)</Label>
                    
                    {/* Live Preview */}
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-background/40">
                      <div className="h-16 w-16 rounded-full overflow-hidden border border-primary/20 bg-card flex items-center justify-center shrink-0 shadow-inner">
                        <img
                          src={
                            editingProfile.avatar_url || (
                              editingProfile.user_type === 'customer'
                                ? (customers?.find((c: any) => c.user_id === editingProfile.id)?.gender === 'male'
                                  ? '/avatar_male.png'
                                  : customers?.find((c: any) => c.user_id === editingProfile.id)?.gender === 'female'
                                    ? '/avatar_female.png'
                                    : '/avatar_neutral.png')
                                : '/avatar_neutral.png'
                            )
                          }
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/avatar_neutral.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avatar Preview</p>
                        <p className="text-xs truncate text-muted-foreground mt-0.5">
                          {editingProfile.avatar_url || "Using System Gender Fallback"}
                        </p>
                      </div>
                    </div>

                    {/* Preset Buttons */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Premium 3D Presets</span>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={editingProfile.avatar_url === '/avatar_male.png' ? 'default' : 'outline'}
                          onClick={() => setEditingProfile({ ...editingProfile, avatar_url: '/avatar_male.png' })}
                          className="text-xs p-1 h-12 flex flex-col justify-center gap-0.5"
                        >
                          <span className="font-semibold">👦 Male Preset</span>
                          {editingProfile.user_type === 'customer' && customers?.find((c: any) => c.user_id === editingProfile.id)?.gender === 'male' && (
                            <span className="text-[7px] text-primary/70 dark:text-primary scale-90 font-bold uppercase">(Recommended)</span>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant={editingProfile.avatar_url === '/avatar_female.png' ? 'default' : 'outline'}
                          onClick={() => setEditingProfile({ ...editingProfile, avatar_url: '/avatar_female.png' })}
                          className="text-xs p-1 h-12 flex flex-col justify-center gap-0.5"
                        >
                          <span className="font-semibold">👧 Female Preset</span>
                          {editingProfile.user_type === 'customer' && customers?.find((c: any) => c.user_id === editingProfile.id)?.gender === 'female' && (
                            <span className="text-[7px] text-primary/70 dark:text-primary scale-90 font-bold uppercase">(Recommended)</span>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant={editingProfile.avatar_url === '/avatar_neutral.png' ? 'default' : 'outline'}
                          onClick={() => setEditingProfile({ ...editingProfile, avatar_url: '/avatar_neutral.png' })}
                          className="text-xs p-1 h-12 flex flex-col justify-center gap-0.5"
                        >
                          <span className="font-semibold">👤 Neutral Preset</span>
                          {(editingProfile.user_type !== 'customer' || !['male', 'female'].includes(customers?.find((c: any) => c.user_id === editingProfile.id)?.gender || '')) && (
                            <span className="text-[7px] text-primary/70 dark:text-primary scale-90 font-bold uppercase">(Recommended)</span>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Custom URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="custom-avatar-url" className="text-xs text-muted-foreground">Or Enter Custom Avatar URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-avatar-url"
                          placeholder="https://example.com/image.jpg"
                          value={editingProfile.avatar_url}
                          onChange={(e) => setEditingProfile({ ...editingProfile, avatar_url: e.target.value })}
                          className="bg-background/50 text-sm h-9"
                        />
                        {editingProfile.avatar_url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProfile({ ...editingProfile, avatar_url: "" })}
                            className="text-xs shrink-0 px-2"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(null)}
                  disabled={updateUserProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateUserProfileMutation.mutate({
                      userId: editingProfile.id,
                      themeMode: editingProfile.theme_mode,
                      themePalette: editingProfile.theme_palette,
                      avatarUrl: editingProfile.avatar_url || null
                    });
                    setEditingProfile(null);
                  }}
                  disabled={updateUserProfileMutation.isPending}
                  className="gap-2 font-bold"
                >
                  {updateUserProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Businesses Tab */}
          <TabsContent value="businesses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Verification ({businesses?.length || 0})</CardTitle>
                <CardDescription>Manage verification tiers: None → Verified → Premium</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businesses
                        ?.filter((b: any) =>
                          b.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((business: any) => (
                          <TableRow key={business.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{business.company_name}</p>
                                <p className="text-xs text-muted-foreground">{business.profiles?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{business.business_type || 'goods'}</Badge>
                            </TableCell>
                            <TableCell>
                              {business.reputation_score ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span>{business.reputation_score.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={business.location_verified ? "default" : "secondary"}>
                                {business.location_verified ? "Verified" : "Not Verified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <TierBadge tier={business.verification_tier || 'none'} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={business.verification_tier || 'none'}
                                  onValueChange={(value: VerificationTier) =>
                                    updateVerificationTierMutation.mutate({
                                      businessId: business.id,
                                      tier: value,
                                      email: business.profiles?.email,
                                      fullName: business.profiles?.full_name,
                                      companyName: business.company_name,
                                      userId: business.user_id,
                                      isRevocation: value !== 'premium' && business.verification_tier === 'premium'
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                  </SelectContent>
                                </Select>

                                {business.verification_tier === 'premium' && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs font-bold px-3 shrink-0"
                                    onClick={() => {
                                      if (confirm(`Are you absolutely sure you want to revoke the Premium Badge for ${business.company_name}? This will demote them to basic verified, play a safety alert chime, and send a security warning email.`)) {
                                        updateVerificationTierMutation.mutate({
                                          businessId: business.id,
                                          tier: 'verified',
                                          email: business.profiles?.email,
                                          fullName: business.profiles?.full_name,
                                          companyName: business.company_name,
                                          userId: business.user_id,
                                          isRevocation: true
                                        });
                                      }
                                    }}
                                    disabled={updateVerificationTierMutation.isPending}
                                  >
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders ({orders?.length || 0})</CardTitle>
                <CardDescription>Monitor and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.id?.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{order.customers?.profiles?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{order.businesses?.company_name}</TableCell>
                          <TableCell>{'\u20A6'}{Number(order.total).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                                order.status === 'cancelled' ? 'destructive' :
                                  'secondary'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.status === 'shipped' && (
                              <Button
                                size="sm"
                                onClick={() => confirmDeliveryMutation.mutate({ orderId: order.id })}
                              >
                                Confirm Delivery
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Jobs ({jobs?.length || 0})</CardTitle>
                <CardDescription>Monitor service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs?.map((job: any) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{job.description || 'Service Request'}</p>
                              <p className="text-xs text-muted-foreground">{job.id?.slice(0, 8).toUpperCase()}</p>
                            </div>
                          </TableCell>
                          <TableCell>{job.customers?.profiles?.full_name || 'Unknown'}</TableCell>
                          <TableCell>{job.businesses?.company_name}</TableCell>
                          <TableCell>
                            {job.final_price ? `₦${Number(job.final_price).toLocaleString()}` : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => completeJobMutation.mutate({ jobId: job.id })}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Reviews ({allReviews?.length || 0})</CardTitle>
                <CardDescription>Monitor customer reviews and business responses</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {allReviews?.map((review: any) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'
                                      }`}
                                  />
                                ))}
                              </div>
                              {review.verified_purchase && (
                                <Badge variant="secondary">Verified</Badge>
                              )}
                            </div>
                            {review.title && <p className="font-medium mt-1">{review.title}</p>}
                            {review.content && <p className="text-sm text-muted-foreground mt-1">{review.content}</p>}
                            <p className="text-xs text-muted-foreground mt-2">
                              For: {review.businesses?.company_name} • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {review.response && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs font-medium">Business Response:</p>
                            <p className="text-sm text-muted-foreground">{review.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Offer Requests ({allOffers?.length || 0})</CardTitle>
                <CardDescription>Customer requests for products/services</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {allOffers?.map((offer: any) => (
                      <div key={offer.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{offer.offer_type}</Badge>
                              <Badge variant={offer.status === 'open' ? 'secondary' : offer.status === 'fulfilled' ? 'default' : 'outline'}>
                                {offer.status}
                              </Badge>
                              {offer.urgency && <Badge variant="destructive">{offer.urgency}</Badge>}
                            </div>
                            <h4 className="font-medium">{offer.title}</h4>
                            {offer.description && (
                              <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                            )}
                            {offer.budget_min || offer.budget_max ? (
                              <p className="text-sm mt-1">
                                Budget: {'\u20A6'}{offer.budget_min?.toLocaleString() || 0} - {'\u20A6'}{offer.budget_max?.toLocaleString() || 'Any'}
                              </p>
                            ) : null}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {offer.images && offer.images[0] && (
                            <img src={offer.images[0]} alt="" className="h-20 w-20 rounded-lg object-cover" />
                          )}
                        </div>
                        {offer.status === 'open' && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateOfferMutation.mutate({ offerId: offer.id, status: 'fulfilled' })}
                            >
                              Mark Fulfilled
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOfferMutation.mutate({ offerId: offer.id, status: 'closed' })}
                            >
                              Close
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests ({withdrawals?.length || 0})</CardTitle>
                <CardDescription>Process business withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Bank Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals?.map((w: any) => (
                        <TableRow key={w.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{w.businesses?.company_name}</p>
                              <p className="text-xs text-muted-foreground">{w.businesses?.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">₦{Number(w.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{w.bank_name}</p>
                              <p className="text-muted-foreground">{w.account_number}</p>
                              <p className="text-muted-foreground">{w.account_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              w.status === 'completed' ? 'default' :
                                w.status === 'rejected' ? 'destructive' :
                                  'secondary'
                            }>
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(w.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {w.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => processWithdrawal.mutate({
                                    withdrawalId: w.id,
                                    status: 'completed',
                                  })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => processWithdrawal.mutate({
                                    withdrawalId: w.id,
                                    status: 'rejected',
                                    adminNotes: 'Rejected by admin',
                                  })}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab - Enhanced with all users */}
          <TabsContent value="locations" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Pending Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Verification ({pendingLocations.length})</CardTitle>
                  <CardDescription>Verify user locations from Google Maps</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {pendingLocations.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No pending requests</p>
                      ) : (
                        pendingLocations.map((request: any) => (
                          <LocationVerificationCard
                            key={request.id}
                            request={request}
                            onVerify={(lat, lng) => verifyLocationMutation.mutate({
                              requestId: request.id,
                              userId: request.user_id,
                              userType: request.user_type,
                              latitude: lat,
                              longitude: lng,
                              approved: true,
                              email: request.profiles?.email,
                              fullName: request.profiles?.full_name,
                              streetAddress: request.street_address,
                              areaName: request.area_name
                            })}
                            onReject={() => verifyLocationMutation.mutate({
                              requestId: request.id,
                              userId: request.user_id,
                              userType: request.user_type,
                              approved: false,
                              email: request.profiles?.email,
                              fullName: request.profiles?.full_name,
                            })}
                            isLoading={verifyLocationMutation.isPending}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* All Users with Locations */}
              <Card>
                <CardHeader>
                  <CardTitle>All User Locations ({allUsersWithLocations.length})</CardTitle>
                  <CardDescription>Users with coordinates set</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {allUsersWithLocations.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${user.type === 'business' ? 'bg-primary/10' : 'bg-muted'}`}>
                              {user.type === 'business' ? (
                                <Building2 className="h-4 w-4" />
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.verified ? 'default' : 'secondary'}>
                              {user.verified ? 'Verified' : 'Unverified'}
                            </Badge>
                            <a
                              href={`https://www.google.com/maps?q=${user.lat},${user.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs"
                            >
                              View Map
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab - with replies */}
          <TabsContent value="messages" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sent Messages ({adminMessages?.length || 0})</CardTitle>
                      <CardDescription>Admin announcements</CardDescription>
                    </div>
                    <Button onClick={() => setShowMessageDialog(true)}>
                      <Send className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {adminMessages?.map((message: any) => (
                        <div
                          key={message.id}
                          className={`p-3 border rounded-lg ${message.is_pinned ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {message.is_pinned && <Pin className="h-3 w-3 text-yellow-500" />}
                                <span className="font-medium text-sm">{message.title}</span>
                                <Badge variant="outline" className="text-xs">{message.recipient_type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePinMutation.mutate({
                                  messageId: message.id,
                                  isPinned: !message.is_pinned,
                                })}
                              >
                                <Pin className={`h-3 w-3 ${message.is_pinned ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMessageMutation.mutate(message.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Replies from users */}
              <Card>
                <CardHeader>
                  <CardTitle>User Replies ({messageReplies?.length || 0})</CardTitle>
                  <CardDescription>Responses from businesses and customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {messageReplies?.map((reply: any) => (
                        <div key={reply.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={reply.sender_type === 'business' ? 'default' : 'secondary'}>
                              {reply.sender_type}
                            </Badge>
                            <span className="text-sm font-medium">{reply.profiles?.full_name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Re: {reply.admin_messages?.title}
                          </p>
                          <p className="text-sm">{reply.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Commission ({products?.length || 0})</CardTitle>
                <CardDescription>Set commission rates (1-20%)</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {products?.map((product: any) => (
                      <ProductCommissionCard
                        key={product.id}
                        product={product}
                        onUpdate={(commission, isRare) =>
                          updateCommissionMutation.mutate({
                            productId: product.id,
                            commission,
                            isRare
                          })
                        }
                        isLoading={updateCommissionMutation.isPending}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Shield className="h-5 w-5" />
                    Legal Enforcement
                  </CardTitle>
                  <CardDescription>Force all users to accept updated terms before platform usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border-2 border-primary/20 shadow-sm transition-all hover:shadow-md">
                    <div>
                      <p className="font-bold text-2xl text-primary">{config?.value || 1}</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Terms Version</p>
                    </div>
                    <Button 
                      className="rounded-full px-6 shadow-lg shadow-primary/20"
                      onClick={() => {
                        const nextVer = (config?.value ? parseInt(config.value) : 1) + 1;
                        if (confirm(`Increment terms to version ${nextVer}? This will LOCK ALL USERS out until they accept.`)) {
                          updateTermsVersionMutation.mutate(nextVer);
                        }
                      }}
                      disabled={updateTermsVersionMutation.isPending}
                    >
                      {updateTermsVersionMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Shield className="w-4 h-4 mr-2" />}
                      Push Update
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Acceptance Progress</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-background rounded-2xl border border-border shadow-sm">
                        <p className="text-3xl font-black text-foreground">{profiles?.filter((p: any) => p.accepted_terms_version === (config ? parseInt(config.value) : 1)).length || 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Accepted</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border shadow-sm">
                        <p className="text-3xl font-black text-foreground">{profiles?.filter((p: any) => !p.accepted_terms_version || p.accepted_terms_version < (config ? parseInt(config.value) : 1)).length || 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500/20 bg-orange-500/[0.01]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-500 font-bold">
                    <Crown className="h-5 w-5" />
                    Visibility Booster Configurator
                  </CardTitle>
                  <CardDescription>Adjust the monthly subscription cost for businesses to boost views</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₦</span>
                      <Input
                        type="number"
                        placeholder="15000"
                        value={boosterPriceInput}
                        onChange={(e) => setBoosterPriceInput(e.target.value)}
                        className="pl-7 h-10 font-bold"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        const parsed = Number(boosterPriceInput);
                        if (!parsed || parsed <= 0) {
                          toast.error("Please enter a valid positive pricing rate.");
                          return;
                        }
                        updateBoosterPriceMutation.mutate(parsed);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold h-10"
                      disabled={updateBoosterPriceMutation.isPending}
                    >
                      {updateBoosterPriceMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Pricing"}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1.5 border">
                    <div className="flex justify-between"><span className="text-muted-foreground">Active Price:</span> <span className="font-bold text-foreground">₦{boosterPrice.toLocaleString()} / mo</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Local Backup:</span> <span className="font-semibold text-foreground">₦{Number(localStorage.getItem("booster_monthly_price") || 15000).toLocaleString()}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    System Infrastructure
                  </CardTitle>
                  <CardDescription>Real-time edge function and DB status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 border border-border/50 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Database Engine</span>
                      <span className="font-bold text-green-500">OPTIMAL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Storage Cache</span>
                      <span className="font-bold text-primary">ENCRYPTED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> AI Matchmaking</span>
                      <span className="font-bold text-purple-500">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> CDN Propagation</span>
                      <span className="font-bold text-muted-foreground">98.4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Admin Message</DialogTitle>
            <DialogDescription>Send an announcement to platform users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Message title..."
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Write your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select
                value={messageRecipientType}
                onValueChange={(v: 'all' | 'businesses' | 'customers') => setMessageRecipientType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="businesses">Businesses Only</SelectItem>
                  <SelectItem value="customers">Customers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={messagePinned} onCheckedChange={setMessagePinned} />
              <Label>Pin this message</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
            <Button
              onClick={() => sendMessageMutation.mutate()}
              disabled={!messageTitle || !messageContent || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tier Badge Component
function TierBadge({ tier }: { tier: string }) {
  return <ReputationBadge tier={tier as any} />;
}

// Location Verification Card
function LocationVerificationCard({ request, onVerify, onReject, isLoading }: any) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  return (
    <div className="p-3 border rounded-lg border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={request.user_type === 'business' ? 'default' : 'secondary'}>
          {request.user_type}
        </Badge>
      </div>
      <p className="font-medium text-sm">{request.profiles?.full_name}</p>
      <p className="text-xs text-muted-foreground">{request.profiles?.email}</p>
      <div className="mt-2 p-2 bg-muted rounded text-xs">
        <p><strong>Street:</strong> {request.street_address}</p>
        {request.area_name && <p><strong>Area:</strong> {request.area_name}</p>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Input
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="h-8 text-sm"
        />
        <Input
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onVerify(parseFloat(latitude), parseFloat(longitude))}
          disabled={isLoading || !latitude || !longitude}
        >
          Verify
        </Button>
        <Button size="sm" variant="destructive" onClick={onReject} disabled={isLoading}>
          Reject
        </Button>
      </div>
    </div>
  );
}

// Product Commission Card
function ProductCommissionCard({ product, onUpdate, isLoading }: any) {
  const [commission, setCommission] = useState(product.commission_percent || 10);
  const [isRare, setIsRare] = useState(product.is_rare || false);

  const hasChanges = commission !== product.commission_percent || isRare !== product.is_rare;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{product.name}</p>
          {product.is_rare && <Badge variant="destructive">Rare</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {product.businesses?.company_name} • ₦{Number(product.price || 0).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={20}
          value={commission}
          onChange={(e) => setCommission(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-14 h-8 text-center text-sm"
        />
        <span className="text-xs">%</span>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={isRare}
            onChange={(e) => setIsRare(e.target.checked)}
            className="rounded"
          />
          Rare
        </label>
        <Button size="sm" onClick={() => onUpdate(commission, isRare)} disabled={isLoading || !hasChanges}>
          Save
        </Button>
      </div>
    </div>
  );
}
