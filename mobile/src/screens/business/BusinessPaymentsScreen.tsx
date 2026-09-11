import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Copy, ShieldCheck, Building } from 'lucide-react-native';

export const BusinessPaymentsScreen: React.FC = () => {
  const { business } = useAuth();
  const [walletBalance, setWalletBalance] = useState(48500);
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTB)');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(business?.company_name || 'Campus Merchant Store');

  const handleWithdraw = () => {
    if (walletBalance <= 0) {
      Alert.alert('Zero Balance', 'No funds available for withdrawal.');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ₦${walletBalance.toLocaleString()} to ${bankName} (${accountNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process Payout',
          onPress: () => {
            Alert.alert('Payout Initiated! 💸', 'Funds will arrive via NIP transfer within 15 minutes.');
            setWalletBalance(0);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Wallet & Escrow Payouts" showBack showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Wallet Balance Hero Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Escrow Balance</Text>
          <Text style={styles.balanceAmount}>₦{walletBalance.toLocaleString()}</Text>
          <Text style={styles.balanceSub}>Cleared escrow earnings ready for direct bank payout.</Text>

          <TouchableOpacity
            onPress={handleWithdraw}
            style={styles.withdrawBtn}
            activeOpacity={0.85}
          >
            <ArrowUpRight size={18} color={colors.primaryForeground} />
            <Text style={styles.withdrawBtnText}>Withdraw to Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Payout Bank Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Payout Destination Bank</Text>
          <View style={styles.card}>
            <View style={styles.bankRow}>
              <Building size={20} color={colors.accentCyan} />
              <View style={styles.bankMeta}>
                <Text style={styles.bankNameText}>{bankName}</Text>
                <Text style={styles.accountNumberText}>{accountNumber} • {accountName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Bank Account', 'Contact String Merchant Support to update registered settlement BVN.')}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Escrow Guarantee */}
        <View style={styles.escrowNotice}>
          <ShieldCheck size={20} color={colors.accentEmerald} />
          <Text style={styles.escrowNoticeText}>
            String Escrow protects both merchant and student. All card and virtual account transfers are settled via Squad GTCO payment channels.
          </Text>
        </View>

        {/* Transaction History Mock */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Recent Escrow Settlements</Text>
          <View style={styles.card}>
            <View style={styles.txRow}>
              <View style={styles.txIconIn}>
                <ArrowDownLeft size={16} color={colors.accentEmerald} />
              </View>
              <View style={styles.txMeta}>
                <Text style={styles.txTitle}>Order Escrow Released (PIN #492812)</Text>
                <Text style={styles.txDate}>Yesterday • Verified Delivery</Text>
              </View>
              <Text style={styles.txAmountIn}>+₦12,500</Text>
            </View>

            <View style={[styles.txRow, styles.rowBorder]}>
              <View style={styles.txIconIn}>
                <ArrowDownLeft size={16} color={colors.accentEmerald} />
              </View>
              <View style={styles.txMeta}>
                <Text style={styles.txTitle}>Order Escrow Released (PIN #102941)</Text>
                <Text style={styles.txDate}>3 days ago • Verified Delivery</Text>
              </View>
              <Text style={styles.txAmountIn}>+₦36,000</Text>
            </View>
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
    paddingBottom: 60,
    gap: 20,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  balanceSub: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  withdrawBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  withdrawBtnText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bankMeta: {
    flex: 1,
    gap: 2,
  },
  bankNameText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  accountNumberText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  escrowNoticeText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  txIconIn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMeta: {
    flex: 1,
  },
  txTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
  txAmountIn: {
    color: colors.accentEmerald,
    fontSize: 14,
    fontWeight: '800',
  },
});
