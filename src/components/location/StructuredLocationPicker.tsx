import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LocationArea,
  LocationLandmark,
  LocationStreet,
  StructuredLocationSelection,
  formatStructuredLocation,
  useLocationAreas,
  useLocationLandmarks,
  useLocationStreets,
} from "@/hooks/useStructuredLocations";

interface StructuredLocationPickerProps {
  label?: string;
  value?: StructuredLocationSelection | null;
  onChange: (selection: StructuredLocationSelection | null) => void;
  compact?: boolean;
}

export function StructuredLocationPicker({
  label = "Location",
  value = null,
  onChange,
  compact = false,
}: StructuredLocationPickerProps) {
  const [areaId, setAreaId] = useState(value?.area.id ?? "");
  const [streetId, setStreetId] = useState(value?.street.id ?? "");
  const [landmarkId, setLandmarkId] = useState(value?.landmark.id ?? "");

  const { data: areas = [], isLoading: loadingAreas } = useLocationAreas();
  const { data: streets = [], isLoading: loadingStreets } = useLocationStreets(areaId);
  const { data: landmarks = [], isLoading: loadingLandmarks } = useLocationLandmarks(streetId);

  useEffect(() => {
    setAreaId(value?.area.id ?? "");
    setStreetId(value?.street.id ?? "");
    setLandmarkId(value?.landmark.id ?? "");
  }, [value?.area.id, value?.street.id, value?.landmark.id]);

  const selectedArea = useMemo(
    () => areas.find((area) => area.id === areaId) ?? null,
    [areas, areaId],
  );
  const selectedStreet = useMemo(
    () => streets.find((street) => street.id === streetId) ?? null,
    [streets, streetId],
  );
  const selectedLandmark = useMemo(
    () => landmarks.find((landmark) => landmark.id === landmarkId) ?? null,
    [landmarks, landmarkId],
  );

  const emitSelection = (
    nextArea: LocationArea | null,
    nextStreet: LocationStreet | null,
    nextLandmark: LocationLandmark | null,
  ) => {
    if (nextArea && nextStreet && nextLandmark) {
      onChange({ area: nextArea, street: nextStreet, landmark: nextLandmark });
      return;
    }

    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-bold uppercase text-muted-foreground">{label}</Label>
        {selectedLandmark && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
            <MapPin className="h-3 w-3" />
            {selectedLandmark.latitude.toFixed(4)}, {selectedLandmark.longitude.toFixed(4)}
          </span>
        )}
      </div>

      <div className={compact ? "grid gap-2 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-3"}>
        <Select
          value={areaId}
          onValueChange={(nextAreaId) => {
            const nextArea = areas.find((area) => area.id === nextAreaId) ?? null;
            setAreaId(nextAreaId);
            setStreetId("");
            setLandmarkId("");
            emitSelection(nextArea, null, null);
          }}
        >
          <SelectTrigger className={compact ? "h-9 rounded-xl text-xs" : "h-11 rounded-xl"}>
            <SelectValue placeholder={loadingAreas ? "Loading..." : "Area"} />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={streetId}
          disabled={!areaId || loadingStreets}
          onValueChange={(nextStreetId) => {
            const nextStreet = streets.find((street) => street.id === nextStreetId) ?? null;
            setStreetId(nextStreetId);
            setLandmarkId("");
            emitSelection(selectedArea, nextStreet, null);
          }}
        >
          <SelectTrigger className={compact ? "h-9 rounded-xl text-xs" : "h-11 rounded-xl"}>
            <SelectValue placeholder={loadingStreets ? "Loading..." : "Street"} />
          </SelectTrigger>
          <SelectContent>
            {streets.map((street) => (
              <SelectItem key={street.id} value={street.id}>
                {street.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={landmarkId}
          disabled={!streetId || loadingLandmarks}
          onValueChange={(nextLandmarkId) => {
            const nextLandmark = landmarks.find((landmark) => landmark.id === nextLandmarkId) ?? null;
            setLandmarkId(nextLandmarkId);
            emitSelection(selectedArea, selectedStreet, nextLandmark);
          }}
        >
          <SelectTrigger className={compact ? "h-9 rounded-xl text-xs" : "h-11 rounded-xl"}>
            <SelectValue placeholder={loadingLandmarks ? "Loading..." : "Landmark"} />
          </SelectTrigger>
          <SelectContent>
            {landmarks.map((landmark) => (
              <SelectItem key={landmark.id} value={landmark.id}>
                {landmark.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value && (
        <p className="text-[11px] text-muted-foreground">
          {formatStructuredLocation(value)}
        </p>
      )}
    </div>
  );
}
