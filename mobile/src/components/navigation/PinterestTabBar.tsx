import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Store,
  MessageSquare,
  User,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'expo-image';
import { supabase } from '../../lib/supabase';

interface TabConfig {
  label: string;
  icon: React.ComponentType<any>;
  isInbox?: boolean;
  isProfile?: boolean;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  // Customer tabs (1:1 Web Parity)
  CustomerDiscover: { label: 'Store', icon: Store },
  CustomerMessages: { label: 'Inbox', icon: MessageSquare, isInbox: true },
  CustomerProfile: { label: 'Profile', icon: User, isProfile: true },

  // Business tabs (1:1 Web Parity)
  BusinessOverview: { label: 'Store', icon: Store },
  BusinessMessages: { label: 'Inbox', icon: MessageSquare, isInbox: true },
  BusinessProfile: { label: 'Profile', icon: User, isProfile: true },
};

export const PinterestTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { user, profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Poll unread messages count matching web useUnreadCount
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnread = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .neq('sender_id', user.id)
          .eq('read', false);

        if (!error && typeof count === 'number') {
          setUnreadCount(count);
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.dockCapsule}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            label: route.name,
            icon: Store,
          };

          const IconComponent = config.icon;
          const hasAvatar = config.isProfile && !!profile?.avatar_url;
          const showBadge = config.isInbox && unreadCount > 0;

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
                    size={22}
                    color={isFocused ? colors.primary : colors.tabBarInactive}
                    strokeWidth={isFocused ? 2.8 : 2.0}
                  />
                )}

                {showBadge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {config.label}
              </Text>
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
    bottom: Platform.OS === 'ios' ? 24 : 16,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: 260,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 64,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 34,
    borderRadius: 17,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabLabelInactive: {
    color: colors.tabBarInactive,
  },
  avatarBorder: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
