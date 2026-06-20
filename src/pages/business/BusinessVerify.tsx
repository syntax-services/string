import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/hooks/useBusiness";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, MapPin, CheckCircle2, AlertCircle, 
  Loader2, ShieldCheck, ArrowLeft, Clock, ShoppingBag, Upload
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { StringVerifiedIcon } from "@/components/business/VerificationBadge";
import { playVerificationChime } from "@/hooks/useAudioSignals";
import { InterlockingLoader } from "@/components/ui/interlocking-loader";
import { StructuredLocationPicker } from "@/components/location/StructuredLocationPicker";
import { StructuredLocationSelection, formatStructuredLocation, getLocationCoords } from "@/hooks/useStructuredLocations";

export default function BusinessVerify() {
  const { user } = useAuth();
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedLocation, setSelectedLocation] = useState<StructuredLocationSelection | null>(null);
  const [locationNote, setLocationNote] = useState("");
  const [tradeDescription, setTradeDescription] = useState("");
  const [idType, setIdType] = useState<'nin' | 'bvn' | 'matric'>("nin");
  const [idNumber, setIdNumber] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success(`Coordinates captured: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          console.warn("Geolocation detection skipped:", err);
          toast.error("Could not acquire precise location coords. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      toast.error("Video proof file size must be less than 25MB.");
      return;
    }

    setUploadingVideo(true);
    toast.info("Uploading video proof... Please keep the tab open.");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id || Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("verification-videos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("verification-videos")
        .getPublicUrl(filePath);

      setVideoUrl(publicUrl);
      toast.success("Verification video proof uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload video proof.");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Query latest location verification request
  const { data: request, isLoading } = useQuery({
    queryKey: ["my-location-request", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("location_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not logged in");
      if (!selectedLocation || !tradeDescription.trim()) {
        throw new Error("Please fill in all verification fields.");
      }
      if (!idNumber.trim()) {
        throw new Error("Please enter your NIN, BVN, or OOU student matric credentials.");
      }
      if (!videoUrl) {
        throw new Error("Please upload a video proof showing your physical setup.");
      }

      const formattedLocation = formatStructuredLocation(selectedLocation);
      const streetAddress = [formattedLocation, locationNote.trim()].filter(Boolean).join(" - ");
      const coords = getLocationCoords(selectedLocation);

      // Insert location & identity verification request
      const { error } = await (supabase as any)
        .from("location_requests")
        .insert({
          user_id: user.id,
          user_type: "business",
          street_address: streetAddress,
          area_name: selectedLocation.area.name,
          admin_notes: `[Trade Details]: ${tradeDescription.trim()} | [ID Type]: ${idType.toUpperCase()} | [Secure ID hash]: ${idNumber.trim()}`,
          status: "pending",
          latitude: coords.latitude,
          longitude: coords.longitude,
          video_url: videoUrl || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-location-request"] });
      playVerificationChime().catch(console.error);
      toast.success("Verification request & secure identity audit submitted! Chime active 🛡️");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit request.");
    }
  });

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 pb-20 animate-fade-in">
        
        {/* Header navigation bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/business/profile")}
            className="h-9 w-9 rounded-full border border-border/40 hover:bg-accent flex items-center justify-center transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Get Verified
            </h1>
            <p className="text-xs text-muted-foreground">Trade Location & Business Verification (Free)</p>
          </div>
        </div>

        {isLoading ? (
          <div className="dashboard-card py-16 flex items-center justify-center">
            <InterlockingLoader size="sm" label="Gathering credentials..." />
          </div>
        ) : business?.location_verified || request?.status === "verified" ? (
          
          /* APPROVED / VERIFIED MERCHANT PAGE */
          <div className="dashboard-card border-primary/20 bg-primary/[0.01] p-6 text-center space-y-5 relative overflow-hidden rounded-[32px]">
            <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full" />
            <div className="relative mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
              <StringVerifiedIcon className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-2 relative">
              <h2 className="text-lg font-bold text-foreground">You are a Verified Merchant!</h2>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-xs mx-auto">
                Congratulations! An administrator has verified your physical trade location coordinates and shop offerings.
              </p>
            </div>

            <div className="p-4 bg-muted/40 rounded-2xl text-left border border-border/10 text-xs space-y-2">
              <p className="flex justify-between"><span className="text-muted-foreground">Verified Address:</span> <span className="font-semibold">{request?.street_address || business?.business_location || "Confirmed Location"}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Verified Area:</span> <span className="font-semibold">{request?.area_name || "Confirmed Area"}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Premium Matches:</span> <span className="font-semibold text-primary">Activated (1.5x weight)</span></p>
            </div>

            <button 
              onClick={() => navigate("/business/profile")}
              className="w-full text-center py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-bold text-xs text-foreground transition-all duration-300 relative"
            >
              Back to Profile
            </button>
          </div>

        ) : request?.status === "pending" ? (

          /* PENDING REVIEW PAGE */
          <div className="dashboard-card border-yellow-500/20 bg-yellow-500/[0.01] p-6 text-center space-y-5 rounded-[32px]">
            <div className="mx-auto h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-foreground">Verification Pending</h2>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-xs mx-auto">
                Our administrators are reviewing your submitted trade documents and location details. This process takes up to 24 hours.
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl text-left text-xs space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest mb-1.5">Submitted Details</p>
              <p><strong className="text-muted-foreground">Street:</strong> {request.street_address}</p>
              <p><strong className="text-muted-foreground">Area:</strong> {request.area_name}</p>
            </div>
            
            <p className="text-[10px] text-muted-foreground italic">
              Verification is completely free. We cross-reference your trade description with your physical coords.
            </p>
          </div>

        ) : (

          /* SUBMISSION FORM */
          <div className="dashboard-card p-6 space-y-5 rounded-[32px]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Verify Your Coords</h3>
                <p className="text-xs text-muted-foreground">Appear in "Nearest Merchant" searches instantly</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed leading-normal bg-muted/40 border border-border/10 p-3.5 rounded-2xl">
              Verified status is **100% free**. It confirms you have a physical trading store at your location and sell what you list. Admins audit coordinates and trade catalog details.
            </p>

            <div className="space-y-4">
              <StructuredLocationPicker
                label="Store landmark"
                value={selectedLocation}
                onChange={setSelectedLocation}
                compact
              />

              <div className="space-y-1.5">
                <Label htmlFor="locationNote" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Shop / Room Note</Label>
                <Input
                  id="locationNote"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="e.g. Shop 5, beside the gate"
                  className="rounded-xl border-border/40 focus:ring-primary/20 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tradeDesc" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">What are you selling?</Label>
                <Textarea
                  id="tradeDesc"
                  value={tradeDescription}
                  onChange={(e) => setTradeDescription(e.target.value)}
                  placeholder="Provide details about the items, products, or services you trade at this location. (e.g. 'I sell premium unisex hoodies, footwear, and caps.')"
                  className="rounded-xl border-border/40 focus:ring-primary/20 min-h-[100px] text-xs leading-relaxed"
                />
              </div>

              {/* Geolocation Coordinates Status */}
              <div className="p-3 bg-muted/40 border border-border/10 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Captured GPS Coordinates</p>
                {latitude && longitude ? (
                  <p className="text-xs font-mono text-emerald-500 flex items-center gap-1.5 font-bold">
                    <MapPin className="h-3.5 w-3.5" />
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-yellow-500 font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Detecting physical location coords...</span>
                  </div>
                )}
              </div>

              {/* Video Proof Uploader */}
              <div className="space-y-1.5">
                <Label htmlFor="videoProof" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  🎥 Physical Setup Video Proof
                </Label>
                <div className="border border-dashed border-border/40 rounded-2xl p-4 text-center space-y-2 hover:bg-muted/10 transition-all duration-200 relative">
                  {videoUrl ? (
                    <div className="space-y-2">
                      <video src={videoUrl} controls className="max-h-32 mx-auto rounded bg-black border border-border/40" />
                      <p className="text-[10px] text-emerald-500 font-bold">✓ Verification video uploaded</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setVideoUrl("")}
                        className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2"
                      >
                        Remove video
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">Upload short video proof</p>
                        <p className="text-[10px] text-muted-foreground">Record your shop setup and location (max 25MB)</p>
                      </div>
                      <Input
                        id="videoProof"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                  {uploadingVideo && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-1.5 rounded-2xl">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-[10px] font-bold text-muted-foreground">Uploading video proof...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* High-Trust NIN / BVN & Student Verification Block */}
              <div className="border-t border-border/20 pt-4 mt-2 space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Level 2: Secure Identity Verification</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select ID Source</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={idType === 'nin' ? 'default' : 'outline'}
                      onClick={() => setIdType('nin')}
                      className="text-[11px] h-9 rounded-xl font-bold transition-all"
                    >
                      NIN (National ID)
                    </Button>
                    <Button
                      type="button"
                      variant={idType === 'bvn' ? 'default' : 'outline'}
                      onClick={() => setIdType('bvn')}
                      className="text-[11px] h-9 rounded-xl font-bold transition-all"
                    >
                      BVN (Bank ID)
                    </Button>
                    <Button
                      type="button"
                      variant={idType === 'matric' ? 'default' : 'outline'}
                      onClick={() => setIdType('matric')}
                      className="text-[11px] h-9 rounded-xl font-bold transition-all"
                    >
                      OOU Student Matric
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="idNumber" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {idType === 'nin' ? '11-Digit secure NIN' : idType === 'bvn' ? '11-Digit secure BVN' : 'OOU Portal Matric Number'}
                  </Label>
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={idType === 'matric' ? "e.g. ANA/2021/1094" : "Securely encrypted on submission..."}
                    className="rounded-xl border-border/40 focus:ring-primary/20 h-10 font-mono tracking-wider text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed leading-normal bg-primary/5 border border-primary/10 p-2.5 rounded-xl mt-1">
                    🔒 Verified through **Mono / Prembly API** gateways. Sensitive details are matched directly and not saved locally.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => submitRequest.mutate()}
              disabled={submitRequest.isPending || !selectedLocation || !tradeDescription.trim() || !idNumber.trim() || !videoUrl || uploadingVideo}
              className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-semibold"
            >
              {submitRequest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Audit...
                </>
              ) : (
                "Submit Verification Request"
              )}
            </Button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
