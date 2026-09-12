import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MapPin, ChevronDown, Check, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import {
  LocationArea,
  LocationStreet,
  LocationLandmark,
  StructuredLocationSelection,
  useLocationAreas,
  useLocationStreets,
  useLocationLandmarks,
  areaCoordinates,
} from '../../hooks/useStructuredLocations';

interface StructuredLocationPickerProps {
  label?: string;
  value?: StructuredLocationSelection | null;
  onChange: (selection: StructuredLocationSelection | null) => void;
}

type PickerType = 'area' | 'street' | 'landmark' | null;

export const StructuredLocationPicker: React.FC<StructuredLocationPickerProps> = ({
  label = 'Delivery Address / Location',
  value = null,
  onChange,
}) => {
  const [areaId, setAreaId] = useState(value?.area?.id ?? '');
  const [streetId, setStreetId] = useState(value?.street?.id ?? '');
  const [landmarkId, setLandmarkId] = useState(value?.landmark?.id ?? '');
  const [activePicker, setActivePicker] = useState<PickerType>(null);

  const { data: areas = [], isLoading: loadingAreas } = useLocationAreas();
  const { data: streets = [], isLoading: loadingStreets } = useLocationStreets(areaId);
  const { data: landmarks = [], isLoading: loadingLandmarks } = useLocationLandmarks(streetId);

  useEffect(() => {
    setAreaId(value?.area?.id ?? '');
    setStreetId(value?.street?.id ?? '');
    setLandmarkId(value?.landmark?.id ?? '');
  }, [value?.area?.id, value?.street?.id, value?.landmark?.id]);

  const selectedArea = useMemo(
    () => areas.find((a) => a.id === areaId) ?? null,
    [areas, areaId]
  );
  const selectedStreet = useMemo(
    () => streets.find((s) => s.id === streetId) ?? null,
    [streets, streetId]
  );

  const combinedLandmarks = useMemo(() => {
    if (!selectedStreet || !selectedArea) return [];
    const areaSlug = selectedArea.slug?.toLowerCase() || '';
    const fallback = areaCoordinates[areaSlug] || { lat: 6.9318, lng: 3.9248 };

    const defaultOpt: LocationLandmark = {
      id: `default-${selectedStreet.id}`,
      street_id: selectedStreet.id,
      name: `General / Other (${selectedStreet.name})`,
      slug: `general-${selectedStreet.slug}`,
      latitude: fallback.lat,
      longitude: fallback.lng,
      kind: 'street',
    };

    return [defaultOpt, ...landmarks];
  }, [landmarks, selectedStreet, selectedArea]);

  const selectedLandmark = useMemo(
    () => combinedLandmarks.find((l) => l.id === landmarkId) ?? null,
    [combinedLandmarks, landmarkId]
  );

  const handleSelectArea = (area: LocationArea) => {
    setAreaId(area.id);
    setStreetId('');
    setLandmarkId('');
    setActivePicker(null);
    onChange(null);
  };

  const handleSelectStreet = (street: LocationStreet) => {
    setStreetId(street.id);
    setLandmarkId('');
    setActivePicker(null);
    if (selectedArea) {
      onChange({ area: selectedArea, street, landmark: null });
    }
  };

  const handleSelectLandmark = (landmark: LocationLandmark) => {
    setLandmarkId(landmark.id);
    setActivePicker(null);
    if (selectedArea && selectedStreet) {
      onChange({ area: selectedArea, street: selectedStreet, landmark });
    }
  };

  const coordsText = useMemo(() => {
    if (selectedLandmark) {
      return `${selectedLandmark.latitude.toFixed(4)}, ${selectedLandmark.longitude.toFixed(4)}`;
    }
    if (selectedArea) {
      const c = areaCoordinates[selectedArea.slug?.toLowerCase() || ''] || { lat: 6.9318, lng: 3.9248 };
      return `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
    }
    return null;
  }, [selectedLandmark, selectedArea]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {coordsText && (
          <View style={styles.coordsBadge}>
            <MapPin size={11} color={colors.primary} />
            <Text style={styles.coordsText}>{coordsText}</Text>
          </View>
        )}
      </View>

      {/* Selectors Grid */}
      <View style={styles.selectors}>
        {/* Area Button */}
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setActivePicker('area')}
          activeOpacity={0.7}
        >
          <Text style={styles.triggerLabel}>CAMPUS AREA</Text>
          <View style={styles.triggerValueRow}>
            <Text style={[styles.triggerValue, !selectedArea && styles.placeholderText]} numberOfLines={1}>
              {selectedArea ? selectedArea.name : 'Select campus area'}
            </Text>
            <ChevronDown size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Street Button */}
        <TouchableOpacity
          style={[styles.pickerTrigger, !selectedArea && styles.triggerDisabled]}
          onPress={() => selectedArea && setActivePicker('street')}
          disabled={!selectedArea}
          activeOpacity={0.7}
        >
          <Text style={styles.triggerLabel}>STREET / ZONE</Text>
          <View style={styles.triggerValueRow}>
            <Text style={[styles.triggerValue, !selectedStreet && styles.placeholderText]} numberOfLines={1}>
              {selectedStreet ? selectedStreet.name : selectedArea ? 'Select street' : 'Select area first'}
            </Text>
            <ChevronDown size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Landmark / Delivery Spot Button */}
        <TouchableOpacity
          style={[styles.pickerTrigger, !selectedStreet && styles.triggerDisabled]}
          onPress={() => selectedStreet && setActivePicker('landmark')}
          disabled={!selectedStreet}
          activeOpacity={0.7}
        >
          <Text style={styles.triggerLabel}>LANDMARK / HOSTEL SPOT</Text>
          <View style={styles.triggerValueRow}>
            <Text style={[styles.triggerValue, !selectedLandmark && styles.placeholderText]} numberOfLines={1}>
              {selectedLandmark ? selectedLandmark.name : selectedStreet ? 'Select landmark / hostel' : 'Select street first'}
            </Text>
            <ChevronDown size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal Picker */}
      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === 'area'
                  ? 'Select Campus Area'
                  : activePicker === 'street'
                  ? 'Select Street / Zone'
                  : 'Select Landmark / Hostel'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {loadingAreas || loadingStreets || loadingLandmarks ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 30 }} />
            ) : (
              <FlatList
                data={
                  activePicker === 'area'
                    ? areas
                    : activePicker === 'street'
                    ? streets
                    : combinedLandmarks
                }
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: { item: any }) => {
                  const isSelected =
                    (activePicker === 'area' && item.id === areaId) ||
                    (activePicker === 'street' && item.id === streetId) ||
                    (activePicker === 'landmark' && item.id === landmarkId);

                  return (
                    <TouchableOpacity
                      style={[styles.itemRow, isSelected && styles.itemRowActive]}
                      onPress={() => {
                        if (activePicker === 'area') handleSelectArea(item);
                        else if (activePicker === 'street') handleSelectStreet(item);
                        else if (activePicker === 'landmark') handleSelectLandmark(item);
                      }}
                    >
                      <Text style={[styles.itemText, isSelected && styles.itemTextActive]}>
                        {item.name}
                      </Text>
                      {isSelected && <Check size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                style={styles.list}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  coordsText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  selectors: {
    gap: 8,
  },
  pickerTrigger: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  triggerValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: colors.textPlaceholder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemRowActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 8,
  },
  itemText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  itemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
