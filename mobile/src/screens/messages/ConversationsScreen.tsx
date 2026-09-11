import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import {
  MessageSquare,
  Store,
  User,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItem {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientSubtitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isVerified?: boolean;
  businessId?: string;
}

export const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, profile, business, currentRole } = useAuth();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      if (currentRole === 'business' && business?.id) {
        // Fetch conversations for the business
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            customer_id,
            business_id,
            last_message,
            last_message_at,
            created_at
          `)
          .eq('business_id', business.id)
          .order('last_message_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Fetch customer profile names
          const customerIds = Array.from(new Set(data.map((c) => c.customer_id)));
          const { data: customerProfiles } = await supabase
            .from('profiles')
            .select('user_id, full_name, campus_location')
            .in('user_id', customerIds);

          const profileMap: Record<string, { name: string; location?: string }> = {};
          customerProfiles?.forEach((p) => {
            profileMap[p.user_id] = {
              name: p.full_name || 'Student Buyer',
              location: p.campus_location || 'Campus Student',
            };
          });

          const items: ConversationItem[] = data.map((c) => {
            const customer = profileMap[c.customer_id] || {
              name: 'Student Buyer',
              location: 'Campus Buyer',
            };
            return {
              id: c.id,
              recipientId: c.customer_id,
              recipientName: customer.name,
              recipientSubtitle: customer.location,
              lastMessage: c.last_message || 'New conversation started',
              lastMessageAt: c.last_message_at || c.created_at,
              unreadCount: 0,
              businessId: business.id,
            };
          });

          setConversations(items);
        } else {
          setConversations([]);
        }
      } else {
        // Fetch conversations for the customer
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            customer_id,
            business_id,
            last_message,
            last_message_at,
            created_at,
            businesses (
              id,
              company_name,
              business_location,
              verified
            )
          `)
          .or(`customer_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const items: ConversationItem[] = data.map((c: any) => {
            const biz = c.businesses;
            return {
              id: c.id,
              recipientId: c.business_id,
              recipientName: biz?.company_name || 'Campus Merchant',
              recipientSubtitle: biz?.business_location || 'Campus Store',
              lastMessage: c.last_message || 'New conversation started',
              lastMessageAt: c.last_message_at || c.created_at,
              unreadCount: 0,
              isVerified: !!biz?.verified,
              businessId: c.business_id,
            };
          });

          setConversations(items);
        }
      }
    } catch (err) {
      console.error('[CONVERSATIONS FETCH ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id, currentRole, business?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatMessageSnippet = (raw: string) => {
    if (!raw) return 'No messages yet';
    if (raw.startsWith('[IMAGE]:')) return '📷 Photo attachment';
    if (raw.startsWith('[AUDIO_NOTE]:')) return '🎤 Voice note';
    if (raw.startsWith('[SALE_CONFIRMATION]:')) return '🤝 Verified sale release';
    return raw;
  };

  const formatTime = (iso: string) => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ChatDetail', {
          conversationId: item.id,
          businessId: item.businessId,
          recipientId: item.recipientId,
          recipientName: item.recipientName,
        })
      }
      style={styles.convCard}
      activeOpacity={0.75}
    >
      <View style={styles.avatar}>
        {currentRole === 'business' ? (
          <User size={22} color={colors.accentCyan} />
        ) : (
          <Store size={22} color={colors.accentCyan} />
        )}
      </View>

      <View style={styles.contentCol}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={styles.recipientName} numberOfLines={1}>
              {item.recipientName}
            </Text>
            {item.isVerified && (
              <CheckCircle2 size={14} color={colors.accentEmerald} strokeWidth={2.6} />
            )}
          </View>
          <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
        </View>

        {item.recipientSubtitle && (
          <Text style={styles.subtitleText} numberOfLines={1}>
            {item.recipientSubtitle}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {formatMessageSnippet(item.lastMessage)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Direct Messages"
        subtitle={
          currentRole === 'business'
            ? 'Customer inquiries & orders'
            : 'Merchant chat & negotiations'
        }
        showBack={false}
        showCart={currentRole === 'customer'}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Syncing chats...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <MessageSquare size={36} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            {currentRole === 'business'
              ? 'When campus buyers message your shop or inquire about items, chats will appear here.'
              : 'Tap "Chat" on any product or seller card in the marketplace to start a direct inquiry.'}
          </Text>
          {currentRole === 'customer' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CustomerDiscover')}
              style={styles.exploreBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Browse Campus Feed</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accentCyan}
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
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: colors.accentCyan,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});
