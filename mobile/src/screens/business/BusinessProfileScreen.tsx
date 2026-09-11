import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import {
  Store,
  ShieldCheck,
  MapPin,
  Clock,
  LogOut,
  Save,
  CheckCircle2,
  ChevronRight,
  User,
  ExternalLink,
} from 'lucide-react-native';

export const BusinessProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { business, switchRole, signOut, refreshAuth } = useAuth();

  const [companyName, setCompanyName] = useState(business?.company_name || '');
  const [description, setDescription] = useState(business?.description || '');
  const [businessLocation, setBusinessLocation] = useState(business?.business_location || '');
  const [areaName, setAreaName] = useState(business?.area_name || '');
  const [isOpenNow, setIsOpenNow] = useState(business?.is_open_now ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!business?.id) return;
    if (!companyName.trim()) {
      Alert.alert('Required Field', 'Please enter your business or shop name.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          company_name: companyName.trim(),
          description: description.trim(),
          business_location: businessLocation.trim(),
          area_name: areaName.trim(),
          is_open_now: isOpenNow,
        })
        .eq('id', business.id);

      if (error) throw error;

      await refreshAuth();
      Alert.alert('Profile Updated', 'Your campus store profile has been saved.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Unable to update store profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchToCustomer = async () => {
    await switchRole('customer');
    navigation.reset({ index: 0, routes: [{ name: 'CustomerApp' }] });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Store Profile"
        subtitle="Manage public campus presence"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Save size={16} color={colors.primaryForeground} />
                <Text style={styles.saveBtnText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Store Verification Card */}
        <View style={styles.card}>
          <View style={styles.storeHeaderRow}>
            <View style={styles.storeAvatar}>
              <Store size={28} color={colors.accentCyan} />
            </View>
            <View style={styles.storeHeaderInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.companyTitle}>{companyName || 'Campus Shop'}</Text>
                {business?.verified && (
                  <CheckCircle2 size={16} color={colors.accentEmerald} strokeWidth={2.6} />
                )}
              </View>
              <Text style={styles.storeSubtitle}>
                {business?.verified
                  ? 'Verified Campus Merchant'
                  : 'Pending Student Verification'}
              </Text>
            </View>
          </View>

          {/* Live Status Toggle */}
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View style={styles.statusLabelRow}>
                <Clock size={16} color={isOpenNow ? colors.accentEmerald : colors.textMuted} />
                <Text style={styles.statusLabel}>
                  {isOpenNow ? 'Open & Accepting Orders' : 'Store Closed (Vacation Mode)'}
                </Text>
              </View>
              <Text style={styles.statusDesc}>
                {isOpenNow
                  ? 'Students can browse, chat, and order from your shop'
                  : 'Your listings remain visible but ordering is paused'}
              </Text>
            </View>
            <Switch
              value={isOpenNow}
              onValueChange={setIsOpenNow}
              trackColor={{ false: colors.border, true: 'rgba(16, 185, 129, 0.4)' }}
              thumbColor={isOpenNow ? colors.accentEmerald : colors.textMuted}
            />
          </View>
        </View>

        {/* Store Information Form */}
        <Text style={styles.sectionHeader}>STORE DETAILS</Text>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Shop / Brand Name</Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Campus Bites & Gadgets"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Campus Location / Landmark</Text>
            <TextInput
              style={styles.input}
              value={businessLocation}
              onChangeText={setBusinessLocation}
              placeholder="e.g. Faculty of Engineering / Hall 4"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Pickup Room / Area Details</Text>
            <TextInput
              style={styles.input}
              value={areaName}
              onChangeText={setAreaName}
              placeholder="e.g. Room B12, New Complex"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Store Bio & Notice</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what your campus store offers, delivery times, and notes..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Mode Switch & Actions */}
        <Text style={styles.sectionHeader}>ACCOUNT & SWITCHING</Text>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={handleSwitchToCustomer}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <User size={18} color={colors.accentCyan} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuItemTitle}>Switch to Student Marketplace</Text>
              <Text style={styles.menuItemSubtitle}>Browse campus goods, food & services</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.fieldDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessPayments')}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <ShieldCheck size={18} color={colors.accentEmerald} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuItemTitle}>Settlement & Bank Accounts</Text>
              <Text style={styles.menuItemSubtitle}>Configure instant payout account</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.fieldDivider} />

          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <LogOut size={18} color={colors.destructive} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={[styles.menuItemTitle, { color: colors.destructive }]}>Sign Out</Text>
              <Text style={styles.menuItemSubtitle}>End current mobile session</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPad} />
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
    padding: 16,
    paddingBottom: 120,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  storeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  storeSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  fieldGroup: {
    paddingVertical: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    color: colors.text,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  multilineInput: {
    minHeight: 80,
    lineHeight: 20,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  bottomPad: {
    height: 40,
  },
});
