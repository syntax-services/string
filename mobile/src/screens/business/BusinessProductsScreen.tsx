import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Plus, Package, Sparkles, Trash2, Edit3 } from 'lucide-react-native';

export const BusinessProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { business } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    if (!business?.id) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('[FETCH BIZ PRODUCTS ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [business?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert('Delete Product', 'Remove this listing from your campus catalog?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('products').delete().eq('id', productId);
          fetchProducts();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Store Catalog"
        subtitle={`${products.length} products`}
        showBack={false}
        showCart={false}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditProduct')}
            style={styles.addBtn}
            activeOpacity={0.8}
          >
            <Plus size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentCyan} />
          }
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <View style={styles.imgWrapper}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.img} />
                ) : (
                  <View style={styles.placeholderImg}>
                    <Package size={20} color={colors.textMuted} />
                  </View>
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>
                    {item.stock_quantity > 0 ? `${item.stock_quantity} units available` : 'Sold Out'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteProduct(item.id)}
                style={styles.deleteBtn}
              >
                <Trash2 size={18} color={colors.accentRose} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Package size={50} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Products Listed</Text>
              <Text style={styles.emptySubtitle}>
                Add textbooks, gadgets, shoes or snacks to start receiving orders on campus.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddEditProduct')}
                style={styles.emptyAddBtn}
              >
                <Text style={styles.emptyAddBtnText}>Add First Product</Text>
              </TouchableOpacity>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  imgWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  placeholderImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  price: {
    color: colors.accentCyan,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
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
  emptyAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyAddBtnText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
});
