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
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShieldCheck,
  CheckCheck,
  Search,
  MapPin,
} from 'lucide-react-native';
import { format } from 'date-fns';

type OrderTab = 'all' | 'active' | 'completed' | 'cancelled';

export const CustomerOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const customerId = customer?.id || user.id;

      const { data, error } = await supabase
        .from('orders')
        .select('*, business:businesses(company_name, logo_url)')
        .or(`customer_id.eq.${customerId},customer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('[FETCH ORDERS ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (!user?.id) return;

    // Realtime postgres changes channel matching web CustomerOrders.tsx
    const channel = supabase
      .channel(`orders_cust_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleConfirmReceipt = async (orderId: string) => {
    Alert.alert(
      'Confirm Receipt',
      'By confirming receipt, you release escrow funds to the merchant. Are you satisfied with your delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Release',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({ status: 'delivered', delivery_status: 'delivered' })
                .eq('id', orderId);

              if (error) throw error;
              Alert.alert('Escrow Released', 'Thank you! The merchant has been paid.');
              fetchOrders();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update order');
            }
          },
        },
      ]
    );
  };

  const handleDispute = (orderId: string) => {
    Alert.alert(
      'Open Escrow Dispute',
      'This will freeze escrow funds immediately while campus support mediates. Proceed?',
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

  const filteredOrders = orders.filter((o) => {
    const status = (o.status || 'pending').toLowerCase();

    // Tab Filter matching web filterOrders
    let matchesTab = true;
    if (activeTab === 'all') {
      matchesTab = !['cancelled', 'refunded'].includes(status);
    } else if (activeTab === 'active') {
      matchesTab = ['pending', 'confirmed', 'processing', 'shipped'].includes(status);
    } else if (activeTab === 'completed') {
      matchesTab = status === 'delivered';
    } else if (activeTab === 'cancelled') {
      matchesTab = ['cancelled', 'refunded'].includes(status);
    }

    // Search filter
    const matchesSearch =
      !searchQuery.trim() ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.business?.company_name && o.business.company_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', color: colors.primary, icon: CheckCircle2 };
      case 'processing':
        return { label: 'Processing', color: colors.primary, icon: Package };
      case 'shipped':
        return { label: 'Dispatched', color: '#06B6D4', icon: Truck };
      case 'delivered':
        return { label: 'Delivered', color: colors.accentEmerald, icon: CheckCheck };
      case 'cancelled':
      case 'refunded':
        return { label: 'Cancelled', color: colors.accentRose, icon: XCircle };
      default:
        return { label: 'Awaiting Payment', color: '#F59E0B', icon: Clock };
    }
  };

  // 4-Step Escrow Timeline (1:1 Web Photocopy lines 151-211)
  const renderEscrowTimeline = (status: string) => {
    const isUnpaid = status === 'pending';
    const isCancelled = ['cancelled', 'refunded'].includes(status);

    if (isCancelled) {
      return (
        <View style={styles.cancelledBox}>
          <XCircle size={14} color={colors.accentRose} />
          <Text style={styles.cancelledText}>Order Cancelled / Refunded</Text>
        </View>
      );
    }

    const steps = [
      { id: 1, label: 'Unpaid', active: true, done: !isUnpaid },
      { id: 2, label: 'Secured', active: !isUnpaid, done: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) },
      { id: 3, label: 'Dispatched', active: ['shipped', 'delivered'].includes(status), done: status === 'delivered' },
      { id: 4, label: 'Settled', active: status === 'delivered', done: status === 'delivered' },
    ];

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineHeaderLeft}>
            <ShieldCheck size={12} color={colors.primary} />
            <Text style={styles.timelineTitle}>ESCROW PROTECTION</Text>
          </View>
          <Text style={[styles.timelineStatus, isUnpaid ? styles.textAmber : styles.textEmerald]}>
            {isUnpaid ? 'Awaiting Deposit' : 'Protected'}
          </Text>
        </View>

        <View style={styles.timelineStepsRow}>
          {/* Connector Line */}
          <View style={styles.connectorBg}>
            <View
              style={[
                styles.connectorFill,
                {
                  width:
                    status === 'delivered'
                      ? '100%'
                      : status === 'shipped'
                      ? '66%'
                      : !isUnpaid
                      ? '33%'
                      : '0%',
                },
              ]}
            />
          </View>

          {steps.map((step) => {
            const isCompleted = step.done;
            const isHighlighted = step.done || step.active;

            return (
              <View key={step.id} style={styles.stepNode}>
                <View
                  style={[
                    styles.nodeCircle,
                    isCompleted
                      ? styles.nodeCircleCompleted
                      : isHighlighted
                      ? styles.nodeCircleHighlighted
                      : styles.nodeCircleIdle,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={10} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text style={[styles.nodeNumber, isHighlighted && styles.nodeNumberHighlighted]}>
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isHighlighted && styles.stepLabelHighlighted]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.status || 'pending');
    const BadgeIcon = badge.icon;
    const orderItems: any[] = Array.isArray(item.items) ? item.items : [];
    const dateStr = item.created_at ? format(new Date(item.created_at), 'dd MMM, hh:mm a') : '';

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>
              Order #{item.tracking_number || item.id?.slice(0, 8)?.toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>{dateStr}</Text>
          </View>

          <View style={[styles.badgePill, { backgroundColor: `${badge.color}15`, borderColor: `${badge.color}30` }]}>
            <BadgeIcon size={12} color={badge.color} strokeWidth={2.4} />
            <Text style={[styles.badgePillText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Merchant & Items Summary */}
        <View style={styles.cardBody}>
          {item.business?.company_name && (
            <Text style={styles.merchantName}>{item.business.company_name}</Text>
          )}

          {orderItems.map((prod, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {prod.quantity || 1}x {prod.name || 'Product Item'}
              </Text>
              <Text style={styles.itemPrice}>
                ₦{Number(prod.price || 0).toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Delivery Location */}
          {item.shipping_address && (
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.shipping_address}
              </Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total (Escrow Held)</Text>
            <Text style={styles.totalVal}>
              ₦{Number(item.total_price || item.total || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 4-Step Escrow Stepper */}
        {renderEscrowTimeline(item.status || 'pending')}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {item.status === 'shipped' && (
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.85}
              onPress={() => handleConfirmReceipt(item.id)}
            >
              <CheckCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.confirmButtonText}>Confirm Receipt</Text>
            </TouchableOpacity>
          )}

          {['confirmed', 'processing', 'shipped'].includes(item.status) && (
            <TouchableOpacity
              style={styles.disputeButton}
              activeOpacity={0.8}
              onPress={() => handleDispute(item.id)}
            >
              <Text style={styles.disputeButtonText}>Dispute</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="My Orders & Escrow" showBack={true} showCart={true} />

      {/* Filter Tabs Bar (1:1 Web Photocopy of lines 7-8 & 110-123) */}
      <View style={styles.tabsBar}>
        {(['all', 'active', 'completed', 'cancelled'] as OrderTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<OrderTab, string> = {
            all: 'All',
            active: 'Active',
            completed: 'Completed',
            cancelled: 'Cancelled',
          };

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>
                {labels[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by order ID or store..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Order List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={48} color={colors.textMuted} strokeWidth={1.2} />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'all'
              ? "You haven't placed any escrow orders on String yet."
              : `No ${activeTab} orders at the moment.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
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
  tabsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabItemText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderId: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  orderDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    gap: 6,
    paddingTop: 4,
  },
  merchantName: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  totalVal: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  timelineContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.4)',
    paddingTop: 10,
    gap: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  timelineStatus: {
    fontSize: 9,
    fontWeight: '800',
  },
  textAmber: {
    color: '#F59E0B',
  },
  textEmerald: {
    color: colors.accentEmerald,
  },
  timelineStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  connectorBg: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 9,
    height: 2,
    backgroundColor: colors.cardElevated,
    zIndex: 0,
  },
  connectorFill: {
    height: '100%',
    backgroundColor: colors.accentEmerald,
  },
  stepNode: {
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  nodeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  nodeCircleCompleted: {
    backgroundColor: colors.accentEmerald,
    borderColor: colors.accentEmerald,
  },
  nodeCircleHighlighted: {
    backgroundColor: colors.background,
    borderColor: colors.accentEmerald,
  },
  nodeCircleIdle: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  nodeNumber: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textMuted,
  },
  nodeNumberHighlighted: {
    color: colors.accentEmerald,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepLabelHighlighted: {
    color: colors.text,
    fontWeight: '800',
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelledText: {
    color: colors.accentRose,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  disputeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeButtonText: {
    color: colors.accentRose,
    fontSize: 12,
    fontWeight: '700',
  },
});
