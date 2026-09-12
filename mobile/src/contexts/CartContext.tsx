import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import * as SecureStore from 'expo-secure-store';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  selectedLandmark: string | null;
  setSelectedLandmark: (landmark: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('string_mobile_cart')
      .then((data) => {
        if (data) {
          try {
            setItems(JSON.parse(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    SecureStore.setItemAsync('string_mobile_cart', JSON.stringify(newItems)).catch(() => {});
  };

  const addItem = (product: Product, quantity: number = 1, selectedVariant?: string) => {
    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...items, { id: `${product.id}_${Date.now()}`, product, quantity, selectedVariant }]);
    }
  };

  const removeItem = (productId: string) => {
    saveCart(items.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      saveCart(items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        selectedLandmark,
        setSelectedLandmark,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
