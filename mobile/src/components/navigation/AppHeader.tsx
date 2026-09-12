import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, Plus, Bell, Store, ShoppingCart } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showCart?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showCart = true,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { itemCount } = useCart();
  const { currentRole, switchRole, business } = useAuth();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleOpenCart = () => {
    navigation.navigate('CartCheckout');
  };

  const handleToggleRole = async () => {
    if (currentRole === 'customer') {
      if (business) {
        await switchRole('business');
        navigation.reset({ index: 0, routes: [{ name: 'BusinessApp' }] });
      } else {
        Alert.alert(
          'Become a Merchant',
          'Would you like to register your store on String to list products and services?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Store',
              onPress: () => {
                navigation.navigate('SignUp', { initialRole: 'business' });
              },
            },
          ]
        );
      }
    } else {
      await switchRole('customer');
      navigation.reset({ index: 0, routes: [{ name: 'CustomerApp' }] });
    }
  };

  const handlePlusAction = () => {
    if (currentRole === 'business') {
      navigation.navigate('AddEditProduct');
    } else {
      navigation.navigate('CustomerOrders');
    }
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: Math.max(
            insets.top,
            Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 12
          ),
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left Section: Back Button OR String Twin Rings Logo */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={22} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoRow}
              activeOpacity={0.8}
              onPress={() => {
                if (currentRole === 'business') {
                  navigation.navigate('BusinessOverview');
                } else {
                  navigation.navigate('CustomerDiscover');
                }
              }}
            >
              <Image
                source={require('../../../assets/string-logo-icon.png')}
                style={styles.logoIcon}
                contentFit="contain"
              />
              <Text style={styles.logoText}>String</Text>
            </TouchableOpacity>
          )}

          {title && showBack && (
            <View style={styles.titleWrapper}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
          )}
        </View>

        {/* Right Section: Role Switcher + Plus + Cart matching web DashboardLayout */}
        <View style={styles.rightSection}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {/* Role Switcher Pill */}
              <TouchableOpacity
                onPress={handleToggleRole}
                style={[
                  styles.roleSwitcherPill,
                  currentRole === 'business'
                    ? styles.roleSwitcherPillBusiness
                    : styles.roleSwitcherPillCustomer,
                ]}
                activeOpacity={0.8}
              >
                {currentRole === 'business' ? (
                  <Store size={13} color={colors.primary} strokeWidth={2.4} />
                ) : (
                  <ShoppingCart size={13} color={colors.textMuted} strokeWidth={2.4} />
                )}
                <Text
                  style={[
                    styles.roleSwitcherText,
                    currentRole === 'business' && styles.roleSwitcherTextActive,
                  ]}
                >
                  {currentRole === 'business' ? 'Merchant' : 'Shopper'}
                </Text>
              </TouchableOpacity>

              {/* Quick Action Plus Button */}
              <TouchableOpacity
                onPress={handlePlusAction}
                style={styles.actionButton}
                activeOpacity={0.75}
                accessibilityLabel="Quick action"
              >
                <Plus size={18} color={colors.text} strokeWidth={2.4} />
              </TouchableOpacity>

              {/* Shopping Cart Button */}
              {showCart && (
                <TouchableOpacity
                  onPress={handleOpenCart}
                  style={styles.actionButton}
                  activeOpacity={0.75}
                  accessibilityLabel="Open Shopping Cart"
                >
                  <ShoppingBag size={18} color={colors.text} strokeWidth={2.4} />
                  {itemCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>
                        {itemCount > 99 ? '99+' : itemCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
  },
  logoText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  roleSwitcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  roleSwitcherPillCustomer: {
    borderColor: colors.border,
  },
  roleSwitcherPillBusiness: {
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  roleSwitcherText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  roleSwitcherTextActive: {
    color: colors.primary,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.accentRose,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
