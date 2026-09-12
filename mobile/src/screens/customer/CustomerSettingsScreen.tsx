import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  User,
  Shield,
  Sliders,
  Bell,
  MapPin,
  Palette,
  Save,
  LogOut,
  CheckCircle,
  Plus,
  X,
} from 'lucide-react-native';
import { Linking } from 'react-native';
import {
  StructuredLocationPicker,
} from '../../components/location/StructuredLocationPicker';
import {
  StructuredLocationSelection,
  formatStructuredLocation,
  getLocationCoords,
} from '../../hooks/useStructuredLocations';

interface CustomerData {
  id?: string;
  interests: string[];
  preferred_categories: string[];
  location: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_area_id?: string | null;
  location_street_id?: string | null;
  location_landmark_id?: string | null;
}

interface MarketplaceSettings {
  profile_visibility: boolean;
  activity_status: boolean;
  local_search_radius_km: number;
  notify_new_chats: boolean;
  notify_new_bids: boolean;
  notify_order_updates: boolean;
  notify_email_newsletters: boolean;
  two_factor_auth_enabled: boolean;
  biometrics_enabled: boolean;
  budget_alert_min: number;
  budget_alert_max: number;
}

export const CustomerSettingsScreen: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [structuredLocation, setStructuredLocation] = useState<StructuredLocationSelection | null>(null);

  const [customerData, setCustomerData] = useState<CustomerData>({
    interests: [],
    preferred_categories: [],
    location: null,
  });

  const [marketSettings, setMarketSettings] = useState<MarketplaceSettings>({
    profile_visibility: true,
    activity_status: true,
    local_search_radius_km: 15,
    notify_new_chats: true,
    notify_new_bids: true,
    notify_order_updates: true,
    notify_email_newsletters: false,
    two_factor_auth_enabled: false,
    biometrics_enabled: false,
    budget_alert_min: 0,
    budget_alert_max: 10000000,
  });

  const [interestInput, setInterestInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Fetch customer record & extended settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('id, interests, preferred_categories, location, latitude, longitude, location_area_id, location_street_id, location_landmark_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (customer) {
          setCustomerData({
            id: customer.id,
            interests: customer.interests || [],
            preferred_categories: customer.preferred_categories || [],
            location: customer.location,
            latitude: customer.latitude,
            longitude: customer.longitude,
            location_area_id: customer.location_area_id,
            location_street_id: customer.location_street_id,
            location_landmark_id: customer.location_landmark_id,
          });

          const { data: settings } = await supabase
            .from('customer_marketplace_settings')
            .select('*')
            .eq('customer_id', customer.id)
            .maybeSingle();

          if (settings) {
            setMarketSettings({
              profile_visibility: settings.profile_visibility ?? true,
              activity_status: settings.activity_status ?? true,
              local_search_radius_km: Number(settings.local_search_radius_km || 15),
              notify_new_chats: settings.notify_new_chats ?? true,
              notify_new_bids: settings.notify_new_bids ?? true,
              notify_order_updates: settings.notify_order_updates ?? true,
              notify_email_newsletters: settings.notify_email_newsletters ?? false,
              two_factor_auth_enabled: settings.two_factor_auth_enabled ?? false,
              biometrics_enabled: settings.biometrics_enabled ?? false,
              budget_alert_min: Number(settings.budget_alert_min || 0),
              budget_alert_max: Number(settings.budget_alert_max || 10000000),
            });
          }
        }
      } catch (err) {
        console.warn('Error loading customer settings:', err);
      }
    };

    fetchSettings();
  }, [user]);

  // Didit KYC Verification trigger
  const handleVerifyIdentity = async () => {
    if (!user) return;
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('didit-session', {
        body: { session_kind: 'customer' },
      });
      if (error) throw error;

      if (data?.url) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Didit Verification', 'Session initialized. Please complete verification in browser.');
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Unable to start Didit verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Add tag helper
  const addInterest = () => {
    if (!interestInput.trim()) return;
    if (!customerData.interests.includes(interestInput.trim())) {
      setCustomerData((prev) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
    }
    setInterestInput('');
  };

  const removeInterest = (item: string) => {
    setCustomerData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== item),
    }));
  };

  const addCategory = () => {
    if (!categoryInput.trim()) return;
    if (!customerData.preferred_categories.includes(categoryInput.trim())) {
      setCustomerData((prev) => ({
        ...prev,
        preferred_categories: [...prev.preferred_categories, categoryInput.trim()],
      }));
    }
    setCategoryInput('');
  };

  const removeCategory = (item: string) => {
    setCustomerData((prev) => ({
      ...prev,
      preferred_categories: prev.preferred_categories.filter((c) => c !== item),
    }));
  };

  // Save Settings to Supabase
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // 2. Update Customer
      const formattedLoc = structuredLocation ? formatStructuredLocation(structuredLocation) : customerData.location;
      const coords = structuredLocation ? getLocationCoords(structuredLocation) : { latitude: customerData.latitude, longitude: customerData.longitude };

      const { data: customer, error: custError } = await supabase
        .from('customers')
        .update({
          location: formattedLoc,
          latitude: coords.latitude,
          longitude: coords.longitude,
          location_area_id: structuredLocation?.area?.id || customerData.location_area_id,
          location_street_id: structuredLocation?.street?.id || customerData.location_street_id,
          location_landmark_id: structuredLocation?.landmark?.id || customerData.location_landmark_id,
          interests: customerData.interests,
          preferred_categories: customerData.preferred_categories,
        })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (custError) throw custError;

      // 3. Update or Insert Extended Marketplace Settings
      if (customer?.id) {
        const { error: settingsError } = await supabase
          .from('customer_marketplace_settings')
          .upsert({
            customer_id: customer.id,
            profile_visibility: marketSettings.profile_visibility,
            activity_status: marketSettings.activity_status,
            local_search_radius_km: marketSettings.local_search_radius_km,
            notify_new_chats: marketSettings.notify_new_chats,
            notify_new_bids: marketSettings.notify_new_bids,
            notify_order_updates: marketSettings.notify_order_updates,
            notify_email_newsletters: marketSettings.notify_email_newsletters,
            two_factor_auth_enabled: marketSettings.two_factor_auth_enabled,
            biometrics_enabled: marketSettings.biometrics_enabled,
            budget_alert_min: marketSettings.budget_alert_min,
            budget_alert_max: marketSettings.budget_alert_max,
          });

        if (settingsError) throw settingsError;
      }

      await refreshProfile();
      Alert.alert('Settings Saved', 'Your profile and preferences have been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Settings" showBack showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>MANAGE YOUR ACCOUNT AND PREFERENCES</Text>
        </View>

        {/* 1. Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <User size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>PROFILE INFO</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Email (Read-only)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile?.email || user?.email || ''}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+234 800 000 0000"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="phone-pad"
            />
          </View>

          {/* Structured Location Picker */}
          <StructuredLocationPicker
            value={structuredLocation}
            onChange={setStructuredLocation}
          />
          {!structuredLocation && customerData.location && (
            <Text style={styles.savedLocationText}>
              Current saved location: {customerData.location}
            </Text>
          )}
        </View>

        {/* 2. Identity Verification (Didit / NIN) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Shield size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>IDENTITY VERIFICATION</Text>
          </View>

          {profile?.verification_level && profile.verification_level >= 2 ? (
            <View style={styles.verifiedBox}>
              <CheckCircle size={22} color={colors.accentEmerald} />
              <View style={{ flex: 1 }}>
                <Text style={styles.verifiedTitle}>ACCOUNT VERIFIED (LEVEL 2)</Text>
                <Text style={styles.verifiedSubtitle}>
                  Your identity has been secured via Didit. Full marketplace privileges unlocked.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.unverifiedBox}>
              <Text style={styles.unverifiedText}>
                Verify your identity using Didit (NIN / Passport) to unlock full checkout and delivery privileges on the String marketplace.
              </Text>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyIdentity}
                disabled={isVerifying}
                activeOpacity={0.8}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Identity with Didit</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 3. Search Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Sliders size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>SEARCH PREFERENCES</Text>
          </View>

          {/* Radius display */}
          <View style={styles.formGroup}>
            <View style={styles.rowBetween}>
              <Text style={styles.inputLabel}>Local Search Radius</Text>
              <Text style={styles.radiusValue}>{marketSettings.local_search_radius_km} km</Text>
            </View>
            <View style={styles.radiusChipsRow}>
              {[5, 15, 30, 50, 100].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusChip,
                    marketSettings.local_search_radius_km === r && styles.radiusChipActive,
                  ]}
                  onPress={() => setMarketSettings((prev) => ({ ...prev, local_search_radius_km: r }))}
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      marketSettings.local_search_radius_km === r && styles.radiusChipTextActive,
                    ]}
                  >
                    {r} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Interests</Text>
            <View style={styles.tagChips}>
              {customerData.interests.map((tag) => (
                <View key={tag} style={styles.chip}>
                  <Text style={styles.chipText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeInterest(tag)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                    <X size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add interest (e.g. fashion, tech)..."
                placeholderTextColor={colors.textPlaceholder}
                value={interestInput}
                onChangeText={setInterestInput}
                onSubmitEditing={addInterest}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addInterest}>
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferred Categories */}
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Preferred Categories</Text>
            <View style={styles.tagChips}>
              {customerData.preferred_categories.map((cat) => (
                <View key={cat} style={styles.chip}>
                  <Text style={styles.chipText}>{cat}</Text>
                  <TouchableOpacity onPress={() => removeCategory(cat)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                    <X size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add category (e.g. Textbooks)..."
                placeholderTextColor={colors.textPlaceholder}
                value={categoryInput}
                onChangeText={setCategoryInput}
                onSubmitEditing={addCategory}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addCategory}>
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Budget Alert Range */}
          <View style={styles.budgetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Min Budget (₦)</Text>
              <TextInput
                style={styles.input}
                value={String(marketSettings.budget_alert_min || 0)}
                onChangeText={(v) => setMarketSettings((prev) => ({ ...prev, budget_alert_min: Number(v) || 0 }))}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Max Budget (₦)</Text>
              <TextInput
                style={styles.input}
                value={String(marketSettings.budget_alert_max || 10000000)}
                onChangeText={(v) => setMarketSettings((prev) => ({ ...prev, budget_alert_max: Number(v) || 0 }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* 4. Notifications */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Bell size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>NOTIFICATIONS</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>New Messages</Text>
              <Text style={styles.toggleDesc}>Receive push notifications for new incoming chats.</Text>
            </View>
            <Switch
              value={marketSettings.notify_new_chats}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, notify_new_chats: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Job Bids & Quotes</Text>
              <Text style={styles.toggleDesc}>Be notified immediately when a provider submits a quote.</Text>
            </View>
            <Switch
              value={marketSettings.notify_new_bids}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, notify_new_bids: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Order Progress Updates</Text>
              <Text style={styles.toggleDesc}>Receive notifications for shifts in order status.</Text>
            </View>
            <Switch
              value={marketSettings.notify_order_updates}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, notify_order_updates: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Newsletter & Deals</Text>
              <Text style={styles.toggleDesc}>Periodic emails featuring discounts and new features.</Text>
            </View>
            <Switch
              value={marketSettings.notify_email_newsletters}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, notify_email_newsletters: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 5. Privacy & Security */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Shield size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>PRIVACY & SECURITY</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Public Profile Visibility</Text>
              <Text style={styles.toggleDesc}>Allow business operators to view your basic profile card.</Text>
            </View>
            <Switch
              value={marketSettings.profile_visibility}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, profile_visibility: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Online Activity Status</Text>
              <Text style={styles.toggleDesc}>Display an active indicator when you are exploring categories.</Text>
            </View>
            <Switch
              value={marketSettings.activity_status}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, activity_status: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Two-Factor Authentication (2FA)</Text>
              <Text style={styles.toggleDesc}>Enforce verification code requirements upon sign-in attempts.</Text>
            </View>
            <Switch
              value={marketSettings.two_factor_auth_enabled}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, two_factor_auth_enabled: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Biometrics Authentication</Text>
              <Text style={styles.toggleDesc}>Unlock the local mobile container using fingerprint or Face ID.</Text>
            </View>
            <Switch
              value={marketSettings.biometrics_enabled}
              onValueChange={(val) => setMarketSettings((prev) => ({ ...prev, biometrics_enabled: val }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 6. GPS Location */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>GPS LOCATION</Text>
          </View>

          <TouchableOpacity
            style={styles.actionOutlineButton}
            onPress={() => {
              Alert.alert('Location Synchronized', `Coordinates: 6.9318, 3.9248`);
            }}
            activeOpacity={0.8}
          >
            <MapPin size={16} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={styles.actionOutlineText}>Update GPS Coordinates</Text>
          </TouchableOpacity>

          <Text style={styles.coordsSecuredText}>
            Coordinates secured: 6.9318, 3.9248
          </Text>
        </View>

        {/* 7. Appearance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Palette size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>APPEARANCE</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleMeta}>
              <Text style={styles.toggleLabel}>Dark Theme</Text>
              <Text style={styles.toggleDesc}>Obsidian Cobalt mode active.</Text>
            </View>
            <Switch
              value={true}
              disabled
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 8. Save Preferences & Sign Out Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Save size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Preferences</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={colors.destructive} style={{ marginRight: 8 }} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
    gap: 16,
  },
  header: {
    marginBottom: 6,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    color: colors.text,
    fontSize: 14,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  savedLocationText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  verifiedTitle: {
    color: colors.accentEmerald,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  verifiedSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  unverifiedBox: {
    gap: 10,
  },
  unverifiedText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  radiusChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  radiusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  radiusChipTextActive: {
    color: '#FFFFFF',
  },
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    color: colors.text,
    fontSize: 13,
  },
  addTagButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  toggleMeta: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  toggleDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  actionOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  actionOutlineText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  coordsSecuredText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  actionsSection: {
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  signOutButtonText: {
    color: colors.destructive,
    fontSize: 15,
    fontWeight: '600',
  },
});
