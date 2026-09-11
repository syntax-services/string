import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { 
  Compass, 
  Search, 
  MessageSquare, 
  ShoppingBag, 
  User, 
  LayoutGrid, 
  Package, 
  ClipboardList, 
  TrendingUp 
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import * as Haptics from 'expo-haptics';

interface TabConfig {
  name: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
}

const CUSTOMER_TABS: Record<string, React.ComponentType<any>> = {
  CustomerDiscover: Compass,
  CustomerSearch: Search,
  CustomerMessages: MessageSquare,
  CustomerOrders: ShoppingBag,
  CustomerProfile: User,
};

const BUSINESS_TABS: Record<string, React.ComponentType<any>> = {
  BusinessOverview: LayoutGrid,
  BusinessProducts: Package,
  BusinessOrders: ClipboardList,
  BusinessMessages: MessageSquare,
  BusinessGrowth: TrendingUp,
};

export const PinterestTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.dockCapsule}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const IconComponent =
            CUSTOMER_TABS[route.name] || BUSINESS_TABS[route.name] || Compass;

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
                <IconComponent
                  size={26}
                  color={isFocused ? colors.tabBarActive : colors.tabBarInactive}
                  strokeWidth={isFocused ? 2.8 : 2.2}
                />
                {isFocused && <View style={styles.activeDot} />}
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
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  dockCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.tabBarBg,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.tabBarBorder,
    width: '100%',
    maxWidth: 420,
    // Deep tactile shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 20,
  },
  iconWrapperActive: {
    transform: [{ scale: 1.08 }],
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.tabBarIndicator,
    marginTop: 4,
    position: 'absolute',
    bottom: -2,
  },
});
