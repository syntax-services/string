import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  Package,
  Briefcase,
  ArrowUpRight,
  Eye,
  Plus,
  Store,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react-native';

export const BusinessOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, profile, business } = useAuth();

  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingJobs: 0,
    marketLeads: 4,
    profileViews: 142,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBusinessOverview = async () => {
    if (!business?.id) return;
    try {
      // 1. Fetch pending orders count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .in('status', ['pending', 'confirmed', 'processing']);

      // 2. Fetch recent orders for live activity stream
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, total_price, total_amount, status, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setStats({
        pendingOrders: pendingCount || 0,
        pendingJobs: 0,
        marketLeads: 6,
        profileViews: business.views_count || 142,
      });

      setRecentActivity(recentOrders || []);
    } catch (err) {
      console.error('[OVERVIEW FETCH ERROR]', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusinessOverview();
  }, [business?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinessOverview();
  };

  const isLocationVerified = !!business?.location_verified || (profile?.verification_level && profile.verification_level >= 2);

  return (
    <View style={styles.container}>
      <AppHeader title="Store Dashboard" showBack={false} showCart={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Unverified Location Alert Banner (1:1 Web Photocopy lines 228-247) */}
        {!isLocationVerified && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIconCol}>
              <AlertTriangle size={18} color="#F59E0B" />
            </View>
            <View style={styles.alertTextCol}>
              <Text style={styles.alertTitle}>Location Verification Required</Text>
              <Text style={styles.alertDesc}>
                Your store coordinates are not verified. Verification allows our system to map your campus landmark and calculate zone delivery rates.
              </Text>
              <TouchableOpacity
                style={styles.alertActionBtn}
                onPress={() => navigation.navigate('CustomerSettings')}
              >
                <Text style={styles.alertActionText}>Verify Location Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Glowing Welcoming Hero Block (1:1 Web Photocopy lines 250-285) */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            {business?.logo_url ? (
              <Image source={{ uri: business.logo_url }} style={styles.storeLogo} contentFit="cover" />
            ) : (
              <View style={styles.storeLogoFallback}>
                <Text style={styles.storeLogoInitials}>
                  {(business?.company_name || 'B').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View style={styles.heroMeta}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {business?.company_name || 'My Campus Store'}
                </Text>
                <ShieldCheck size={16} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.loggedSub}>
                Logged in as <Text style={styles.boldText}>{profile?.full_name?.split(' ')[0] || 'Operator'}</Text> • Business Operator
              </Text>
            </View>
          </View>
        </View>

        {/* 4 Stat Cards Bento Grid (1:1 Web Photocopy lines 172-200) */}
        <View style={styles.statsGrid}>
          {/* Pending Orders */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BusinessOrders')}
          >
            <View style={styles.statIconBox}>
              <Package size={18} color={colors.primary} />
            </View>
            <Text style={styles.statVal}>{stats.pendingOrders}</Text>
            <Text style={styles.statLbl}>Pending Orders</Text>
          </TouchableOpacity>

          {/* Job Requests */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Job Requests', 'No pending service requests right now.')}
          >
            <View style={styles.statIconBox}>
              <Briefcase size={18} color={colors.primary} />
            </View>
            <Text style={styles.statVal}>{stats.pendingJobs}</Text>
            <Text style={styles.statLbl}>Job Requests</Text>
          </TouchableOpacity>

          {/* Market Leads */}
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Market Leads', '6 campus buyers requested items matching your inventory category today.')}
          >
            <View style={styles.statIconBox}>
              <ArrowUpRight size={18} color={colors.accentEmerald} />
            </View>
            <Text style={[styles.statVal, { color: colors.accentEmerald }]}>{stats.marketLeads}</Text>
            <Text style={styles.statLbl}>Market Leads</Text>
          </TouchableOpacity>

          {/* Profile Views */}
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Eye size={18} color={colors.primary} />
            </View>
            <Text style={styles.statVal}>{stats.profileViews}</Text>
            <Text style={styles.statLbl}>Profile Views</Text>
          </View>
        </View>

        {/* Quick Actions Row */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddEditProduct')}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.actionPillText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPillSecondary}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BusinessOrders')}
          >
            <Package size={16} color={colors.text} strokeWidth={2.2} />
            <Text style={styles.actionPillTextSecondary}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPillSecondary}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BusinessPayments')}
          >
            <CreditCard size={16} color={colors.text} strokeWidth={2.2} />
            <Text style={styles.actionPillTextSecondary}>Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPillSecondary}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TikTokBoost')}
          >
            <TrendingUp size={16} color={colors.primary} strokeWidth={2.2} />
            <Text style={[styles.actionPillTextSecondary, { color: colors.primary }]}>TikTok Boost</Text>
          </TouchableOpacity>
        </View>

        {/* Live Activity Stream (1:1 Web lines 148-167) */}
        <Text style={styles.sectionHeader}>Live Activity</Text>
        {recentActivity.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Clock size={28} color={colors.textMuted} />
            <Text style={styles.emptyActivityText}>No recent orders. Promote your store link to get orders!</Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {recentActivity.map((act) => (
              <TouchableOpacity
                key={act.id}
                style={styles.activityItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('BusinessOrders')}
              >
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconBox}>
                    <Package size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.actTitle}>Order Received</Text>
                    <Text style={styles.actSub}>
                      Order #{act.id.slice(0, 8).toUpperCase()} • ₦{Number(act.total_price || act.total_amount || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.actStatus}>{act.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  alertIconCol: {
    paddingTop: 2,
  },
  alertTextCol: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  alertDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  alertActionBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  alertActionText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  storeLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storeLogoFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLogoInitials: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  heroMeta: {
    flex: 1,
    gap: 3,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  loggedSub: {
    color: colors.textMuted,
    fontSize: 12,
  },
  boldText: {
    color: colors.text,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLbl: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionPillSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionPillTextSecondary: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyActivity: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyActivityText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.4)',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  actSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  actStatus: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
});
