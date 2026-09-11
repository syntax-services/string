import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { Package, ShieldCheck, CheckCircle2, Key, Clock, AlertCircle } from 'lucide-react-native';

export const BusinessOrdersScreen: React.FC = () => {
  const { business } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchOrders = async () => {
    if (!business?.id) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('[FETCH BIZ ORDERS ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [business?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchOrders();
  };

  const handleVerifyPin = async () => {
    if (!selectedOrder) return;
    if (enteredPin.trim() !== selectedOrder.delivery_code) {
      Alert.alert('Incorrect PIN', 'The release PIN entered does not match the customer code.');
      return;
    }

    setVerifying(true);
    try {
      // Mark completed
      await supabase.from('orders').update({ status: 'completed' }).eq('id', selectedOrder.id);
      setVerifying(false);
      setVerifyModal(false);
      setEnteredPin('');
      Alert.alert(
        'Escrow Funds Released! 💰',
        `₦${selectedOrder.total_amount.toLocaleString()} has been credited to your merchant balance.`
      );
      fetchOrders();
    } catch (err: any) {
      setVerifying(false);
      Alert.alert('Verification Error', err?.message || 'Failed to complete escrow.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Customer Orders" subtitle={`${orders.length} orders`} showBack={false} showCart={false} />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Fetching incoming orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentCyan} />
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderAmount}>₦{item.total_amount.toLocaleString()}</Text>
                <View
                  style={[
                    styles.statusPill,
                    item.status === 'completed' && styles.statusCompleted,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.landmark}>📍 {item.delivery_address}</Text>

              {item.status !== 'completed' ? (
                <View style={styles.actionRow}>
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(item.id, 'dispatched')}
                      style={styles.dispatchBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dispatchBtnText}>Dispatch Courier</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedOrder(item);
                      setVerifyModal(true);
                    }}
                    style={styles.verifyBtn}
                    activeOpacity={0.8}
                  >
                    <Key size={14} color={colors.primaryForeground} />
                    <Text style={styles.verifyBtnText}>Enter Delivery PIN</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.completedRow}>
                  <CheckCircle2 size={16} color={colors.accentEmerald} />
                  <Text style={styles.completedText}>Escrow Settled & Completed</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Package size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                When students purchase from your campus shop, incoming orders appear here.
              </Text>
            </View>
          }
        />
      )}

      {/* Verify Delivery PIN Modal */}
      <Modal visible={verifyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Customer Release PIN</Text>
            <Text style={styles.modalSubtitle}>
              Ask the student for their 6-digit delivery PIN to release ₦{selectedOrder?.total_amount.toLocaleString()} into your wallet.
            </Text>

            <TextInput
              style={styles.pinInput}
              placeholder="••••••"
              placeholderTextColor={colors.textPlaceholder}
              value={enteredPin}
              onChangeText={setEnteredPin}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setVerifyModal(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerifyPin}
                style={[styles.confirmBtn, verifying && styles.btnDisabled]}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={styles.confirmBtnText}>Release Funds</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loading: {
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
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statusPill: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusText: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '800',
  },
  landmark: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  dispatchBtn: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dispatchBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  verifyBtnText: {
    color: colors.primaryForeground,
    fontSize: 13,
    fontWeight: '700',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  completedText: {
    color: colors.accentEmerald,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.cardElevated,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    gap: 14,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  pinInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    height: 60,
    fontSize: 28,
    fontWeight: '900',
    color: colors.accentCyan,
    textAlign: 'center',
    letterSpacing: 8,
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
});
