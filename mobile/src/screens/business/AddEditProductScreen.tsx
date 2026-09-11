import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { AppHeader } from '../../components/navigation/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Camera, Image as ImageIcon, Sparkles, Check } from 'lucide-react-native';

const CATEGORIES = ['Textbooks', 'Gadgets & Tech', 'Fashion & Thrift', 'Food & Snacks', 'Services', 'Other'];

export const AddEditProductScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { business } = useAuth();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Title Required', 'Please enter a product title.');
      return;
    }

    const parsedPrice = parseFloat(price.replace(/,/g, ''));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price in Naira.');
      return;
    }

    if (!business?.id) {
      Alert.alert('Store Required', 'You must have an active campus shop to list goods.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedCompare = comparePrice ? parseFloat(comparePrice.replace(/,/g, '')) : null;
      const parsedStock = parseInt(stockQuantity, 10) || 1;

      const { error } = await supabase.from('products').insert({
        business_id: business.id,
        name: name.trim(),
        price: parsedPrice,
        compare_at_price: parsedCompare,
        stock_quantity: parsedStock,
        category,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: true,
      });

      setIsSubmitting(false);

      if (error) throw error;

      Alert.alert('Product Published', 'Your listing is live on the campus marketplace!', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err?.message || 'Could not save product listing.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Add New Product" showBack showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Image Preview & URL input */}
        <View style={styles.imageSection}>
          {imageUrl.trim() ? (
            <Image source={{ uri: imageUrl.trim() }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imageUploadBox}>
              <ImageIcon size={32} color={colors.textMuted} />
              <Text style={styles.imageUploadText}>Paste direct image link below</Text>
            </View>
          )}

          <TextInput
            style={styles.urlInput}
            placeholder="Image URL (e.g. https://images.unsplash.com/...)"
            placeholderTextColor={colors.textPlaceholder}
            value={imageUrl}
            onChangeText={setImageUrl}
          />
        </View>

        {/* Product Details Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Engineering Mathematics Textbook (Used)"
              placeholderTextColor={colors.textPlaceholder}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Pricing Row */}
          <View style={styles.priceRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Selling Price (₦)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 8500"
                placeholderTextColor={colors.textPlaceholder}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Original Price (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 12000"
                placeholderTextColor={colors.textPlaceholder}
                value={comparePrice}
                onChangeText={setComparePrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Stock & Category */}
          <View style={styles.priceRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Available Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.textPlaceholder}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CATEGORIES.map((c) => {
                const isSelected = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.catChip, isSelected && styles.catChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description & Condition</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Highlight condition, specs, warranty or meetup notes..."
              placeholderTextColor={colors.textPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.submitBtnText}>Publish to Campus Feed</Text>
            )}
          </TouchableOpacity>
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
    paddingBottom: 60,
  },
  imageSection: {
    marginBottom: 20,
    gap: 10,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: colors.cardElevated,
  },
  imageUploadBox: {
    width: '100%',
    height: 160,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageUploadText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  urlInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 44,
    color: colors.text,
    fontSize: 13,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 50,
    color: colors.text,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
  },
  catChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.accentCyan,
  },
  catChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: colors.accentCyan,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
  },
});
