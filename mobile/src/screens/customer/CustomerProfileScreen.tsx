import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import {
  Package,
  Briefcase,
  Heart,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Swords,
  Store,
  MapPin,
  Trophy,
} from 'lucide-react-native';

export const CustomerProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, profile, business, switchRole, signOut, refreshProfile } = useAuth();

  const [stats, setStats] = useState({
    orders: 0,
    jobs: 0,
    reviews: 0,
    saved: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [showMerchantAccordion, setShowMerchantAccordion] = useState(false);

  // Fetch real counts for 2x2 grid matching web CustomerProfile.tsx
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfileStats = async () => {
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const customerId = customer?.id || user.id;

        const [ordersRes, savedRes] = await Promise.all([
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('customer_id', customerId),
          supabase
            .from('saved_businesses')
            .select('id', { count: 'exact', head: true })
            .eq('customer_id', user.id),
        ]);

        setStats({
          orders: ordersRes.count || 0,
          jobs: 0,
          reviews: 0,
          saved: savedRes.count || 0,
        });
      } catch (err) {
        console.warn('[STATS FETCH ERROR]', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProfileStats();
  }, [user?.id]);

  const handleRoleSwitch = async () => {
    if (business) {
      await switchRole('business');
      navigation.reset({ index: 0, routes: [{ name: 'BusinessApp' }] });
    } else {
      Alert.alert(
        'Become a Merchant',
        'Open a verified campus store on String to list products, services, and accept escrow payments.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Store',
            onPress: () => navigation.navigate('SignUp', { initialRole: 'business' }),
          },
        ]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of String?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const joinedDate = profile?.created_at
    ? format(new Date(profile.created_at), 'MMMM yyyy')
    : 'Recently';

  return (
    <View style={styles.container}>
      <AppHeader title="My Profile" showBack={false} showCart />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Block (1:1 Photocopy of web CustomerProfile.tsx) */}
        <View style={styles.headerBlock}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.85}
            onPress={() => {
              Alert.alert('Profile Picture', 'To change your photo, update your profile in Account Settings.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => navigation.navigate('CustomerSettings') },
              ]);
            }}
          >
            <View style={styles.avatarRing}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profile?.full_name || 'Campus Student'}</Text>
              <View style={styles.verifiedBadge}>
                <MapPin size={10} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <Text style={styles.userRole}>
              {(profile?.user_type || 'Customer').toUpperCase()}
            </Text>

            {profile?.idic_code && (
              <View style={styles.idicPill}>
                <Trophy size={11} color="#F59E0B" strokeWidth={2.4} />
                <Text style={styles.idicPillText}>IDIC: {profile.idic_department || 'Active'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* IDIC Campus Competition Card (1:1 Web Photocopy) */}
        <View style={styles.idicCard}>
          <View style={styles.idicCardHeader}>
            <Swords size={14} color="#818CF8" strokeWidth={2.4} />
            <Text style={styles.idicCardTag}>CAMPUS COMPETITION</Text>
          </View>
          <Text style={styles.idicCardTitle}>IDIC Inter-Department Tournament</Text>
          <Text style={styles.idicCardDesc}>
            Register your department for the upcoming tournament and compete for campus glory!
          </Text>
          <TouchableOpacity
            style={styles.idicButton}
            activeOpacity={0.85}
            onPress={() => Alert.alert('IDIC Tournament', 'IDIC department registration will open for the upcoming season shortly!')}
          >
            <Text style={styles.idicButtonText}>Register Now</Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 Menu Grid (1:1 Web Photocopy of lines 310-333) */}
        <View style={styles.menuCard}>
          <View style={styles.gridRow}>
            {/* My Orders */}
            <TouchableOpacity
              style={[styles.gridCell, styles.cellBorderRight]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('CustomerOrders')}
            >
              <View style={styles.gridIconBox}>
                <Package size={20} color={colors.primary} strokeWidth={2.2} />
                {stats.orders > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{stats.orders}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.gridLabel}>My Orders</Text>
            </TouchableOpacity>

            {/* My Jobs */}
            <TouchableOpacity
              style={styles.gridCell}
              activeOpacity={0.75}
              onPress={() => Alert.alert('Campus Jobs', 'Explore campus gigs and student freelancing in the next release.')}
            >
              <View style={styles.gridIconBox}>
                <Briefcase size={20} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Text style={styles.gridLabel}>My Jobs</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.gridRow, styles.cellBorderTop]}>
            {/* Saved */}
            <TouchableOpacity
              style={[styles.gridCell, styles.cellBorderRight]}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('CustomerDiscover')}
            >
              <View style={styles.gridIconBox}>
                <Heart size={20} color={colors.primary} strokeWidth={2.2} />
                {stats.saved > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{stats.saved}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.gridLabel}>Saved</Text>
            </TouchableOpacity>

            {/* My Reviews */}
            <TouchableOpacity
              style={styles.gridCell}
              activeOpacity={0.75}
              onPress={() => Alert.alert('My Reviews', 'You can leave reviews directly after confirming delivery on orders.')}
            >
              <View style={styles.gridIconBox}>
                <Star size={20} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Text style={styles.gridLabel}>My Reviews</Text>
            </TouchableOpacity>
          </View>

          {/* Stacked Menu List (1:1 Web Photocopy of lines 335-412) */}
          <View style={styles.stackedList}>
            {/* Merchant Studio Switch */}
            <TouchableOpacity
              style={styles.stackedRow}
              activeOpacity={0.75}
              onPress={handleRoleSwitch}
            >
              <View style={styles.stackedLeft}>
                <View style={styles.stackedIconBox}>
                  <Store size={18} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.stackedLabelPrimary}>
                  {business ? 'Merchant Studio' : 'Open Merchant Store'}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            {/* Account Settings */}
            <TouchableOpacity
              style={styles.stackedRow}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('CustomerSettings')}
            >
              <View style={styles.stackedLeft}>
                <View style={styles.stackedIconBox}>
                  <Settings size={18} color={colors.textMuted} strokeWidth={2.2} />
                </View>
                <Text style={styles.stackedLabel}>Account Settings</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              style={styles.stackedRow}
              activeOpacity={0.75}
              onPress={() => Alert.alert('Help & Support', 'Reach out directly to String Campus support at support@string.com.ng')}
            >
              <View style={styles.stackedLeft}>
                <View style={styles.stackedIconBox}>
                  <HelpCircle size={18} color={colors.textMuted} strokeWidth={2.2} />
                </View>
                <Text style={styles.stackedLabel}>Help & Support</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            {/* Platform Feedback */}
            <TouchableOpacity
              style={styles.stackedRow}
              activeOpacity={0.75}
              onPress={() => Alert.alert('Platform Feedback', 'Thank you for testing String Campus! We value your feedback.')}
            >
              <View style={styles.stackedLeft}>
                <View style={styles.stackedIconBox}>
                  <Star size={18} color={colors.textMuted} strokeWidth={2.2} />
                </View>
                <Text style={styles.stackedLabel}>Submit Platform Feedback</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            {/* Log Out */}
            <TouchableOpacity
              style={styles.stackedRow}
              activeOpacity={0.75}
              onPress={handleSignOut}
            >
              <View style={styles.stackedLeft}>
                <View style={styles.stackedIconBoxDestructive}>
                  <LogOut size={18} color={colors.accentRose} strokeWidth={2.2} />
                </View>
                <Text style={styles.stackedLabelDestructive}>Log Out</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* String Merchant Partnership Accordion (1:1 Web Photocopy of lines 417-445) */}
        {!business && (
          <View style={styles.accordionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              activeOpacity={0.8}
              onPress={() => setShowMerchantAccordion(!showMerchantAccordion)}
            >
              <View style={styles.accordionHeaderLeft}>
                <Briefcase size={16} color={colors.textMuted} strokeWidth={2.2} />
                <Text style={styles.accordionTitle}>STRING MERCHANT PARTNERSHIP</Text>
              </View>
              <ChevronRight
                size={16}
                color={colors.textMuted}
                style={showMerchantAccordion ? styles.chevronRotated : undefined}
              />
            </TouchableOpacity>

            {showMerchantAccordion && (
              <View style={styles.accordionBody}>
                <Text style={styles.accordionText}>
                  Ready to scale your business on String? Set up your merchant profile to showcase products, list premium services, secure transactions via escrow safety, and match instantly with buyers right around your campus region.
                </Text>
                <TouchableOpacity
                  style={styles.partnerButton}
                  activeOpacity={0.85}
                  onPress={handleRoleSwitch}
                >
                  <Store size={15} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.partnerButtonText}>Become a String Partner</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Footer Info (1:1 Web Photocopy of line 464) */}
        <Text style={styles.footerText}>JOINED {joinedDate.toUpperCase()}</Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 110,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 3,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarFallback: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  nameBlock: {
    alignItems: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  userRole: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  idicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  idicPillText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  idicCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  idicCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  idicCardTag: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  idicCardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  idicCardDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  idicButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  idicButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cellBorderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  gridLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  stackedList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stackedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.4)',
  },
  stackedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stackedIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedIconBoxDestructive: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  stackedLabelPrimary: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  stackedLabelDestructive: {
    color: colors.accentRose,
    fontSize: 13,
    fontWeight: '600',
  },
  accordionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  accordionBody: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(18, 21, 28, 0.5)',
    gap: 12,
  },
  accordionText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  partnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  partnerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 8,
  },
});
