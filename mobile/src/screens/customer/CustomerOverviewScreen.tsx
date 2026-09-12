import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  Heart,
  MessageCircle,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ChevronDown,
} from 'lucide-react-native';
import { AppHeader } from '../../components/navigation/AppHeader';

const { width } = Dimensions.get('window');

interface SocialFeedPost {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category: string;
  likeCount: number;
  commentCount: number;
  is_featured?: boolean;
  isService?: boolean;
  business: {
    id: string;
    company_name: string;
    handle: string;
    logo_url: string | null;
    verified?: boolean;
  };
}

export const CustomerOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [feedPosts, setFeedPosts] = useState<SocialFeedPost[]>([]);
  const [followedBizIds, setFollowedBizIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch followed stores
  const fetchFollows = async () => {
    if (!user) return;
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customer?.id) {
        const { data } = await supabase
          .from('saved_businesses')
          .select('business_id')
          .eq('customer_id', customer.id);
        if (data) {
          setFollowedBizIds(data.map((f) => f.business_id));
        }
      }
    } catch (err) {
      console.warn('Follows fetch error:', err);
    }
  };

  // Load feed from Supabase matching web CustomerOverview.tsx
  const loadFeed = async () => {
    try {
      // 1. Fetch products
      const { data: dbProducts } = await supabase
        .from('products')
        .select(`
          id, name, description, price, image_url, images, category, is_featured,
          businesses (id, company_name, logo_url, cover_image_url, verified, is_active)
        `)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      // 2. Fetch services
      const { data: dbServices } = await supabase
        .from('services')
        .select(`
          id, name, description, price_min, images, category,
          businesses (id, company_name, logo_url, cover_image_url, verified, is_active)
        `)
        .order('created_at', { ascending: false });

      const mapped: SocialFeedPost[] = [];

      if (dbProducts) {
        dbProducts.forEach((p: any, idx: number) => {
          const biz = p.businesses;
          if (!biz || biz.is_active === false) return;
          const cleanName = (biz.company_name || 'Merchant').toLowerCase().replace(/[^a-z0-9]/g, '_');

          mapped.push({
            id: p.id,
            name: p.name || 'Product',
            description: p.description || null,
            price: p.price || 0,
            image_url: p.image_url || (Array.isArray(p.images) && p.images[0]) || null,
            category: (p.category || 'CAMPUS STORE').toUpperCase(),
            likeCount: (idx * 3) + 2,
            commentCount: idx % 4,
            is_featured: !!p.is_featured,
            isService: false,
            business: {
              id: biz.id,
              company_name: biz.company_name || 'Merchant Shop',
              handle: `@${cleanName}`,
              logo_url: biz.logo_url || biz.cover_image_url || null,
              verified: !!biz.verified,
            },
          });
        });
      }

      if (dbServices) {
        dbServices.forEach((s: any, idx: number) => {
          const biz = s.businesses;
          if (!biz || biz.is_active === false) return;
          const cleanName = (biz.company_name || 'Service').toLowerCase().replace(/[^a-z0-9]/g, '_');

          mapped.push({
            id: s.id,
            name: s.name || 'Service',
            description: s.description || null,
            price: s.price_min || 0,
            image_url: (Array.isArray(s.images) && s.images[0]) || null,
            category: (s.category || 'SERVICES').toUpperCase(),
            likeCount: (idx * 2) + 1,
            commentCount: idx % 3,
            is_featured: false,
            isService: true,
            business: {
              id: biz.id,
              company_name: biz.company_name || 'Service Provider',
              handle: `@${cleanName}`,
              logo_url: biz.logo_url || biz.cover_image_url || null,
              verified: !!biz.verified,
            },
          });
        });
      }

      setFeedPosts(mapped);
    } catch (err) {
      console.warn('Feed load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
    fetchFollows();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
    fetchFollows();
  };

  // Follow Toggle
  const handleFollowToggle = async (bizId: string) => {
    if (!user) return;
    const isFollowing = followedBizIds.includes(bizId);

    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!customer?.id) return;

      if (isFollowing) {
        await supabase
          .from('saved_businesses')
          .delete()
          .eq('customer_id', customer.id)
          .eq('business_id', bizId);
        setFollowedBizIds((prev) => prev.filter((id) => id !== bizId));
      } else {
        await supabase
          .from('saved_businesses')
          .insert({ customer_id: customer.id, business_id: bizId });
        setFollowedBizIds((prev) => [...prev, bizId]);
      }
    } catch {
      setFollowedBizIds((prev) =>
        isFollowing ? prev.filter((id) => id !== bizId) : [...prev, bizId]
      );
    }
  };

  // Like Toggle
  const handleLike = (postId: string) => {
    const isLiked = likedIds.includes(postId);
    setLikedIds((prev) =>
      isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // Share
  const handleShare = async (post: SocialFeedPost) => {
    try {
      await Share.share({
        message: `Check out ${post.name} on String Campus Marketplace: https://www.string.com.ng/`,
      });
    } catch {}
  };

  const displayedPosts = feedPosts.filter((post) => {
    if (activeTab === 'following') {
      return followedBizIds.includes(post.business.id);
    }
    return true;
  });

  const renderPost = ({ item }: { item: SocialFeedPost }) => {
    const isFollowing = followedBizIds.includes(item.business.id);
    const isLiked = likedIds.includes(item.id);
    const totalLikes = item.likeCount + (isLiked ? 1 : 0);

    return (
      <View style={styles.postCard}>
        {/* Merchant Author Bar */}
        <View style={styles.authorBar}>
          <View style={styles.authorLeft}>
            <View style={styles.avatarWrapper}>
              {item.business.logo_url ? (
                <Image source={{ uri: item.business.logo_url }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Sparkles size={14} color={colors.primary} />
                </View>
              )}
            </View>
            <View>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {item.business.company_name}
                </Text>
                {item.business.verified && (
                  <ShieldCheck size={14} color={colors.primary} />
                )}
                {item.is_featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )}
              </View>
              <Text style={styles.authorHandle}>{item.business.handle}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followButtonActive]}
            onPress={() => handleFollowToggle(item.business.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Curvilinear Media Card */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          activeOpacity={0.9}
        >
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.postImage} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.noImage}>
              <ShoppingBag size={36} color={colors.textMuted} />
            </View>
          )}

          {/* Category Tag Overlay */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{item.category}</Text>
          </View>

          {/* Price Tag Overlay */}
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>
              ₦{Number(item.price || 0).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Post Content */}
        <View style={styles.contentSection}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description ? (
            <Text style={styles.postDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleLike(item.id)}
                activeOpacity={0.7}
              >
                <Heart
                  size={20}
                  color={isLiked ? colors.accentRose : colors.textMuted}
                  fill={isLiked ? colors.accentRose : 'transparent'}
                />
                <Text style={[styles.actionCount, isLiked && { color: colors.accentRose }]}>
                  {totalLikes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                activeOpacity={0.7}
              >
                <MessageCircle size={20} color={colors.textMuted} />
                <Text style={styles.actionCount}>{item.commentCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleShare(item)}
                activeOpacity={0.7}
              >
                <Share2 size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              activeOpacity={0.85}
            >
              <Text style={styles.orderButtonText}>Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Campus Feed" showCart />

      {/* Top Header Switcher: For you ⌵ | Following (Matching Web) */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchTab, activeTab === 'for-you' && styles.switchTabActive]}
          onPress={() => setActiveTab('for-you')}
        >
          <View style={styles.forYouRow}>
            <Text style={[styles.switchTabText, activeTab === 'for-you' && styles.switchTabTextActive]}>
              For you
            </Text>
            <ChevronDown size={14} color={activeTab === 'for-you' ? colors.text : colors.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchTab, activeTab === 'following' && styles.switchTabActive]}
          onPress={() => setActiveTab('following')}
        >
          <View style={styles.forYouRow}>
            <Text style={[styles.switchTabText, activeTab === 'following' && styles.switchTabTextActive]}>
              Following
            </Text>
            {followedBizIds.length > 0 && (
              <View style={styles.followingCountBadge}>
                <Text style={styles.followingCountText}>{followedBizIds.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading aesthetic campus feed...</Text>
        </View>
      ) : displayedPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {activeTab === 'following' ? 'No posts from followed stores yet' : 'No live items found'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'following'
              ? 'Follow campus businesses to view their daily product drops here.'
              : 'Browse the discover catalog to find student merchants.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
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
  tabSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 8,
    paddingTop: 4,
  },
  switchTab: {
    paddingBottom: 6,
  },
  switchTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  forYouRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchTabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  switchTabTextActive: {
    color: colors.text,
    fontWeight: '800',
  },
  followingCountBadge: {
    backgroundColor: colors.cardElevated,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  followingCountText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 20,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  authorBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 160,
  },
  authorHandle: {
    color: colors.textMuted,
    fontSize: 11,
  },
  featuredBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  featuredText: {
    color: colors.accentAmber,
    fontSize: 9,
    fontWeight: '700',
  },
  followButton: {
    backgroundColor: '#C87A6F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonActive: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  followButtonTextActive: {
    color: colors.textSecondary,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.cardElevated,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pricePill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pricePillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  contentSection: {
    paddingHorizontal: 4,
    gap: 6,
  },
  postTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  postDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 10,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
