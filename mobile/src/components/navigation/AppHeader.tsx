import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, MapPin, Bell } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useCart } from '../../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showCampusPicker?: boolean;
  campusName?: string;
  showCart?: boolean;
  rightAction?: React.ReactNode;
  onPressCampus?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showCampusPicker = false,
  campusName = 'UNILAG Campus',
  showCart = true,
  rightAction,
  onPressCampus,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { itemCount } = useCart();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleOpenCart = () => {
    navigation.navigate('CartCheckout');
  };

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 12) }]}>
      <View style={styles.content}>
        {/* Left Section: Back Button or Campus Location Picker (Zero String Logo) */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : showCampusPicker ? (
            <TouchableOpacity
              onPress={onPressCampus}
              style={styles.campusPill}
              activeOpacity={0.8}
              accessibilityLabel="Select Campus Location"
            >
              <MapPin size={14} color={colors.accentCyan} strokeWidth={2.5} />
              <Text style={styles.campusText} numberOfLines={1}>
                {campusName}
              </Text>
              <Text style={styles.campusChevron}>▾</Text>
            </TouchableOpacity>
          ) : title ? (
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
          ) : null}
        </View>

        {/* Center Section: If title exists with back button */}
        {showBack && title && (
          <View style={styles.centerSection}>
            <Text style={styles.centerTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Right Section: Cart Badge or Custom Right Action */}
        <View style={styles.rightSection}>
          {rightAction}

          {showCart && (
            <TouchableOpacity
              onPress={handleOpenCart}
              style={styles.cartButton}
              activeOpacity={0.75}
              accessibilityLabel="Open Shopping Cart"
            >
              <ShoppingBag size={22} color={colors.text} strokeWidth={2.4} />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    maxWidth: 200,
  },
  campusText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  campusChevron: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 2,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accentRose,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
