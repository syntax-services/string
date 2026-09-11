import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Send,
  Sparkles,
  Store,
  CheckCircle2,
  Image as ImageIcon,
  Mic,
  ShieldCheck,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'business';
  content: string;
  created_at: string;
}

export const ChatDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user, currentRole, business } = useAuth();

  const {
    conversationId: initialConvId,
    businessId,
    recipientName,
    initialContext,
  } = route.params || {};

  const [conversationId, setConversationId] = useState<string | null>(initialConvId || null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [inputText, setInputText] = useState(initialContext || '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Initialize or find conversation
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;

      try {
        if (conversationId) {
          // Fetch messages for existing conversation
          await fetchMessages(conversationId);
        } else if (businessId) {
          // Look up if a conversation already exists
          const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('customer_id', user.id)
            .eq('business_id', businessId)
            .maybeSingle();

          if (existing?.id) {
            setConversationId(existing.id);
            await fetchMessages(existing.id);
          } else {
            // New conversation will be created on first send
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('[INIT CHAT ERROR]', err);
        setLoading(false);
      }
    };

    initChat();
  }, [conversationId, businessId, user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 150);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async (cId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', cId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('[FETCH MESSAGES ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !user) return;

    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    setSending(true);
    try {
      let activeConvId = conversationId;

      // If no conversation exists yet, create one
      if (!activeConvId) {
        if (!businessId) {
          throw new Error('Merchant ID missing. Cannot initiate chat.');
        }

        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            customer_id: user.id,
            business_id: businessId,
            last_message: text,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (convError) throw convError;
        activeConvId = newConv.id;
        setConversationId(activeConvId);
      }

      const senderType = currentRole === 'business' ? 'business' : 'customer';

      // Insert message
      const { data: newMsg, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConvId,
          sender_id: user.id,
          sender_type: senderType,
          content: text,
        })
        .select('*')
        .single();

      if (msgError) throw msgError;

      // Update conversation last_message
      await supabase
        .from('conversations')
        .update({
          last_message: text,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', activeConvId);

      // Append optimistically
      if (newMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      setInputText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      Alert.alert('Send Failed', err.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = ({ item }: { item: MessageRow }) => {
    const isMine = item.sender_id === user?.id;

    // 1. Check for image
    if (item.content.startsWith('[IMAGE]:')) {
      const imgUrl = item.content.replace('[IMAGE]:', '');
      return (
        <View style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowTheirs]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, styles.imageBubble]}>
            <Image source={{ uri: imgUrl }} style={styles.bubbleImage} contentFit="cover" />
            <Text style={[styles.timeLabel, isMine && styles.timeLabelMine]}>
              {format(new Date(item.created_at), 'HH:mm')}
            </Text>
          </View>
        </View>
      );
    }

    // 2. Check for voice note
    if (item.content.startsWith('[AUDIO_NOTE]:')) {
      return (
        <View style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowTheirs]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, styles.audioBubble]}>
            <View style={styles.audioPill}>
              <Mic size={16} color={colors.accentCyan} />
              <Text style={styles.audioText}>Voice Note</Text>
            </View>
            <Text style={[styles.timeLabel, isMine && styles.timeLabelMine]}>
              {format(new Date(item.created_at), 'HH:mm')}
            </Text>
          </View>
        </View>
      );
    }

    // 3. Regular text
    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowTheirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
            {item.content}
          </Text>
          <Text style={[styles.timeLabel, isMine && styles.timeLabelMine]}>
            {format(new Date(item.created_at), 'HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={recipientName || 'Campus Chat'}
        subtitle="● Active on campus"
        showBack
        showCart={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accentCyan} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Sparkles size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Start a Conversation</Text>
                <Text style={styles.emptyDesc}>
                  Negotiate prices, check stock availability, or coordinate your campus delivery landmark.
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Send size={18} color="#000000" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  msgRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: colors.primaryForeground,
  },
  bubbleTextTheirs: {
    color: colors.text,
  },
  timeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeLabelMine: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  imageBubble: {
    padding: 4,
  },
  bubbleImage: {
    width: 220,
    height: 180,
    borderRadius: 14,
  },
  audioBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
