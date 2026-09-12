import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { PinterestTabBar } from '../components/navigation/PinterestTabBar';

// Auth Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Customer Screens
import { CustomerOverviewScreen } from '../screens/customer/CustomerOverviewScreen';
import { CustomerDiscoverScreen } from '../screens/customer/CustomerDiscoverScreen';
import { CustomerSearchScreen } from '../screens/customer/CustomerSearchScreen';
import { CustomerOrdersScreen } from '../screens/customer/CustomerOrdersScreen';
import { CustomerProfileScreen } from '../screens/customer/CustomerProfileScreen';
import { CustomerSettingsScreen } from '../screens/customer/CustomerSettingsScreen';
import { ProductDetailScreen } from '../screens/customer/ProductDetailScreen';
import { CartCheckoutScreen } from '../screens/customer/CartCheckoutScreen';

// Business Screens
import { BusinessOverviewScreen } from '../screens/business/BusinessOverviewScreen';
import { BusinessProductsScreen } from '../screens/business/BusinessProductsScreen';
import { AddEditProductScreen } from '../screens/business/AddEditProductScreen';
import { BusinessOrdersScreen } from '../screens/business/BusinessOrdersScreen';
import { TikTokBoostScreen } from '../screens/business/TikTokBoostScreen';
import { BusinessPaymentsScreen } from '../screens/business/BusinessPaymentsScreen';
import { BusinessProfileScreen } from '../screens/business/BusinessProfileScreen';

// Shared / Message Screens
import { ConversationsScreen } from '../screens/messages/ConversationsScreen';
import { ChatDetailScreen } from '../screens/messages/ChatDetailScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const CustomerTab = createBottomTabNavigator();
const BusinessTab = createBottomTabNavigator();

// Auth Flow Stack
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
  </AuthStack.Navigator>
);

// Customer Bottom Tab Navigator (1:1 Web Parity: Store, Inbox, Profile)
const CustomerTabNavigator = () => (
  <CustomerTab.Navigator
    tabBar={(props) => <PinterestTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarStyle: { position: 'absolute' },
    }}
  >
    <CustomerTab.Screen
      name="CustomerDiscover"
      component={CustomerDiscoverScreen}
      options={{ tabBarLabel: 'Store' }}
    />
    <CustomerTab.Screen
      name="CustomerMessages"
      component={ConversationsScreen}
      options={{ tabBarLabel: 'Inbox' }}
    />
    <CustomerTab.Screen
      name="CustomerProfile"
      component={CustomerProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </CustomerTab.Navigator>
);

// Business Bottom Tab Navigator (1:1 Web Parity: Store, Inbox, Profile)
const BusinessTabNavigator = () => (
  <BusinessTab.Navigator
    tabBar={(props) => <PinterestTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarStyle: { position: 'absolute' },
    }}
  >
    <BusinessTab.Screen
      name="BusinessOverview"
      component={BusinessOverviewScreen}
      options={{ tabBarLabel: 'Store' }}
    />
    <BusinessTab.Screen
      name="BusinessMessages"
      component={ConversationsScreen}
      options={{ tabBarLabel: 'Inbox' }}
    />
    <BusinessTab.Screen
      name="BusinessProfile"
      component={BusinessProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </BusinessTab.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { session, profile, currentRole, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentCyan} />
      </View>
    );
  }

  const initialRouteName = !session
    ? 'Auth'
    : profile && !profile.onboarding_completed
    ? 'Onboarding'
    : currentRole === 'business'
    ? 'BusinessApp'
    : 'CustomerApp';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      {!session ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          {/* Main App Portals */}
          <Stack.Screen name="CustomerApp" component={CustomerTabNavigator} />
          <Stack.Screen name="BusinessApp" component={BusinessTabNavigator} />

          {/* Onboarding if incomplete */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          {/* Customer Stack Routes */}
          <Stack.Screen
            name="CustomerOrders"
            component={CustomerOrdersScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="CustomerOverview"
            component={CustomerOverviewScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="CartCheckout"
            component={CartCheckoutScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="CustomerSettings"
            component={CustomerSettingsScreen}
            options={{ presentation: 'card' }}
          />

          {/* Business Stack Routes */}
          <Stack.Screen
            name="BusinessOrders"
            component={BusinessOrdersScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="BusinessProducts"
            component={BusinessProductsScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="AddEditProduct"
            component={AddEditProductScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="TikTokBoost"
            component={TikTokBoostScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="BusinessPayments"
            component={BusinessPaymentsScreen}
            options={{ presentation: 'card' }}
          />
          <Stack.Screen
            name="BusinessProfile"
            component={BusinessProfileScreen}
            options={{ presentation: 'card' }}
          />

          {/* Communication Routes */}
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            options={{ presentation: 'card' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
