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
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Eye, 
  Plus, 
  Store, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles, 
  CreditCard,
  User
} from 'lucide-react-native';

export const BusinessOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, business, switchRole } = useAuth();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    productCount: 0,
    storeViews: 248,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchBusinessMetrics = async () => {
    if (!business?.id) return;
    try {
      // 1. Fetch products count
      const { count: prodCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);

      // 2. Fetch active orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('business_id', business.id);

      const active = orderData?.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length || 0;
      const revenue = orderData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      setStats({
        totalRevenue: revenue,
        activeOrders: active,
        productCount: prodCount || 0,
        storeViews: 380,
      });
    } catch (err) {
      console.error('[METRICS FETCH ERROR]', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusinessMetrics();
  }, [business?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinessMetrics();
  };

  const handleSwitchToCustomer = async () => {
    await switchRole('customer');
    navigation.reset({ index: 0, routes: [{ name: 'CustomerApp' }] });
  };

  return (
    <View style={styles.container}>
      {/* Logo-Free Top Bar */}
      <AppHeader
        title={business?.company_name || 'Merchant Shop'}
        subtitle="● Active & Accepting Orders"
        showBack={false}
        showCart={false}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditProduct')}
            style={styles.addProductHeaderBtn}
            activeOpacity={0.8}
          >
            <Plus size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentCyan} />}
      >
        {/* Revenue Hero Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueLabel}>Gross Store Sales (Escrow Settled)</Text>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>Live</Text>
            </View>
          </View>
          <Text style={styles.revenueAmount}>₦{stats.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.revenueSub}>Available for instant campus withdrawal</Text>
        </View>

        {/* Bento Metrics Grid */}
        <View style={styles.bentoGrid}>
          {/* Active Orders */}
          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessOrders')}
            style={styles.bentoItem}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIcon, { backgroundColor: 'rgba(0, 245, 255, 0.1)' }]}>
              <Package size={20} color={colors.accentCyan} />
            </View>
            <Text style={styles.bentoValue}>{stats.activeOrders}</Text>
            <Text style={styles.bentoTitle}>Active Orders</Text>
          </TouchableOpacity>

          {/* Catalog Size */}
          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessProducts')}
            style={styles.bentoItem}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Store size={20} color={colors.accentEmerald} />
            </View>
            <Text style={styles.bentoValue}>{stats.productCount}</Text>
            <Text style={styles.bentoTitle}>Listed Goods</Text>
          </TouchableOpacity>

          {/* Store Views */}
          <View style={styles.bentoItem}>
            <View style={[styles.bentoIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Eye size={20} color={colors.accentAmber} />
            </View>
            <Text style={styles.bentoValue}>{stats.storeViews}</Text>
            <Text style={styles.bentoTitle}>Campus Views</Text>
          </View>

          {/* TikTok Reach */}
          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessGrowth')}
            style={styles.bentoItem}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIcon, { backgroundColor: 'rgba(255, 0, 80, 0.1)' }]}>
              <TrendingUp size={20} color={colors.accentRose} />
            </View>
            <Text style={styles.bentoValue}>Auto-Boost</Text>
            <Text style={styles.bentoTitle}>TikTok Reach</Text>
          </TouchableOpacity>
        </View>

        {/* TikTok Auto-Boost Hero Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BusinessGrowth')}
          style={styles.tiktokCard}
          activeOpacity={0.85}
        >
          <View style={styles.tiktokContent}>
            <View style={styles.tiktokBadge}>
              <Text style={styles.tiktokBadgeText}>SOCIAL COMMERCE HUB</Text>
            </View>
            <Text style={styles.tiktokTitle}>Auto-Promote on TikTok</Text>
            <Text style={styles.tiktokSubtitle}>
              Automatically feature new products in videos with direct backlinks to your campus store.
            </Text>
          </View>
          <ArrowUpRight size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Fast Action Shortcuts */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Merchant Hub</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddEditProduct')}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Plus size={18} color={colors.accentCyan} />
                <Text style={styles.actionText}>Add New Product / Listing</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('BusinessPayments')}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <CreditCard size={18} color={colors.accentEmerald} />
                <Text style={styles.actionText}>Wallet & Squad Escrow Payouts</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSwitchToCustomer}
              style={[styles.actionRow, styles.actionRowLast]}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <User size={18} color={colors.textSecondary} />
                <Text style={styles.actionText}>Switch to Student Buyer View</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} />
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
  addProductHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  revenueCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  livePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  livePillText: {
    color: colors.accentEmerald,
    fontSize: 10,
    fontWeight: '800',
  },
  revenueAmount: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  revenueSub: {
    color: colors.textMuted,
    fontSize: 12,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  bentoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  bentoTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tiktokCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardElevated,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 80, 0.25)',
  },
  tiktokContent: {
    flex: 1,
    paddingRight: 12,
  },
  tiktokBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 0, 80, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  tiktokBadgeText: {
    color: colors.accentRose,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tiktokTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tiktokSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  actionsSection: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  actionsList: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
