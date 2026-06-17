import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserLocation } from "@/hooks/useLocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeCustomizer } from "@/components/ui/theme-customizer";
import { useReferral } from "@/hooks/useReferral";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Save,
  LogOut,
  Palette,
  Upload,
  Image,
  Gift,
  Copy,
  Star,
  ShieldCheck,
  CreditCard,
  Loader2,
} from "lucide-react";

interface BusinessData {
  id: string;
  company_name: string;
  industry: string | null;
  business_location: string | null;
  products_services: string | null;
  website: string | null;
  cover_image_url: string | null;
  location_verified?: boolean;
  verification_tier?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function BusinessSettings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { location, loading: locationLoading, requestLocation } = useUserLocation();
  const { referralCode, totalReferrals, totalPoints } = useReferral();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Withdrawal States
  const [withdrawConfig, setWithdrawConfig] = useState({ allow: false, minSpend: 5000 });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchWithdrawData = async () => {
      if (!user) return;
      try {
        const { data: configs } = await supabase.from("system_settings").select("*");
        if (configs) {
          const allowVal = configs.find(c => c.key === "allow_coupon_withdrawal")?.value;
          const minSpendVal = configs.find(c => c.key === "min_spend_for_withdrawal")?.value;
          setWithdrawConfig({
            allow: allowVal === true || allowVal === "true",
            minSpend: Number(minSpendVal) || 5000
          });
        }

        const { data: wds } = await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (wds) setWithdrawHistory(wds);
      } catch (err) {
        console.warn("Failed to load withdrawal details:", err);
      }
    };
    fetchWithdrawData();
  }, [user]);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0 || amount > (profile.coupon_balance || 0)) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid amount within your balance." });
      return;
    }

    if (!withdrawConfig.allow) {
      toast({ variant: "destructive", title: "Withdrawals locked", description: "Coupon cash withdrawals are currently disabled by admin." });
      return;
    }

    setWithdrawing(true);
    try {
      const { data: withdrawReq, error: insertError } = await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: user.id,
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

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ coupon_balance: Number(profile.coupon_balance || 0) - amount })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      try {
        await supabase.functions.invoke("paystack-payout", {
          body: { withdrawalRequestId: withdrawReq.id }
        });
      } catch (fErr) {
        console.warn("Edge function payout call failed:", fErr);
      }

      toast({ title: "Withdrawal processing", description: `Your bank payout request of ₦${amount.toLocaleString()} is processing.` });
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      await refreshProfile();
      
      const { data: wds } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (wds) setWithdrawHistory(wds);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Withdrawal failed", description: err.message });
    } finally {
      setWithdrawing(false);
    }
  };


  // ── Google Place Picker Autocomplete State ──
  const [showPlacesDropdown, setShowPlacesDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const GOOGLE_PLACES_PRESETS = [
    { description: "Crown Braids Salon, 24 Adeniran Ogunsanya St, Surulere, Lagos", lat: 6.5028, lng: 3.3582 },
    { description: "Crown Braids Salon, Plaza 4, Obafemi Awolowo Way, Ikeja, Lagos", lat: 6.5982, lng: 3.3512 },
    { description: "Ikeja City Mall, Obafemi Awolowo Way, Ikeja, Lagos", lat: 6.6120, lng: 3.3522 },
    { description: "Lekki Phase 1 Mall, Admiralty Way, Lekki, Lagos", lat: 6.4475, lng: 3.4866 },
    { description: "Victoria Island Office Court, 14 Karimu Kotun St, Victoria Island, Lagos", lat: 6.4281, lng: 3.4219 },
    { description: "Silverbird Galleria, 133 Ahmadu Bello Way, Victoria Island, Lagos", lat: 6.4294, lng: 3.4074 },
    { description: "The Palms Shopping Mall, BIS Way, Lekki, Lagos", lat: 6.4350, lng: 3.4542 },
    { description: "Maryland Mall, 350-360 Ikorodu Road, Maryland, Lagos", lat: 6.5701, lng: 3.3687 },
    { description: "Jumia Nigeria Office, 11 Commercial Ave, Yaba, Lagos", lat: 6.5095, lng: 3.3711 },
  ];

  const filteredSuggestions = GOOGLE_PLACES_PRESETS.filter(p =>
    p.description.toLowerCase().includes((businessData?.business_location || "").toLowerCase())
  );

  const selectPlace = (desc: string, lat: number, lng: number) => {
    setBusinessData(prev => prev ? { ...prev, business_location: desc, latitude: lat, longitude: lng } : null);
    setShowPlacesDropdown(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPlacesDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("businesses")
        .select("id, company_name, industry, business_location, products_services, website, cover_image_url, location_verified, verification_tier, latitude, longitude")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setBusinessData(data);
      }
    };

    fetchBusinessData();
  }, [user]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessData) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `covers/${businessData.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("business-images")
        .getPublicUrl(filePath);

      await supabase
        .from("businesses")
        .update({ cover_image_url: publicUrl })
        .eq("id", businessData.id);

      setBusinessData((prev) => prev ? { ...prev, cover_image_url: publicUrl } : null);
      
      toast({
        title: "Cover uploaded",
        description: "Your cover image has been updated.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !businessData) return;
    setSaving(true);

    try {
      // Update profile
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq("user_id", user.id);

      // Update business data
      await supabase
        .from("businesses")
        .update({
          company_name: businessData.company_name,
          industry: businessData.industry,
          business_location: businessData.business_location,
          products_services: businessData.products_services,
          website: businessData.website,
          latitude: businessData.latitude,
          longitude: businessData.longitude,
        })
        .eq("id", businessData.id);

      await refreshProfile();
      
      toast({
        title: "Settings saved",
        description: "Your business profile has been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!businessData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 lg:pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your business profile and preferences
          </p>
        </div>

        {/* Cover Image */}
        <div className="dashboard-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Image className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="font-medium text-foreground">Cover Image</h2>
          </div>

          <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            {businessData.cover_image_url ? (
              <img
                src={businessData.cover_image_url}
                alt="Business cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl font-bold text-primary/30">
                  {businessData.company_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="google-input-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Cover Image"}
          </Button>
        </div>

        {/* Business Profile */}
        <div className="dashboard-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="font-medium text-foreground">Business Details</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={businessData.company_name}
                onChange={(e) =>
                  setBusinessData((prev) => prev ? { ...prev, company_name: e.target.value } : null)
                }
                className="google-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={businessData.industry || ""}
                onChange={(e) =>
                  setBusinessData((prev) => prev ? { ...prev, industry: e.target.value } : null)
                }
                className="google-input"
              />
            </div>
            <div className="space-y-2 relative" ref={dropdownRef}>
              <div className="flex justify-between items-center">
                <Label htmlFor="businessLocation">Location Address</Label>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Verified Google Maps ↗
                </span>
              </div>
              <div className="relative">
                <Input
                  id="businessLocation"
                  value={businessData?.business_location || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBusinessData((prev) => prev ? { ...prev, business_location: val } : null);
                    setShowPlacesDropdown(true);
                  }}
                  onFocus={() => setShowPlacesDropdown(true)}
                  placeholder="Start typing address (e.g. Crown Braids...)"
                  className="google-input pl-9"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              {showPlacesDropdown && businessData?.business_location && (
                <div className="absolute z-50 left-0 right-0 mt-1 rounded-2xl border border-border bg-card shadow-2xl p-2 max-h-[220px] overflow-y-auto space-y-1 animate-in fade-in duration-100">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectPlace(place.description, place.lat, place.lng)}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-muted transition-colors text-xs"
                      >
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{place.description.split(",")[0]}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{place.description.split(",").slice(1).join(",").trim()}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectPlace(businessData.business_location || "", 6.5244, 3.3792)}
                      className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-muted transition-colors text-xs"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">Use custom location: "{businessData.business_location}"</p>
                        <p className="text-[10px] text-muted-foreground truncate">Lagos, Nigeria (Default Coordinates)</p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={businessData.website || ""}
                onChange={(e) =>
                  setBusinessData((prev) => prev ? { ...prev, website: e.target.value } : null)
                }
                placeholder="https://"
                className="google-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products / Services</Label>
            <Textarea
              id="products"
              value={businessData.products_services || ""}
              onChange={(e) =>
                setBusinessData((prev) => prev ? { ...prev, products_services: e.target.value } : null)
              }
              placeholder="Describe what you offer..."
              className="google-input min-h-[100px]"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="dashboard-card space-y-4">
          <h2 className="font-medium text-foreground">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Contact Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="google-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="google-input bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="google-input"
              />
            </div>
          </div>
        </div>

        {/* Referral Section */}
        <div className="dashboard-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">Referral Program</h2>
              <p className="text-sm text-muted-foreground">
                Invite friends and earn points
              </p>
            </div>
          </div>
          
          {referralCode && (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">Your referral code</p>
                <p className="text-lg font-mono font-semibold text-foreground">{referralCode}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Friends Referred</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-2xl font-semibold text-foreground">{totalPoints}</p>
              </div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
          </div>
        </div>

        {/* Location Access */}
        <div className="dashboard-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <MapPin className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">GPS Location</h2>
              <p className="text-sm text-muted-foreground">
                Enable for customers to find you nearby
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={requestLocation}
            disabled={locationLoading}
            className="google-input-button"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {locationLoading ? "Getting location..." : "Update Business Location"}
          </Button>
          {location && (
            <p className="text-sm text-muted-foreground">
              Location saved: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
        </div>

        {/* Badges & Trust Upgrades */}
        <div className="dashboard-card space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">Badges & Trust Status</h2>
              <p className="text-sm text-muted-foreground">
                Enhance search rankings and establish credibility
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Verification Settings Card */}
            <div className="p-4 bg-muted/30 rounded-2xl border border-border/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Location Badge</span>
                  {businessData.location_verified ? (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                      Verified
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-border/20 uppercase tracking-wider">
                      Unverified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Submit physical trade coordinates and audit documents to be listed as a Verified Merchant for free.
                </p>
              </div>
              <Button
                variant={businessData.location_verified ? "outline" : "default"}
                onClick={() => navigate("/business/verify")}
                className="w-full h-9 rounded-xl font-bold text-xs"
              >
                {businessData.location_verified ? "View Audit Details" : "Get Verified (Free)"}
              </Button>
            </div>

            {/* Premium Settings Card */}
            <div className="p-4 bg-muted/30 rounded-2xl border border-border/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Premium Gold Badge</span>
                  {businessData.verification_tier === "premium" ? (
                    <span className="bg-orange-500/10 text-orange-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-orange-500/20 uppercase tracking-wider">
                      Active 🚀
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-border/20 uppercase tracking-wider">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Unlock 100% smart match weights, dynamic Discover card showcase, and the Gold Elite stars emblem.
                </p>
              </div>
              <Button
                variant={businessData.verification_tier === "premium" ? "outline" : "default"}
                onClick={() => navigate("/business/boost")}
                className={cn(
                  "w-full h-9 rounded-xl font-bold text-xs",
                  businessData.verification_tier !== "premium" && "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:opacity-95 text-white border-0"
                )}
              >
                {businessData.verification_tier === "premium" ? "Manage Subscription" : "Boost Visibility"}
              </Button>
            </div>
          </div>
        </div>

        {/* Withdrawal & Wallet Card */}
        <div className="dashboard-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">Withdrawal & Wallet</h2>
              <p className="text-sm text-muted-foreground">
                Withdraw your accumulated coupon bonus cash
              </p>
            </div>
            <span className="ml-auto font-mono font-bold text-base text-primary">
              ₦{Number(profile?.coupon_balance || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs border border-border/10">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Withdrawals Enabled:</span>
              <span className={cn("font-bold", withdrawConfig.allow ? "text-green-500" : "text-red-500")}>
                {withdrawConfig.allow ? "YES" : "NO"}
              </span>
            </div>
          </div>

          {withdrawConfig.allow && (
            <form onSubmit={handleWithdrawalRequest} className="space-y-3 pt-2 border-t border-border/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request Paystack Bank Payout</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs text-muted-foreground">Bank Name</Label>
                <select
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 h-10 text-sm focus:ring-1 focus:ring-primary"
                  required
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="acctNumber" className="text-xs text-muted-foreground">Account Number</Label>
                  <Input
                    id="acctNumber"
                    maxLength={10}
                    placeholder="10 digit NUBAN"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acctName" className="text-xs text-muted-foreground">Account Name</Label>
                  <Input
                    id="acctName"
                    placeholder="E.g. John Doe"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wdAmount" className="text-xs text-muted-foreground">Amount (₦)</Label>
                <Input
                  id="wdAmount"
                  type="number"
                  placeholder="₦ Amount to withdraw"
                  max={profile?.coupon_balance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) > (profile?.coupon_balance || 0)}
                className="w-full rounded-xl font-semibold mt-2 shadow-lg h-10 animate-pulse-subtle"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Processing Payout...
                  </>
                ) : (
                  "Request Bank Transfer"
                )}
              </Button>
            </form>
          )}

          {/* Withdrawal History Log */}
          {withdrawHistory.length > 0 && (
            <div className="pt-3 border-t border-border/10 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payout History</h4>
              <div className="space-y-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {withdrawHistory.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-2 rounded-xl bg-muted/20 text-[11px] border border-border/5">
                    <div className="text-left">
                      <p className="font-semibold text-foreground">₦{Number(w.amount).toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">{w.bank_name} • {w.account_number}</p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase py-0.5 px-2 rounded-full",
                      w.status === "completed" ? "bg-green-500/10 text-green-500" :
                      w.status === "processing" ? "bg-amber-500/10 text-amber-500" :
                      w.status === "rejected" ? "bg-red-500/10 text-red-500" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="dashboard-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Palette className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Toggle dark/light mode</span>
          </div>
          <div className="pt-2">
            <p className="text-sm font-medium text-foreground mb-2">Color Palette</p>
            <ThemeCustomizer />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleSave} disabled={saving} className="google-input-button">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={signOut} className="google-input-button">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
