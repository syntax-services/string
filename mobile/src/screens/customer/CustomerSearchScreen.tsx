import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Search, Sparkles, Filter, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 36) / 2;

const POPULAR_SEARCHES = ['MacBook M1', 'Economics Textbooks', 'Nike Dunks', 'AirPods Pro', 'Indomie Cartons', 'PowerBank 20000mAh'];

export const CustomerSearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*, business:businesses(*)')
        .ilike('name', `%${text.trim()}%`)
        .limit(20);

      setResults((data as any) || []);
    } catch (err) {
      console.error('[SEARCH ERROR]', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Search & Match" showBack={false} showCart />

      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.accentCyan} />
          <TextInput
            style={styles.input}
            placeholder="What are you looking for on campus?"
            placeholderTextColor={colors.textPlaceholder}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>
      </View>

      {/* If no query, show trending campus searches */}
      {!query.trim() ? (
        <View style={styles.trendingSection}>
          <Text style={styles.trendingLabel}>Trending Campus Searches</Text>
          <View style={styles.tagsWrapper}>
            {POPULAR_SEARCHES.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => handleSearch(tag)}
                style={styles.tagPill}
                activeOpacity={0.8}
              >
                <Sparkles size={12} color={colors.accentCyan} />
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id, initialProduct: item })}
              style={styles.card}
              activeOpacity={0.85}
            >
              <View style={styles.imageWrapper}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={styles.placeholder}>
                    <Sparkles size={20} color={colors.textMuted} />
                  </View>
                )}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
                {item.business && (
                  <View style={styles.sellerRow}>
                    <Text style={styles.seller} numberOfLines={1}>
                      {item.business.company_name}
                    </Text>
                    {item.business.verified && (
                      <CheckCircle2 size={11} color={colors.accentEmerald} strokeWidth={2.6} />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !searching ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No matches found</Text>
                <Text style={styles.emptySubtitle}>Try searching with broader terms or check spelling.</Text>
              </View>
            ) : null
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
  searchBoxContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  trendingSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  trendingLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrapper: {
    width: '100%',
    height: COLUMN_WIDTH * 1.1,
    backgroundColor: colors.cardElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 10,
  },
  name: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seller: {
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
