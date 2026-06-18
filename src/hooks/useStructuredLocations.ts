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
  landmark: LocationLandmark;
}

export function formatStructuredLocation(selection: StructuredLocationSelection | null) {
  if (!selection) return "";
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
