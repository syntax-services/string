import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';
import { ShoppingBag, Store, ArrowRight, Compass } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.content}>
        {/* Hero Tagline & Branding */}
        <View style={styles.heroSection}>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>CAMPUS COMMERCE & ESCROW</Text>
          </View>
          <Text style={styles.heroTitle}>
            Trade, Shop & Boost on Campus.
          </Text>
          <Text style={styles.heroSubtitle}>
            The verified marketplace for student merchants and buyers. Protected by zero-fraud escrow.
          </Text>
        </View>

        {/* Role Cards Selection */}
        <View style={styles.cardsContainer}>
          {/* Customer / Student Role Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp', { initialRole: 'customer' })}
            style={styles.roleCard}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <ShoppingBag size={24} color={colors.accentCyan} strokeWidth={2.4} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Student Customer</Text>
              <Text style={styles.cardSubtitle}>
                Buy textbooks, gadgets, campus fashion, and order trusted student services.
              </Text>
            </View>
            <ArrowRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Business / Merchant Role Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp', { initialRole: 'business' })}
            style={[styles.roleCard, styles.roleCardActive]}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, styles.iconCircleGreen]}>
              <Store size={24} color={colors.accentEmerald} strokeWidth={2.4} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Campus Merchant</Text>
              <Text style={styles.cardSubtitle}>
                Sell your goods, accept virtual account escrow, and auto-boost on TikTok.
              </Text>
            </View>
            <ArrowRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.primaryButton}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Sign In to Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CustomerApp')}
            style={styles.ghostButton}
            activeOpacity={0.7}
          >
            <Compass size={18} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={styles.ghostButtonText}>Browse Marketplace as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  heroSection: {
    marginTop: 30,
  },
  pillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  pillText: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 14,
    marginVertical: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  roleCardActive: {
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: colors.cardElevated,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
  },
  ghostButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
