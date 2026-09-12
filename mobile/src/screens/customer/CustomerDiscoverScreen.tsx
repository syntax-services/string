import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ShoppingCart,
  Store,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

interface DiscoverItem {
  id: string;
  name: string;
  price: number | string;
  compare_at_price?: number | null;
  image_url: string | null;
  images?: string[] | null;
  description: string | null;
  category?: string | null;
  tags?: string[] | null;
  isService: boolean;
  aspectRatio: number;
  business: {
    id: string;
    company_name: string;
    logo_url: string | null;
    verified: boolean;
    verification_tier?: string;
    is_open_now?: boolean;
  };
}

export const CustomerDiscoverScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state (1:1 with CustomerDiscover.tsx lines 83-87)
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'products' | 'services'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [openNowFilter, setOpenNowFilter] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const flatItems: DiscoverItem[] = [];

      // 1. Fetch products with merchant info (1:1 with CustomerDiscover.tsx lines 127-168)
      const { data: directProducts, error: prodErr } = await supabase
        .from('products')
        .select(`
          id, name, business_id, price, compare_at_price, image_url, images, description, category, tags, is_orderable, stock_quantity,
          businesses (id, company_name, logo_url, location_verified, verified, is_active, verification_tier, is_open_now)
        `)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (directProducts) {
        directProducts.forEach((p: any) => {
          const biz = p.businesses;
          if (biz && biz.is_active !== false) {
            flatItems.push({
              id: p.id,
              name: p.name || 'Product',
              price: p.price || 0,
              compare_at_price: p.compare_at_price,
              image_url: p.image_url || (Array.isArray(p.images) && p.images[0]) || null,
              images: p.images || (p.image_url ? [p.image_url] : []),
              description: p.description || null,
              category: p.category || 'Other',
              tags: p.tags || [],
              business: {
                id: biz.id,
                company_name: biz.company_name || 'Merchant Shop',
                logo_url: biz.logo_url || null,
                verified: !!(biz.location_verified || biz.verified),
                verification_tier: biz.verification_tier || 'none',
                is_open_now: biz.is_open_now,
              },
              isService: false,
              aspectRatio: 1.1,
            });
          }
        });
      }

      // 2. Fetch services with merchant info (1:1 with CustomerDiscover.tsx lines 171-206)
      const { data: directServices } = await supabase
        .from('services')
        .select(`
          id, name, business_id, images, price_min, price_max, description, category, is_orderable,
          businesses (id, company_name, logo_url, location_verified, verified, is_active, verification_tier, is_open_now)
        `)
        .order('created_at', { ascending: false });

      if (directServices) {
        directServices.forEach((s: any) => {
          const biz = s.businesses;
          if (biz && biz.is_active !== false) {
            flatItems.push({
              id: s.id,
              name: s.name || 'Service',
              price: s.price_min ? `₦${Number(s.price_min).toLocaleString()}` : 'Custom Quote',
              image_url: (Array.isArray(s.images) && s.images[0]) || null,
              images: s.images || [],
              description: s.description || null,
              category: s.category || 'Other Services',
              tags: [],
              business: {
                id: biz.id,
                company_name: biz.company_name || 'Service Provider',
                logo_url: biz.logo_url || null,
                verified: !!(biz.location_verified || biz.verified),
                verification_tier: biz.verification_tier || 'none',
                is_open_now: biz.is_open_now,
              },
              isService: true,
              aspectRatio: 1.25,
            });
          }
        });
      }

      // Prioritize boosted / premium businesses
      flatItems.sort((a, b) => {
        const aIsBoosted = a.business?.verification_tier === 'premium' ? 1 : 0;
        const bIsBoosted = b.business?.verification_tier === 'premium' ? 1 : 0;
        return bIsBoosted - aIsBoosted;
      });

      setItems(flatItems);
    } catch (err) {
      console.error('[DISCOVER FETCH ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Distinct Categories list (1:1 with line 245)
  const categoryOptions = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[])).sort();
  }, [items]);

  // Filter items matching web lines 253-276
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.business.company_name.toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.tags || []).some((t) => typeof t === 'string' && t.toLowerCase().includes(q));

      const matchesType =
        itemTypeFilter === 'all' ||
        (itemTypeFilter === 'products' && !item.isService) ||
        (itemTypeFilter === 'services' && item.isService);

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      const numPrice = typeof item.price === 'number' ? item.price : null;
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under5k' && numPrice !== null && numPrice < 5000) ||
        (priceFilter === '5to20k' && numPrice !== null && numPrice >= 5000 && numPrice <= 20000) ||
        (priceFilter === '20kplus' && numPrice !== null && numPrice > 20000);

      const matchesOpenNow = !openNowFilter || (openNowFilter && item.business.is_open_now);

      return matchesSearch && matchesType && matchesCategory && matchesPrice && matchesOpenNow;
    });
  }, [items, search, itemTypeFilter, categoryFilter, priceFilter, openNowFilter]);

  const renderItemCard = ({ item }: { item: DiscoverItem }) => {
    const formattedPrice =
      typeof item.price === 'number' ? `₦${item.price.toLocaleString()}` : item.price;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => {
          navigation.navigate('ProductDetail', {
            productId: item.id,
            initialProduct: {
              id: item.id,
              name: item.name,
              price: typeof item.price === 'number' ? item.price : null,
              image_url: item.image_url,
              images: item.images,
              description: item.description,
              category: item.category,
              business: item.business,
            },
          });
        }}
      >
        {/* Media Container with aspect ratio */}
        <View style={[styles.imageWrapper, { height: CARD_WIDTH * item.aspectRatio }]}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Sparkles size={24} color={colors.textMuted} />
            </View>
          )}

          {/* Floating Merchant Avatar Badge (1:1 Web Photocopy line 525-539) */}
          {item.business.logo_url && (
            <View style={styles.merchantAvatarBadge}>
              <Image
                source={{ uri: item.business.logo_url }}
                style={styles.merchantAvatarImg}
                contentFit="cover"
              />
            </View>
          )}
        </View>

        {/* Card Content (1:1 Web lines 542-547) */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardPrice}>{formattedPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Store" showBack={false} showCart={true} />

      {/* Sticky Top Search & Filter Bar (1:1 Web Photocopy lines 366-396) */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search products, brands and categories..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
              <X size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setIsFilterModalOpen(true)}
          style={[
            styles.filterButton,
            (categoryFilter !== 'all' || priceFilter !== 'all' || itemTypeFilter !== 'all' || openNowFilter) &&
              styles.filterButtonActive,
          ]}
          activeOpacity={0.8}
        >
          <SlidersHorizontal
            size={18}
            color={
              categoryFilter !== 'all' || priceFilter !== 'all' || itemTypeFilter !== 'all' || openNowFilter
                ? colors.primary
                : colors.text
            }
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>

      {/* Category Pills Horizontal Bar */}
      <View style={styles.categoryPillsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
          <TouchableOpacity
            style={[styles.categoryPill, categoryFilter === 'all' && styles.categoryPillActive]}
            activeOpacity={0.8}
            onPress={() => setCategoryFilter('all')}
          >
            <Text
              style={[
                styles.categoryPillText,
                categoryFilter === 'all' && styles.categoryPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categoryOptions.map((cat) => {
            const isCatActive = categoryFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isCatActive && styles.categoryPillActive]}
                activeOpacity={0.8}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isCatActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2-Column Grid (1:1 Web Masonry Feed lines 483-550) */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading marketplace goods & services...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <ShoppingCart size={44} color={colors.textMuted} strokeWidth={1.2} />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptyDesc}>Try adjusting your filters or search terms.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItemCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Filter Modal (1:1 Web Drawer Photocopy lines 397-474) */}
      <Modal visible={isFilterModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Category Filter */}
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptionsGrid}>
                <TouchableOpacity
                  style={[styles.filterChip, categoryFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setCategoryFilter('all')}
                >
                  <Text style={[styles.filterChipText, categoryFilter === 'all' && styles.filterChipTextActive]}>
                    All Categories
                  </Text>
                </TouchableOpacity>
                {categoryOptions.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
                    onPress={() => setCategoryFilter(cat)}
                  >
                    <Text style={[styles.filterChipText, categoryFilter === cat && styles.filterChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range Filter */}
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.filterOptionsGrid}>
                {[
                  ['all', 'Any Price'],
                  ['under5k', 'Under ₦5,000'],
                  ['5to20k', '₦5,000 - ₦20,000'],
                  ['20kplus', 'Above ₦20,000'],
                ].map(([val, lbl]) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.filterChip, priceFilter === val && styles.filterChipActive]}
                    onPress={() => setPriceFilter(val)}
                  >
                    <Text style={[styles.filterChipText, priceFilter === val && styles.filterChipTextActive]}>
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Listing Type Filter */}
              <Text style={styles.filterSectionTitle}>Listing Type</Text>
              <View style={styles.filterOptionsGrid}>
                {[
                  ['all', 'All'],
                  ['products', 'Products'],
                  ['services', 'Services'],
                ].map(([val, lbl]) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.filterChip, itemTypeFilter === val && styles.filterChipActive]}
                    onPress={() => setItemTypeFilter(val as any)}
                  >
                    <Text style={[styles.filterChipText, itemTypeFilter === val && styles.filterChipTextActive]}>
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Open Now Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.8}
                onPress={() => setOpenNowFilter(!openNowFilter)}
              >
                <View style={[styles.checkboxBox, openNowFilter && styles.checkboxBoxActive]}>
                  {openNowFilter && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>Open Now (Instant Campus Pickup)</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyFilterBtn}
                activeOpacity={0.85}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={styles.applyFilterBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  categoryPillsWrapper: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.4)',
  },
  categoryPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: colors.cardElevated,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantAvatarBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.card,
    overflow: 'hidden',
    backgroundColor: colors.card,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantAvatarImg: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  cardPrice: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 18,
    paddingBottom: 32,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  filterSectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardElevated,
  },
  checkboxBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  applyFilterBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
