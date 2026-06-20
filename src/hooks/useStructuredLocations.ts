import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LocationArea {
  id: string;
  name: string;
  slug: string;
}

export interface LocationStreet {
  id: string;
  area_id: string;
  name: string;
  slug: string;
}

export interface LocationLandmark {
  id: string;
  street_id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  kind: string;
}

export interface StructuredLocationSelection {
  area: LocationArea;
  street: LocationStreet;
  landmark?: LocationLandmark | null;
}

export const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  "aiyegbami": { lat: 6.9318, lng: 3.9248 },
  "ibipe": { lat: 6.9315, lng: 3.9188 },
  "isamuro": { lat: 6.9325, lng: 3.9214 },
  "idode": { lat: 6.9304, lng: 3.9213 },
  "igan": { lat: 6.9320, lng: 3.9238 },
  "imere": { lat: 6.9310, lng: 3.9246 },
  "imosu": { lat: 6.9307, lng: 3.9252 },
  "abobi": { lat: 6.9321, lng: 3.9255 },
  "pepsi": { lat: 6.9478, lng: 3.9256 },
  "pepsi-alwo": { lat: 6.9478, lng: 3.9256 },
  "oou-main-campus": { lat: 6.9633, lng: 3.9189 },
  "main-campus": { lat: 6.9633, lng: 3.9189 },
  "itamerin": { lat: 6.9450, lng: 3.9200 },
  "oru": { lat: 6.9620, lng: 3.9400 },
  "mini-campus": { lat: 6.9200, lng: 3.9000 },
};

export function getLocationCoords(selection: StructuredLocationSelection | null): { latitude: number; longitude: number } {
  if (!selection) return { latitude: 6.9318, longitude: 3.9248 };
  
  if (selection.landmark) {
    return {
      latitude: selection.landmark.latitude,
      longitude: selection.landmark.longitude
    };
  }
  
  const areaSlug = selection.area.slug?.toLowerCase() || "";
  const coords = areaCoordinates[areaSlug] || { lat: 6.9318, lng: 3.9248 };
  return {
    latitude: coords.lat,
    longitude: coords.lng
  };
}

export function formatStructuredLocation(selection: StructuredLocationSelection | null) {
  if (!selection) return "";
  if (!selection.landmark) {
    return `${selection.street.name}, ${selection.area.name}`;
  }
  return `${selection.landmark.name}, ${selection.street.name}, ${selection.area.name}`;
}


export function useLocationAreas() {
  return useQuery({
    queryKey: ["location-areas"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("location_areas")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as LocationArea[];
    },
  });
}

export function useLocationStreets(areaId?: string | null) {
  return useQuery({
    queryKey: ["location-streets", areaId],
    queryFn: async () => {
      if (!areaId) return [];

      const { data, error } = await (supabase as any)
        .from("location_streets")
        .select("id, area_id, name, slug")
        .eq("area_id", areaId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as LocationStreet[];
    },
    enabled: !!areaId,
  });
}

export function useLocationLandmarks(streetId?: string | null) {
  return useQuery({
    queryKey: ["location-landmarks", streetId],
    queryFn: async () => {
      if (!streetId) return [];

      const { data, error } = await (supabase as any)
        .from("location_landmarks")
        .select("id, street_id, name, slug, latitude, longitude, kind")
        .eq("street_id", streetId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as LocationLandmark[];
    },
    enabled: !!streetId,
  });
}
