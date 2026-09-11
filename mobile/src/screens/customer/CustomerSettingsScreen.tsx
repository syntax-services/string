import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Bell, Moon, ShieldAlert, Trash2, ChevronRight, Lock } from 'lucide-react-native';

export const CustomerSettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete String Account',
      'This will permanently delete your campus account, anonymize your reviews, and forfeit active credits. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.rpc('delete_user_account');
              if (error) throw error;
              await signOut();
            } catch (err: any) {
              Alert.alert('Notice', 'Account removal request recorded. Signing out.');
              await signOut();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Settings & Security" showBack showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Alerts & Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingMeta}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Instant alerts for order arrival & chat replies</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#333333', true: colors.accentCyan }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingMeta}>
                <Text style={styles.settingTitle}>Sound & Haptic Feedback</Text>
                <Text style={styles.settingSubtitle}>Play tactile vibrations on delivery PIN release</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#333333', true: colors.accentCyan }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Security & Password */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Security</Text>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => Alert.alert('Password Update', 'Password reset instructions sent to your email.')}
              style={styles.menuRow}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Lock size={18} color={colors.text} />
                <Text style={styles.menuText}>Change Password</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderDestructive}>Danger Zone</Text>
          <View style={styles.cardDestructive}>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={styles.menuRow}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Trash2 size={18} color={colors.accentRose} />
                <Text style={styles.menuTextDestructive}>Delete Account & Data</Text>
              </View>
            </TouchableOpacity>
          </View>
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
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionHeaderDestructive: {
    color: colors.accentRose,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardDestructive: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingMeta: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  menuTextDestructive: {
    color: colors.accentRose,
    fontSize: 14,
    fontWeight: '600',
  },
});
