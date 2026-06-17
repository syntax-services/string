import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomer } from "@/hooks/useCustomer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useReferral } from "@/hooks/useReferral";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  Copy,
  Star,
  Gift,
  AlertTriangle,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { playPremiumMatchChime } from "@/hooks/useAudioSignals";
import { cn } from "@/lib/utils";

export default function CustomerProfile() {
  const { profile, signOut, refreshProfile, isAdmin, hasBothRoles, switchRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: customer } = useCustomer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Feedback states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Business registration states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<"goods" | "services" | "both">("both");
  const [streetAddress, setStreetAddress] = useState("");
  const [areaName, setAreaName] = useState("");
  const [registeringBusiness, setRegisteringBusiness] = useState(false);

  // Hidden accordion state
  const [showAdvancedPrefs, setShowAdvancedPrefs] = useState(false);

  // Gamification & Rewards State
  const [claimCode, setClaimCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [referredFriendsList, setReferredFriendsList] = useState<{ id: string; name: string; email: string; date: string }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [totalSpent, setTotalSpent] = useState<number>(0);

  const { referralCode: dbReferralCode, totalPoints: dbPoints } = useReferral();
  const totalPoints = (dbPoints || 0) + Number(profile?.coupon_balance || 0);
  const referralCode = dbReferralCode || profile?.referral_code;
  const totalReferrals = referredFriendsList.length;

  const handleFeedbackSubmit = async () => {
    if (!profile?.id) return;
    if (!feedbackSubject || !feedbackMessage) {
      toast.error("Please enter both feedback subject and message.");
      return;
    }
    
    setSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from("user_feedbacks")
        .insert({
          user_id: profile.user_id,
          subject: feedbackSubject,
          message: feedbackMessage,
          rating: feedbackRating,
          status: 'new'
        });

      if (error) throw error;
      toast.success("Feedback submitted successfully! Thank you. 💬");
      setFeedbackSubject("");
      setFeedbackMessage("");
      setFeedbackRating(5);
      setIsFeedbackModalOpen(false);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error("Could not submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRegisterBusiness = async () => {
    if (!profile?.id) return;
    if (!businessName || !streetAddress || !areaName) {
      toast.error("Please fill in all store fields.");
      return;
    }

    setRegisteringBusiness(true);
    try {
      // 1. Call the secure onboarding RPC which bypasses RLS issues
      const { data: rpcData, error: rpcError } = await supabase.rpc("complete_onboarding_setup", {
        p_full_name: profile.full_name || "Merchant",
        p_phone: profile.phone || "",
        p_user_type: "business",
        p_business_data: {
          companyName: businessName,
          businessType: businessType,
          streetAddress: streetAddress,
          areaName: areaName
        },
        p_customer_data: null
      });

      if (rpcError) throw rpcError;

      // 2. Set role switches
      localStorage.setItem("string_active_role_view", "business");

      // 4. Play success audio chime
      playPremiumMatchChime().catch(console.error);

      // 5. Refresh
      await refreshProfile();
      toast.success(`Merchant Shop "${businessName}" successfully initialized! 🚀`);
      setIsRegisterModalOpen(false);
      navigate("/business");
    } catch (err: any) {
      console.error("Failed to register business:", err);
      toast.error(`Could not register business: ${err.message || err.toString()}`);
    } finally {
      setRegisteringBusiness(false);
    }
  };

  const handleSwitchToAdmin = async () => {
    localStorage.setItem("string_active_admin_mode", "true");
    await refreshProfile();
    toast.success("Switched to Admin Mode! 🛡️");
    navigate("/admin");
  };

  // Load referred friends, withdrawal history, and total purchase spent
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.user_id) return;
      try {
        const { data: refs } = await supabase
          .from("referrals")
          .select("id, points_awarded, status, created_at, referred_id")
          .eq("referrer_id", profile.user_id);
        
        if (refs && refs.length > 0) {
          const ids = refs.map((r: any) => r.referred_id);
          const { data: pfs } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", ids);

          const mapped = refs.map((r: any) => {
            const pf = pfs?.find((p: any) => p.user_id === r.referred_id);
            return {
              id: r.id,
              name: pf?.full_name || "Friend",
              email: pf?.email || "No email",
              date: format(new Date(r.created_at), "MMM d, yyyy"),
            };
          });
          setReferredFriendsList(mapped);
        }

        const { data: claimedGift } = await supabase
          .from("monthly_buyer_gifts")
          .select("id")
          .eq("user_id", profile.user_id)
          .eq("year_month", new Date().toISOString().slice(0, 7))
          .maybeSingle();
        setGiftClaimed(!!claimedGift);

        const { data: wds } = await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false });
        if (wds) setWithdrawHistory(wds);

        // Fetch total spent
        if (customer?.id) {
          const { data: ords } = await supabase
            .from("orders")
            .select("total")
            .eq("customer_id", customer.id)
            .in("status", ["confirmed", "processing", "shipped", "delivered"]);
          
          if (ords) {
            const sum = ords.reduce((acc: number, cur: any) => acc + Number(cur.total || 0), 0);
            setTotalSpent(sum);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch gamification and spend data:", err);
      }
    };
    fetchData();
  }, [profile, customer]);

  const handleClaimReferral = async () => {
    if (!claimCode) return;
    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc('process_referral', {
        p_referral_code: claimCode.trim()
      });
      if (error) throw error;
      
      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.message || "Failed to claim code");
      }
      
      toast.success(result?.message || "Code applied successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["referral-data", profile?.user_id] });
      await refreshProfile();
      setClaimCode("");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim code");
    } finally {
      setClaiming(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    
    // Purchase Threshold Bridge Check
    if (totalSpent < 25000) {
      toast.error(`Withdrawal locked: You must purchase items worth at least ₦25,000 first (Current: ₦${totalSpent.toLocaleString()}).`);
      return;
    }

    if (!amount || amount < 1000) {
      toast.error("Minimum withdrawal is ₦1,000");
      return;
    }
    if (amount > totalPoints) {
      toast.error("Insufficient balance");
      return;
    }
    if (!bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all bank details.");
      return;
    }
    if (accountNumber.length !== 10) {
      toast.error("Account number must be exactly 10 digits.");
      return;
    }

    setWithdrawing(true);
    try {
      // 1. Insert withdrawal request with bank details
      const { data: withdrawReq, error: insertError } = await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: profile!.user_id,
          amount: amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          withdrawal_type: "coupon",
          status: "pending"
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      // 2. Deduct amount: split between profiles.coupon_balance and user_points
      let remaining = amount;
      let newCouponBalance = Number(profile?.coupon_balance || 0);
      let newPoints = dbPoints || 0;

      if (newCouponBalance >= remaining) {
        newCouponBalance -= remaining;
        remaining = 0;
      } else {
        remaining -= newCouponBalance;
        newCouponBalance = 0;
      }

      if (remaining > 0) {
        newPoints = Math.max(0, newPoints - remaining);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ coupon_balance: newCouponBalance })
        .eq("user_id", profile!.user_id);

      if (profileError) throw profileError;

      const { error: pointsError } = await supabase
        .from("user_points")
        .update({ total_points: newPoints })
        .eq("user_id", profile!.user_id);

      if (pointsError) throw pointsError;

      // 3. Trigger payout Edge Function
      try {
        await supabase.functions.invoke("paystack-payout", {
          body: { withdrawalRequestId: withdrawReq.id }
        });
      } catch (fErr) {
        console.warn("Edge function payout call failed:", fErr);
      }

      toast.success(`Withdrawal request for ₦${amount.toLocaleString()} submitted successfully!`);
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["referral-data", profile?.user_id] });
      await refreshProfile();

      const { data: wds } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", profile!.user_id)
        .order("created_at", { ascending: false });
      if (wds) setWithdrawHistory(wds);
    } catch (err: any) {
      toast.error(err.message || "Failed to process withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleClaimMonthlyGift = async () => {
    try {
      const { data, error } = await supabase.rpc('check_and_claim_monthly_gift');
      if (error) throw error;

      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.message || "Failed to claim VIP gift");
      }

      toast.success(result?.message || "VIP Gift Claimed! Enjoy your reward 🎉");
      setGiftClaimed(true);
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["referral-data", profile?.user_id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to claim VIP gift");
    }
  };

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.user_id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar images must be less than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.user_id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("business-images").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", profile.user_id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error("We could not save your profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
      <div className="max-w-md mx-auto space-y-5 pb-10">
        
        {/* Profile Header Block */}
        <div className="flex flex-col items-center text-center mt-6 space-y-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/80 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
            <div className="relative h-32 w-32 rounded-full border-4 border-background bg-card flex items-center justify-center overflow-hidden shadow-2xl">
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground">Uploading...</span>
                </div>
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <img
                  src={
                    customer?.gender === 'male'
                      ? '/avatar_male.png'
                      : customer?.gender === 'female'
                        ? '/avatar_female.png'
                        : '/avatar_neutral.png'
                  }
                  alt="Default 3D Avatar"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {/* Camera icon hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white flex-col gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                <span className="text-[9px] font-bold uppercase tracking-wider">Change Photo</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              className="hidden" 
            />
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

          {/* Referral / Rewards Balance Pool Card */}
          <div className="w-full max-w-[280px] mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/10 dark:to-teal-500/5 border border-emerald-500/20 p-3 shadow-md shadow-emerald-500/5 flex items-center justify-between">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="text-left space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Referral Balance</span>
                <p className="text-lg font-black text-foreground font-mono tracking-tight leading-none mt-0.5">
                  ₦{totalPoints.toLocaleString()}
                </p>
              </div>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                  <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                  <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                  <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.84 15.52 2.397a.75.75 0 0 0 .96-.511 20.935 20.935 0 0 0 .839-4.886.75.75 0 0 0-.75-.75h-16.5Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card Container 1 (Main Actions) */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
          <div className="divide-y divide-border/30">
            {mainMenuList.map((item, idx) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/[0.02] active:bg-primary/[0.04] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-foreground/80 group-hover:text-foreground text-[13px] tracking-wide transition-colors duration-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.25 rounded-full">
                      {item.count}
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Floating Card Container 2 (Secondary Actions) */}
        <div className="bg-card rounded-2xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
          <div className="divide-y divide-border/30">
            {isAdmin && (
              <button
                onClick={handleSwitchToAdmin}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-red-500/[0.02] active:bg-red-500/[0.04] transition-all duration-300 group text-left bg-gradient-to-r from-red-500/[0.03] to-amber-500/[0.03] border-b border-border/20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-semibold text-red-500 text-[13px] tracking-wide">Admin Panel 🛡️</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-red-500/70 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            )}
            {hasBothRoles && (
              <button
                onClick={async () => {
                  await switchRole("business");
                  toast.success("Switched to Merchant View! 🏪");
                  navigate("/business");
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/[0.02] active:bg-primary/[0.04] transition-all duration-300 group text-left bg-gradient-to-r from-primary/[0.03] to-primary/[0.01] border-b border-border/20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.5a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-primary text-[13px] tracking-wide">Merchant Studio 🏪</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-primary/70 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            )}
            {secondaryMenuList.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/[0.02] active:bg-primary/[0.04] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-foreground/80 group-hover:text-foreground text-[13px] tracking-wide transition-colors duration-300">{item.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            ))}

            {/* Platform Feedback */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/[0.02] active:bg-primary/[0.04] transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                  <PremiumStar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <span className="font-medium text-foreground/80 group-hover:text-foreground text-[13px] tracking-wide transition-colors duration-300">Submit Platform Feedback</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>

            {/* Theme Row */}
            <div className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/[0.02] transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground/80 text-[13px] tracking-wide">Dark Theme</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Log Out */}
            <button
              onClick={signOut}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-destructive/[0.02] active:bg-destructive/[0.04] transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-destructive/10 transition-all duration-300">
                  <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors duration-300" />
                </div>
                <span className="font-medium text-foreground/80 group-hover:text-destructive text-[13px] tracking-wide transition-colors duration-300">Log Out</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
        {/* Gamified Rewards & Wallet Section */}
        <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
          <div className="p-4 border-b border-border/10 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-inner">
                <Gift className="h-4.5 w-4.5 text-primary drop-shadow-sm" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground tracking-tight">Rewards Hub</h2>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Points & Payouts</p>
              </div>
            </div>
            {giftClaimed ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px] tracking-wider py-1 px-2.5">VIP GIFT CLAIMED</Badge>
            ) : (
              <Button onClick={handleClaimMonthlyGift} size="sm" className="h-8 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">
                CLAIM VIP GIFT
              </Button>
            )}
          </div>
          
          <div className="p-4 space-y-5">
            {/* Points & Referral Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/20 border border-border/20 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500/20 mb-2" />
                <p className="text-2xl font-black text-foreground tracking-tighter">₦{totalPoints.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Balance</p>
              </div>
              <div className="rounded-2xl bg-muted/20 border border-border/20 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Users className="h-5 w-5 text-blue-500 mb-2" />
                <p className="text-2xl font-black text-foreground tracking-tighter">{totalReferrals.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Friends Referred</p>
              </div>
            </div>

            {/* Referral Code */}
            {referralCode && (
              <div className="flex items-center gap-2 bg-muted/10 rounded-2xl p-2 border border-border/20">
                <div className="flex-1 px-3">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Your Referral Code</p>
                  <p className="text-sm font-black font-mono tracking-wider text-foreground">{referralCode}</p>
                </div>
                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-background shadow-sm hover:shadow active:scale-95 transition-all" onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  toast.success("Referral code copied!");
                }}>
                  <Copy className="h-4 w-4 text-foreground/70" />
                </Button>
              </div>
            )}

            {/* Claim Promo / Referral Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Claim Promo or Referral Code</p>
                {profile?.referral_code_used && (
                  <Badge variant="outline" className="text-[8px] font-bold tracking-wider px-2 py-0.5 border-border/20 text-muted-foreground bg-muted/5">WELCOME BONUS CLAIMED</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Enter code (e.g. STR-XXXXXX or promo)..." value={claimCode} onChange={(e) => setClaimCode(e.target.value)} className="rounded-xl bg-muted/10 border-border/20 focus-visible:ring-primary/30 font-medium" />
                <Button onClick={handleClaimReferral} disabled={claiming || !claimCode} className="rounded-xl shadow-sm font-bold text-xs px-5">
                  {claiming ? "Claiming..." : "Claim"}
                </Button>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="space-y-3 pt-3 border-t border-border/10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Withdraw Funds</p>
                <Badge variant="outline" className="text-[9px] font-bold tracking-wider px-2 py-0.5 border-primary/20 text-primary bg-primary/5">MIN ₦1,000</Badge>
              </div>

              {/* Purchase threshold bridge warning */}
              {totalSpent < 25000 ? (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Withdrawal Locked
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    To withdraw funds, platform policy requires a minimum total purchase volume of ₦25,000 on products/services.
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-extrabold text-amber-500 uppercase mt-1">
                    <span>Progress: ₦{totalSpent.toLocaleString()} / ₦25,000</span>
                    <span>{Math.round((totalSpent / 25000) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden border border-border/10">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalSpent / 25000) * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Withdrawals Unlocked
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Your purchase threshold requirement is satisfied! (Total Spent: ₦{totalSpent.toLocaleString()})
                  </p>
                </div>
              )}

              <form onSubmit={handleWithdrawalRequest} className="space-y-3 pt-1">
                <div className="space-y-1 text-left">
                  <Label htmlFor="bankName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Bank Name</Label>
                  <select
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-xl border border-border/20 bg-muted/10 px-3 h-10 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                    disabled={totalSpent < 25000}
                  >
                    <option value="">Select your bank</option>
                    <option value="044">Access Bank</option>
                    <option value="050">Ecobank Nigeria</option>
                    <option value="070">Fidelity Bank</option>
                    <option value="011">First Bank of Nigeria</option>
                    <option value="058">GTBank</option>
                    <option value="030">Heritage Bank</option>
                    <option value="301">Jaiz Bank</option>
                    <option value="082">Keystone Bank</option>
                    <option value="999992">OPay Digital Services</option>
                    <option value="999991">PalmPay</option>
                    <option value="076">Polaris Bank</option>
                    <option value="101">Providus Bank</option>
                    <option value="221">Stanbic IBTC Bank</option>
                    <option value="068">Standard Chartered Bank</option>
                    <option value="232">Sterling Bank</option>
                    <option value="100">SunTrust Bank</option>
                    <option value="032">Union Bank of Nigeria</option>
                    <option value="033">United Bank for Africa (UBA)</option>
                    <option value="215">Unity Bank</option>
                    <option value="035">Wema Bank</option>
                    <option value="057">Zenith Bank</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="space-y-1">
                    <Label htmlFor="acctNumber" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account Number</Label>
                    <Input
                      id="acctNumber"
                      maxLength={10}
                      placeholder="10 digit NUBAN"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      className="rounded-xl bg-muted/10 border-border/20 focus-visible:ring-primary/30 text-xs font-semibold"
                      required
                      disabled={totalSpent < 25000}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="acctName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account Name</Label>
                    <Input
                      id="acctName"
                      placeholder="Name on Account"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="rounded-xl bg-muted/10 border-border/20 focus-visible:ring-primary/30 text-xs font-semibold"
                      required
                      disabled={totalSpent < 25000}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <Label htmlFor="withdrawAmt" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Withdrawal Amount (₦)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">₦</span>
                      <Input 
                        id="withdrawAmt"
                        type="number" 
                        placeholder="Amount" 
                        value={withdrawAmount} 
                        onChange={(e) => setWithdrawAmount(e.target.value)} 
                        className="rounded-xl bg-muted/10 border-border/20 focus-visible:ring-primary/30 font-bold pl-7 text-xs" 
                        min="1000" 
                        max={totalPoints} 
                        required
                        disabled={totalSpent < 25000}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={withdrawing || !withdrawAmount || totalSpent < 25000} 
                      variant="default" 
                      className="rounded-xl shadow-sm font-bold text-xs px-4 bg-foreground text-background hover:bg-foreground/90 h-10"
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                      {withdrawing ? "Processing..." : "Withdraw"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Referred Friends Feed */}
            {referredFriendsList.length > 0 && (
              <div className="pt-3 border-t border-border/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2">Referred Friends</p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {referredFriendsList.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/10 border border-border/10 hover:bg-muted/20 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-foreground">{ref.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{ref.email}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 font-bold text-[10px]">+₦100</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Withdrawal History */}
            {withdrawHistory.length > 0 && (
              <div className="pt-3 border-t border-border/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2">Withdrawal History</p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {withdrawHistory.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/10 border border-border/10">
                      <div>
                        <p className="text-xs font-bold text-foreground">₦{req.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(req.created_at), "MMM d, yyyy")}</p>
                      </div>
                      <Badge variant="secondary" className={cn(
                        "font-bold text-[9px] uppercase tracking-wider",
                        req.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        req.status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      )}>
                        {req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Business Registration Accordion */}
        {!hasBothRoles && (
          <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-xl shadow-black/5">
            <button
              onClick={() => setShowAdvancedPrefs(!showAdvancedPrefs)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3">
                <PremiumBriefcase className="h-4 w-4 text-muted-foreground animate-pulse" />
                <span className="font-semibold text-foreground/80 text-[11px] uppercase tracking-wider">String Merchant Partnership</span>
              </div>
              <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", showAdvancedPrefs && "rotate-90")} />
            </button>
            
            {showAdvancedPrefs && (
              <div className="p-4 bg-muted/20 border-t border-border/30 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300 text-left">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ready to scale your business on String? Set up your merchant profile to showcase products, list premium services, secure transactions via escrow safety, and match instantly with buyers right around your campus region.
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-xs tracking-wider uppercase hover:opacity-90 active:scale-95 transition-all duration-300 shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Become a String Partner 🏪
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
          <DialogContent className="max-w-md border border-primary/20 bg-card/95 backdrop-blur-2xl text-foreground rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-primary flex items-center gap-2">
                Submit Platform Feedback
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Tell us how to improve String. Your feedback goes directly to our platform admin team.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-3 text-left">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="text-lg transition-transform duration-200 active:scale-95 hover:scale-110"
                    >
                      {star <= feedbackRating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Subject</Label>
                <Input
                  placeholder="e.g. Navigation speed, Order chimes"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  className="h-9 bg-muted/20 border-border/40 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Message</Label>
                <Textarea
                  placeholder="Describe your experience or feature recommendations..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={4}
                  className="bg-muted/20 border-border/40 rounded-xl resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback || !feedbackSubject || !feedbackMessage}
                className="bg-primary hover:bg-primary/95 text-white font-bold"
              >
                {submittingFeedback ? "Submitting..." : "Submit Feedback"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Business Onboarding Dialog */}
        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="max-w-md border border-primary/20 bg-card/95 backdrop-blur-2xl text-foreground rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-primary flex items-center gap-2">
                Initialize Merchant Studio Node
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Provision a secondary merchant profile under this login. Switch back and forth anytime!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-3 text-left">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shop / Company Name</Label>
                <Input
                  placeholder="e.g. Ankara Hub, Campus Bites"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-9 bg-muted/20 border-border/40 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Business Type</Label>
                <Select value={businessType} onValueChange={(val: any) => setBusinessType(val)}>
                  <SelectTrigger className="h-9 bg-muted/20 border-border/40 rounded-xl text-left">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods">👕 Goods (Apparel, Food, Tech, etc.)</SelectItem>
                    <SelectItem value="services">🛠️ Services (Styling, Tutoring, coding, etc.)</SelectItem>
                    <SelectItem value="both">🏪 Both Goods & Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Campus Region / Area</Label>
                  <Input
                      placeholder="e.g. Main Campus, Babanla"
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      className="h-9 bg-muted/20 border-border/40 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Street Address</Label>
                  <Input
                      placeholder="e.g. Hall 2 Gate, Babanla St"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="h-9 bg-muted/20 border-border/40 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsRegisterModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRegisterBusiness}
                disabled={registeringBusiness || !businessName || !streetAddress || !areaName}
                className="bg-primary hover:bg-primary/95 text-white font-bold"
              >
                {registeringBusiness ? "Launching..." : "Launch Merchant Studio 🚀"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer info */}
        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-80 mt-4">
          Joined {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "—"}
        </p>
      </div>
    </DashboardLayout>
  );
}