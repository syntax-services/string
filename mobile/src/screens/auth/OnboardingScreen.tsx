import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Phone, Building2, Check, ArrowRight } from 'lucide-react-native';

const CAMPUSES = [
  'University of Lagos (UNILAG)',
  'Lagos State University (LASU)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Federal University of Tech, Akure (FUTA)',
  'University of Nigeria, Nsukka (UNN)',
  'Covenant University',
  'Babcock University',
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, profile, refreshProfile, accountType } = useAuth();

  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0]);
  const [landmark, setLandmark] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!landmark.trim()) {
      Alert.alert('Landmark Required', 'Please enter your primary hall, faculty, or landmark.');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Phone Required', 'Please provide a valid contact number for order alerts.');
      return;
    }

    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const fullLocation = `${selectedCampus} - ${landmark.trim()}`;

      // Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: phoneNumber.trim(),
          onboarding_completed: true,
          campus_location: fullLocation,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // If merchant, update business location
      if (accountType === 'business') {
        await supabase
          .from('businesses')
          .update({
            business_location: fullLocation,
            area_name: selectedCampus,
          })
          .eq('user_id', user.id);
      }

      await refreshProfile();
      setIsSubmitting(false);

      if (accountType === 'business') {
        navigation.reset({ index: 0, routes: [{ name: 'BusinessApp' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'CustomerApp' }] });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Onboarding Error', err?.message || 'Could not complete profile.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>CAMPUS ONBOARDING</Text>
          </View>
          <Text style={styles.title}>Locate Your Campus Hub</Text>
          <Text style={styles.subtitle}>
            String optimizes discovery, courier meetups, and escrow handoffs based on your exact campus.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Your Institution</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CAMPUSES.map((c) => {
              const isSelected = selectedCampus === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCampus(c)}
                  style={[styles.campusChip, isSelected && styles.campusChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.campusChipText, isSelected && styles.campusChipTextActive]}>
                    {c.split('(')[1]?.replace(')', '') || c.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.selectedCampusName}>{selectedCampus}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hostel, Faculty or Delivery Landmark</Text>
            <View style={styles.inputWrapper}>
              <Building2 size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Jaja Hall, Faculty of Science, New Hall"
                placeholderTextColor={colors.textPlaceholder}
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp / Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 0801 234 5678"
                placeholderTextColor={colors.textPlaceholder}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.helperText}>Required for real-time delivery code SMS & escrow calls.</Text>
          </View>

          <TouchableOpacity
            onPress={handleComplete}
            style={[styles.completeButton, isSubmitting && styles.buttonDisabled]}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.completeButtonText}>Launch Marketplace</Text>
                <ArrowRight size={18} color={colors.primaryForeground} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    marginBottom: 12,
  },
  stepText: {
    color: colors.accentCyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  campusChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  campusChipActive: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.accentCyan,
  },
  campusChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  campusChipTextActive: {
    color: colors.accentCyan,
    fontWeight: '700',
  },
  selectedCampusName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  completeButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});
