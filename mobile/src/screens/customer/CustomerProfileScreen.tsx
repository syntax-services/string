import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { 
  User, 
  Store, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Gift, 
  Heart, 
  CreditCard 
} from 'lucide-react-native';

export const CustomerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, profile, business, switchRole, signOut } = useAuth();

  const handleRoleSwitch = async () => {
    if (business) {
      await switchRole('business');
      navigation.reset({ index: 0, routes: [{ name: 'BusinessApp' }] });
    } else {
      Alert.alert(
        'Become a Merchant',
        'Open a verified campus shop to list goods and auto-boost products on TikTok.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Shop', onPress: () => navigation.navigate('SignUp', { initialRole: 'business' }) },
        ]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of String?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="My Profile" showBack={false} showCart />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={36} color={colors.accentCyan} strokeWidth={2.2} />
          </View>
          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profile?.full_name || 'Campus Student'}</Text>
              <ShieldCheck size={16} color={colors.accentEmerald} strokeWidth={2.4} />
            </View>
            <Text style={styles.userEmail}>{user?.email || 'student@unilag.edu.ng'}</Text>
            <Text style={styles.campusBadge}>
              {profile?.campus_location || 'UNILAG Akoka Campus'}
            </Text>
          </View>
        </View>

        {/* Quick Bento Stats */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoCard}>
            <Gift size={20} color={colors.accentCyan} />
            <Text style={styles.bentoVal}>₦{profile?.coupon_balance?.toLocaleString() || '0'}</Text>
            <Text style={styles.bentoLbl}>Reward Credits</Text>
          </View>
          <View style={styles.bentoCard}>
            <ShieldCheck size={20} color={colors.accentEmerald} />
            <Text style={styles.bentoVal}>Level 2</Text>
            <Text style={styles.bentoLbl}>ID Verified</Text>
          </View>
        </View>

        {/* Switch Role Card */}
        <TouchableOpacity
          onPress={handleRoleSwitch}
          style={styles.switchRoleCard}
          activeOpacity={0.85}
        >
          <View style={styles.switchIcon}>
            <Store size={22} color={colors.primaryForeground} />
          </View>
          <View style={styles.switchMeta}>
            <Text style={styles.switchTitle}>
              {business ? 'Switch to Merchant Dashboard' : 'Open Your Campus Store'}
            </Text>
            <Text style={styles.switchSubtitle}>
              {business ? 'Manage inventory, sales & TikTok auto-boost' : 'Start selling to 50,000+ students'}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Action Menu List */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerOrders')}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <CreditCard size={18} color={colors.text} />
              <Text style={styles.menuItemText}>Active Escrow Orders</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerSettings')}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <ShieldCheck size={18} color={profile?.verification_level && profile.verification_level >= 2 ? colors.accentEmerald : colors.primary} />
              <Text style={styles.menuItemText}>
                {profile?.verification_level && profile.verification_level >= 2
                  ? 'Identity Verified (Level 2)'
                  : 'Verify Identity (NIN / Didit)'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerSettings')}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={18} color={colors.text} />
              <Text style={styles.menuItemText}>Security & Settings</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.menuItem, styles.menuItemDestructive]}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <LogOut size={18} color={colors.accentRose} />
              <Text style={styles.menuItemTextDestructive}>Sign Out</Text>
            </View>
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
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileMeta: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 13,
  },
  campusBadge: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  bentoVal: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  bentoLbl: {
    color: colors.textMuted,
    fontSize: 12,
  },
  switchRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    gap: 12,
  },
  switchIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchMeta: {
    flex: 1,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  switchSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemDestructive: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItemTextDestructive: {
    color: colors.accentRose,
    fontSize: 14,
    fontWeight: '600',
  },
});
