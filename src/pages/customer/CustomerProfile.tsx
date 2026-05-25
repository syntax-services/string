import { useState, useRef } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomer } from "@/hooks/useCustomer";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { format } from "date-fns";
import { playPremiumMatchChime } from "@/hooks/useAudioSignals";
import { cn } from "@/lib/utils";

export default function CustomerProfile() {
  const { profile, signOut, refreshProfile, isAdmin, hasBothRoles, switchRole } = useAuth();
  const navigate = useNavigate();
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
      // 1. Insert row into businesses table
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .insert({
          user_id: profile.user_id,
          company_name: businessName,
          business_type: businessType,
          street_address: streetAddress,
          area_name: areaName,
          location_verified: customer?.location_verified || false,
          is_active: true
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // 2. Set role switches
      localStorage.setItem("string_active_role_view", "business");
      
      // 3. Update profile user_type in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: "business" })
        .eq("user_id", profile.user_id);

      if (profileError) throw profileError;

      // 4. Play success audio chime
      playPremiumMatchChime().catch(console.error);

      // 5. Refresh
      await refreshProfile();
      toast.success(`Merchant Shop "${businessName}" successfully initialized! 🚀`);
      setIsRegisterModalOpen(false);
      navigate("/business");
    } catch (err) {
      console.error("Failed to register business:", err);
      toast.error("Could not register business. Please try again.");
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
    if (!file || !profile?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar images must be less than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

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