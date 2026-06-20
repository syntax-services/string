import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { StructuredLocationPicker } from "@/components/location/StructuredLocationPicker";
import { StructuredLocationSelection, formatStructuredLocation, getLocationCoords } from "@/hooks/useStructuredLocations";

interface LocationRequestFormProps {
  onSuccess?: () => void;
  required?: boolean;
}

export function LocationRequestForm({ onSuccess, required = false }: LocationRequestFormProps) {
  const { user, profile } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<StructuredLocationSelection | null>(null);
  const [locationNote, setLocationNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      toast.error("Please choose your area, street, and landmark");
      return;
    }

    if (!user || !profile) {
      toast.error("Please log in first");
      return;
    }

    setLoading(true);

    try {
      const formattedLocation = formatStructuredLocation(selectedLocation);
      const streetAddress = [formattedLocation, locationNote.trim()].filter(Boolean).join(" - ");
      const coords = getLocationCoords(selectedLocation);
      const dbLandmarkId = selectedLocation.landmark?.id && !selectedLocation.landmark.id.startsWith("default-")
        ? selectedLocation.landmark.id
        : null;

      // Create location request
      const { error: requestError } = await (supabase as any)
        .from("location_requests")
        .insert({
          user_id: user.id,
          user_type: profile.user_type,
          street_address: streetAddress,
          area_name: selectedLocation.area.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

      if (requestError) throw requestError;

      // Update user's profile with the address (unverified)
      const table = profile.user_type === "business" ? "businesses" : "customers";
      
      const { error: updateError } = await (supabase as any)
        .from(table)
        .update({
          street_address: streetAddress,
          area_name: selectedLocation.area.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
          location_area_id: selectedLocation.area.id,
          location_street_id: selectedLocation.street.id,
          location_landmark_id: dbLandmarkId,
          location_verified: false,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setSubmitted(true);
      toast.success("Location submitted for verification!");
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Location submit error:", error);
      const msg = error instanceof Error ? error.message : "Failed to submit location";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Location Pending Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your selected landmark has been saved for review. You'll be notified once verified.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your Location</CardTitle>
        </div>
        <CardDescription>
          Choose the nearest verified landmark so delivery fees can be calculated without paid map APIs.
          {required && <span className="text-destructive ml-1">*Required</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StructuredLocationPicker
            label="Nearest landmark"
            value={selectedLocation}
            onChange={setSelectedLocation}
          />

          <div className="space-y-2">
            <Label htmlFor="location-note">Shop / room note</Label>
            <Textarea
              id="location-note"
              placeholder="E.g., Shop 5, beside the gate"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading || !selectedLocation} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function LocationStatus({ verified, address }: { verified?: boolean; address?: string }) {
  if (!address) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${verified ? 'text-green-600' : 'text-yellow-600'}`}>
      {verified ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>Location verified</span>
        </>
      ) : (
        <>
          <Clock className="h-4 w-4" />
          <span>Pending verification</span>
        </>
      )}
    </div>
  );
}
