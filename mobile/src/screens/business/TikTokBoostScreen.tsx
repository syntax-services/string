import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TikTokConnection } from '../../types';
import { 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Heart, 
  Video, 
  Settings, 
  Link, 
  LogOut 
} from 'lucide-react-native';

export const TikTokBoostScreen: React.FC = () => {
  const { business } = useAuth();
  const [connection, setConnection] = useState<TikTokConnection | null>(null);
  const [autoBoost, setAutoBoost] = useState(true);
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business?.id) {
      supabase
        .from('business_tiktok_connections')
        .select('*')
        .eq('business_id', business.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setConnection(data as any);
            setAutoBoost(data.auto_boost_enabled ?? true);
            setCadence(data.auto_boost_frequency ?? 'weekly');
          } else {
            // Default sandbox mock connection
            setConnection({
              id: 'mock-connection',
              business_id: business.id,
              tiktok_username: 'SyntaxMerchant',
              tiktok_display_name: 'Syntax Campus',
              tiktok_avatar_url: null,
              is_connected: true,
              auto_boost_enabled: true,
              auto_boost_frequency: 'weekly',
              total_promotions_posted: 6,
              total_tiktok_views: 14200,
              total_tiktok_likes: 1890,
              last_promoted_at: new Date().toISOString(),
            });
          }
          setLoading(false);
        });
    }
  }, [business?.id]);

  const handleToggleAutoBoost = async (val: boolean) => {
    setAutoBoost(val);
    if (business?.id) {
      await supabase
        .from('business_tiktok_connections')
        .update({ auto_boost_enabled: val })
        .eq('business_id', business.id);
    }
  };

  const handleCadenceChange = async (newCadence: 'daily' | 'weekly' | 'biweekly') => {
    setCadence(newCadence);
    if (business?.id) {
      await supabase
        .from('business_tiktok_connections')
        .update({ auto_boost_frequency: newCadence })
        .eq('business_id', business.id);
    }
  };

  const handleTriggerTestBoost = () => {
    Alert.alert(
      'Campaign Dispatched! 🚀',
      'AI Video Generator has initiated promotional reel compilation. The video will be scheduled on TikTok Creator Center with direct store backlinks.'
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="TikTok Social Commerce" subtitle="Auto-Boost & Video Ads" showBack={false} showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TIKTOK AUTO-BOOST</Text>
            </View>
            <View style={styles.connectedPill}>
              <CheckCircle2 size={12} color={colors.accentEmerald} />
              <Text style={styles.connectedText}>Connected & Active</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            @{connection?.tiktok_username || 'SyntaxMerchant'}
          </Text>
          <Text style={styles.heroSub}>
            New products added to your catalog are rendered into high-impact TikTok reels and posted automatically.
          </Text>

          <TouchableOpacity
            onPress={handleTriggerTestBoost}
            style={styles.boostBtn}
            activeOpacity={0.85}
          >
            <Sparkles size={16} color={colors.primaryForeground} />
            <Text style={styles.boostBtnText}>Run Instant Auto-Boost</Text>
          </TouchableOpacity>
        </View>

        {/* Bento Metrics */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoItem}>
            <Eye size={20} color={colors.accentCyan} />
            <Text style={styles.bentoVal}>
              {connection?.total_tiktok_views?.toLocaleString() || '14.2k'}
            </Text>
            <Text style={styles.bentoLbl}>Video Views</Text>
          </View>

          <View style={styles.bentoItem}>
            <Heart size={20} color={colors.accentRose} />
            <Text style={styles.bentoVal}>
              {connection?.total_tiktok_likes?.toLocaleString() || '1.8k'}
            </Text>
            <Text style={styles.bentoLbl}>Total Likes</Text>
          </View>

          <View style={styles.bentoItem}>
            <Video size={20} color={colors.accentEmerald} />
            <Text style={styles.bentoVal}>
              {connection?.total_promotions_posted || '6'}
            </Text>
            <Text style={styles.bentoLbl}>Reels Posted</Text>
          </View>
        </View>

        {/* Settings & Cadence */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>Automation Preferences</Text>
          <View style={styles.settingsCard}>
            {/* Auto Boost Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingMeta}>
                <Text style={styles.settingTitle}>Auto-Promote New Listings</Text>
                <Text style={styles.settingSub}>Generate AI promo clips upon publishing products</Text>
              </View>
              <Switch
                value={autoBoost}
                onValueChange={handleToggleAutoBoost}
                trackColor={{ false: '#333333', true: colors.accentRose }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Cadence Selection */}
            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingMeta}>
                <Text style={styles.settingTitle}>Boost Cadence</Text>
                <Text style={styles.settingSub}>Frequency of scheduled posts</Text>
              </View>
              <View style={styles.cadencePills}>
                {(['daily', 'weekly', 'biweekly'] as const).map((c) => {
                  const isSelected = cadence === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => handleCadenceChange(c)}
                      style={[styles.cadencePill, isSelected && styles.cadencePillActive]}
                    >
                      <Text style={[styles.cadenceText, isSelected && styles.cadenceTextActive]}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
    paddingBottom: 110,
    gap: 16,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 80, 0.25)',
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 0, 80, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.accentRose,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  connectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  connectedText: {
    color: colors.accentEmerald,
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  boostBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  boostBtnText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  bentoVal: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  bentoLbl: {
    color: colors.textMuted,
    fontSize: 11,
  },
  settingsSection: {
    gap: 10,
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingMeta: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  cadencePills: {
    flexDirection: 'row',
    gap: 6,
  },
  cadencePill: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cadencePillActive: {
    borderColor: colors.accentRose,
  },
  cadenceText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  cadenceTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
