import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Share,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { 
  ShieldCheck, 
  Store, 
  MessageSquare, 
  Share2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addItem } = useCart();

  const { productId, initialProduct } = route.params || {};
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!initialProduct);

  useEffect(() => {
    if (productId) {
      supabase
        .from('products')
        .select('*, business:businesses(*)')
        .eq('id', productId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProduct(data as any);
          setLoading(false);
        });
    }
  }, [productId]);

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.name} on String Campus Marketplace: https://www.string.com.ng/product/${product.id}`,
      });
    } catch {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    Alert.alert('Added to Cart', `${product.name} (x${quantity}) was added to your bag.`, [
      { text: 'Keep Browsing' },
      { text: 'View Bag', onPress: () => navigation.navigate('CartCheckout') },
    ]);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    navigation.navigate('CartCheckout');
  };

  const handleMessageSeller = () => {
    if (!product?.business?.id) return;
    navigation.navigate('ChatDetail', {
      businessId: product.business.id,
      businessName: product.business.company_name,
      initialContext: `Hi, I'm interested in "${product.name}" (₦${product.price.toLocaleString()})`,
    });
  };

  if (!product && !loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Product Details" showBack />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product listing not found or removed.</Text>
        </View>
      </View>
    );
  }

  const hasDiscount = product?.compare_at_price && product.compare_at_price > product.price;

  return (
    <View style={styles.container}>
      <AppHeader
        title={product?.name ? product.name.slice(0, 20) + '...' : 'Product Details'}
        showBack
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.headerActionBtn}>
            <Share2 size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Full-bleed Product Image */}
        <View style={styles.imageContainer}>
          {product?.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.productImage} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Sparkles size={48} color={colors.textMuted} />
            </View>
          )}

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                SAVE ₦{(product!.compare_at_price! - product!.price).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Product Details Section */}
        <View style={styles.detailsContainer}>
          {/* Price & Stock */}
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceText}>₦{product?.price.toLocaleString()}</Text>
              {hasDiscount && (
                <Text style={styles.comparePriceText}>
                  ₦{product?.compare_at_price?.toLocaleString()}
                </Text>
              )}
            </View>

            <View style={styles.stockPill}>
              <Text style={styles.stockText}>
                {product && product.stock_quantity > 0 ? '● In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.productTitle}>{product?.name}</Text>

          {/* Escrow Guarantee Pill */}
          <View style={styles.escrowCard}>
            <ShieldCheck size={20} color={colors.accentEmerald} strokeWidth={2.4} />
            <View style={styles.escrowTextCol}>
              <Text style={styles.escrowTitle}>String Escrow Protected</Text>
              <Text style={styles.escrowSubtitle}>
                Payment is securely held in campus escrow. Seller is paid only after you inspect and accept your item.
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product?.description || 'No additional description provided by the seller.'}
            </Text>
          </View>

          {/* Seller Store Card */}
          {product?.business && (
            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Store size={22} color={colors.accentCyan} />
              </View>
              <View style={styles.sellerMeta}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{product.business.company_name}</Text>
                  {product.business.verified && (
                    <CheckCircle2 size={14} color={colors.accentEmerald} strokeWidth={2.6} />
                  )}
                </View>
                <Text style={styles.sellerLocation} numberOfLines={1}>
                  {product.business.business_location || 'Campus Store'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleMessageSeller}
                style={styles.messageSellerBtn}
                activeOpacity={0.8}
              >
                <MessageSquare size={16} color={colors.text} />
                <Text style={styles.messageSellerText}>Chat</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyBtn}
              >
                <Minus size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyNumber}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.qtyBtn}
              >
                <Plus size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Dock */}
      <SafeAreaView style={styles.bottomDock}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartBtn}
          activeOpacity={0.85}
        >
          <ShoppingCart size={18} color={colors.text} />
          <Text style={styles.addToCartText}>Add to Bag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBuyNow}
          style={styles.buyNowBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.buyNowText}>Instant Buy</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: width,
    height: width * 1.05,
    backgroundColor: colors.cardElevated,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: colors.accentRose,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsContainer: {
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  comparePriceText: {
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stockPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  stockText: {
    color: colors.accentEmerald,
    fontSize: 12,
    fontWeight: '700',
  },
  productTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 18,
  },
  escrowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 12,
    marginBottom: 22,
  },
  escrowTextCol: {
    flex: 1,
  },
  escrowTitle: {
    color: colors.accentEmerald,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  escrowSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerMeta: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sellerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  sellerLocation: {
    color: colors.textMuted,
    fontSize: 11,
  },
  messageSellerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  messageSellerText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantityLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumber: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 10,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  buyNowBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
