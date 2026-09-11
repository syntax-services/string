import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { supabase } from '../../lib/supabase';
import { Product, Service } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Search, Sparkles, CheckCircle2, ShoppingCart, SlidersHorizontal } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 36) / 2;

const CATEGORIES = ['All', 'Textbooks', 'Gadgets & Tech', 'Fashion & Thrift', 'Food & Snacks', 'Services'];

export const CustomerDiscoverScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiscoverItems = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*, business:businesses(*)')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts((data as any) || []);
    } catch (err) {
      console.error('[FETCH DISCOVER ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiscoverItems();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDiscoverItems();
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.business?.company_name?.toLowerCase().includes(q)
    );
  });

  const renderProductItem = ({ item }: { item: Product }) => {
    const hasDiscount = item.compare_at_price && item.compare_at_price > item.price;
    const isOutOfStock = item.stock_quantity <= 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id, initialProduct: item })}
        style={styles.card}
        activeOpacity={0.85}
      >
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.productImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Sparkles size={24} color={colors.textMuted} />
            </View>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{Math.round((1 - item.price / item.compare_at_price!) * 100)}%
              </Text>
            </View>
          )}

          {/* Out of stock badge */}
          {isOutOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Sold Out</Text>
            </View>
          )}
        </View>

        {/* Product Meta */}
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₦{item.price.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.comparePriceText}>₦{item.compare_at_price?.toLocaleString()}</Text>
            )}
          </View>

          {/* Seller Store Info */}
          {item.business && (
            <View style={styles.sellerRow}>
              <Text style={styles.sellerName} numberOfLines={1}>
                {item.business.company_name}
              </Text>
              {item.business.verified && (
                <CheckCircle2 size={12} color={colors.accentEmerald} strokeWidth={2.6} />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo-Free Top Bar */}
      <AppHeader showCampusPicker campusName="UNILAG Akoka" showCart />

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campus goods, books, gadgets..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories Horizontal Scroller */}
      <View style={styles.categoriesSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item: category }) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(category)}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Products 2-Column Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Curating campus deals...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={renderProductItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentCyan} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Sparkles size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Listings Found</Text>
              <Text style={styles.emptySubtitle}>
                No campus products match this filter currently. Check back soon or change filters.
              </Text>
            </View>
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  categoriesSection: {
    paddingVertical: 10,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 110, // Generous padding for Pinterest floating dock
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrapper: {
    width: '100%',
    height: COLUMN_WIDTH * 1.15,
    backgroundColor: colors.cardElevated,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accentRose,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outOfStockText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 10,
  },
  productName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  priceText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  comparePriceText: {
    color: colors.textMuted,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerName: {
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
