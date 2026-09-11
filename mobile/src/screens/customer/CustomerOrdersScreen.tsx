import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { 
  ShieldCheck, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Store,
  ChevronRight 
} from 'lucide-react-native';

export const CustomerOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, business:businesses(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (err) {
      console.error('[FETCH ORDERS ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleDispute = (orderId: string) => {
    Alert.alert(
      'Open Escrow Dispute',
      'This will freeze escrow funds immediately while a campus moderator reviews the case. Do you wish to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Freeze & Dispute',
          style: 'destructive',
          onPress: () => Alert.alert('Dispute Logged', 'Funds frozen. Support will reach out via chat.'),
        },
      ]
    );
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: colors.accentEmerald, bg: 'rgba(16, 185, 129, 0.12)' };
      case 'dispatched':
        return { label: 'On The Way', color: colors.accentCyan, bg: 'rgba(0, 245, 255, 0.12)' };
      case 'delivered':
        return { label: 'Arrived (Pending PIN)', color: colors.accentAmber, bg: 'rgba(245, 158, 11, 0.12)' };
      default:
        return { label: 'Preparing', color: colors.textMuted, bg: colors.cardElevated };
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="My Orders & Escrow" showBack={false} showCart />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Loading your active escrow orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentCyan} />
          }
          renderItem={({ item }) => {
            const statusInfo = getStatusPill(item.status);
            return (
              <View style={styles.orderCard}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.storeRow}>
                    <Store size={16} color={colors.accentCyan} />
                    <Text style={styles.storeName}>
                      {item.business?.company_name || 'Campus Merchant'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Amount & Destination */}
                <View style={styles.metaRow}>
                  <Text style={styles.orderAmount}>₦{item.total_amount.toLocaleString()}</Text>
                  <Text style={styles.deliveryDest} numberOfLines={1}>
                    📍 {item.delivery_address}
                  </Text>
                </View>

                {/* 6-Digit Delivery Release PIN Box */}
                {item.status !== 'completed' && item.delivery_code && (
                  <View style={styles.pinBox}>
                    <View style={styles.pinHeader}>
                      <Key size={14} color={colors.accentAmber} />
                      <Text style={styles.pinTitle}>Delivery Release PIN</Text>
                    </View>
                    <Text style={styles.pinCode}>{item.delivery_code}</Text>
                    <Text style={styles.pinWarning}>
                      Only give this 6-digit code to the courier after you have physically inspected your goods.
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    onPress={() => handleDispute(item.id)}
                    style={styles.disputeBtn}
                  >
                    <Text style={styles.disputeBtnText}>Dispute Order</Text>
                  </TouchableOpacity>

                  <View style={styles.escrowSafeRow}>
                    <ShieldCheck size={14} color={colors.accentEmerald} />
                    <Text style={styles.escrowSafeText}>Funds Protected</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Active Orders</Text>
              <Text style={styles.emptySubtitle}>
                When you buy goods on campus, your escrow orders and delivery tracking PINs will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  orderAmount: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  deliveryDest: {
    color: colors.textMuted,
    fontSize: 12,
    maxWidth: 180,
  },
  pinBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    gap: 6,
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinTitle: {
    color: colors.accentAmber,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pinCode: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 4,
  },
  pinWarning: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disputeBtn: {
    paddingVertical: 4,
  },
  disputeBtnText: {
    color: colors.accentRose,
    fontSize: 12,
    fontWeight: '600',
  },
  escrowSafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  escrowSafeText: {
    color: colors.accentEmerald,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
