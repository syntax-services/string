import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Home,
  Search,
  MessageCircle,
  ShoppingBag,
  User,
  Store,
  Package,
  ClipboardList,
  TrendingUp,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'expo-image';

const CUSTOMER_TABS: Record<string, React.ComponentType<any>> = {
  CustomerOverview: Home,
  CustomerDiscover: Search,
  CustomerOrders: ShoppingBag,
  CustomerMessages: MessageCircle,
  CustomerProfile: User,
};

const BUSINESS_TABS: Record<string, React.ComponentType<any>> = {
  BusinessOverview: Store,
  BusinessProducts: Package,
  BusinessOrders: ClipboardList,
  BusinessMessages: MessageCircle,
  BusinessGrowth: TrendingUp,
};

export const PinterestTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { profile } = useAuth();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.dockCapsule}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const IconComponent =
            CUSTOMER_TABS[route.name] || BUSINESS_TABS[route.name] || Home;

          const isProfileTab = route.name.includes('Profile');
          const hasAvatar = isProfileTab && !!profile?.avatar_url;

          const onPress = () => {
            if (Platform.OS !== 'web') {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.tabButton}
            >
              <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
                {hasAvatar ? (
                  <View
                    style={[
                      styles.avatarBorder,
                      isFocused && styles.avatarBorderActive,
                    ]}
                  >
                    <Image
                      source={{ uri: profile.avatar_url! }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  </View>
                ) : (
                  <IconComponent
                    size={24}
                    color={isFocused ? colors.primary : colors.tabBarInactive}
                    strokeWidth={isFocused ? 2.8 : 2.2}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 26 : 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  dockCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    width: '90%',
    maxWidth: 360,
    // Deep tactile shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  avatarBorder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.tabBarInactive,
    overflow: 'hidden',
  },
  avatarBorderActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
