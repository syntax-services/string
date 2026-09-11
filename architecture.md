# System Architecture & Design Decisions

## 1. System Overview
**String** is a campus marketplace platform operating an escrow and service-matching ecosystem across student merchants and customers.

## 2. Directory & Component Architecture
```text
src/
├── components/
│   ├── admin/tabs/          # Modular tab panels for StringAdmin operations
│   ├── atoms/               # Pure, stateless atoms (e.g., TikTokIcon)
│   ├── business/
│   │   ├── growth/          # TikTokBoostHub and merchant reach automation
│   │   └── settings/        # Modular merchant profile & wallet settings
│   ├── checkout/            # Delivery matrix, order summaries, dynamic virtual account modal
│   ├── customer/profile/    # Customer profile, wallet, and identity verification sections
│   ├── location/            # Structured campus location pickers and landmark components
│   ├── messages/            # Chat bubbles, conversation lists, voice note audio player
│   └── ui/                  # Shadcn UI primitive design components
├── contexts/                # AuthContext & global providers
├── hooks/                   # Custom business logic hooks (useCart, useSmartMatching, etc.)
├── integrations/supabase/   # Typed Supabase client and schema bindings
├── lib/                     # Image optimizer, distance estimators, audio signals, utilities
├── pages/                   # Route-level views (admin, business, customer, public)
└── types/                   # Centralized TypeScript domain interfaces
```

## 3. TikTok Social Commerce & Auto-Boost Architecture
- **Purpose**: Enables campus merchants to link their TikTok business profiles and automatically feature newly listed goods in video clips with embedded direct store backlinks (`https://www.string.com.ng/product/<id>`).
- **OAuth 2.0 Flow**:
  - Scopes: `user.info.basic`, `video.upload`, `video.publish`.
  - Frontend triggers TikTok authorization with `state=${businessId}` and `redirect_uri=https://www.string.com.ng/callback`.
  - Supabase Edge Function `tiktok-oauth-exchange` performs server-to-server token exchange with client secret safeguarding.
- **Database Schema**:
  - `public.business_tiktok_connections`: Stores encrypted tokens, expiry timestamps, auto-boost preferences, cadence settings, and aggregate view/like counters.
  - `public.tiktok_product_promotions`: Logs published video campaigns with product references, video URLs, backlink URLs, and engagement analytics.
  - Security Definer RPCs: `connect_or_update_business_tiktok` and `disconnect_business_tiktok` enforce caller ownership (`user_id = auth.uid() OR owner_id = auth.uid()`).
- **UI System**:
  - Deep Monochrome (`#0A0A0A`) with Liquid Glass surface (`backdrop-blur-xl`, `border-white/10`).
  - Tactile states, animated status pills, performance bento grid, and campaign tables.

## 4. Mobile Application Architecture (Expo Go / React Native)
```text
mobile/
├── assets/                  # App icons, splash screens, adaptive icons
├── src/
│   ├── components/
│   │   └── navigation/      # PinterestTabBar (floating capsule dock), AppHeader (logo-free)
│   ├── contexts/            # AuthContext (dual-role switcher), CartContext (local persistent bag)
│   ├── lib/
│   │   ├── security/        # keyVault.ts (split-entropy XOR obfuscation, anti-reverse engineering)
│   │   └── supabase.ts      # Secure Store adapted Supabase client
│   ├── navigation/          # RootNavigator (Auth Stack, Customer Tab Bar, Business Tab Bar, Modals)
│   ├── screens/
│   │   ├── auth/            # Welcome, Login, SignUp, ForgotPassword, Onboarding
│   │   ├── customer/        # Discover, Search, ProductDetail, CartCheckout, Orders, Profile, Settings
│   │   ├── business/        # Overview, Products, AddEditProduct, Orders, TikTokBoost, Payments, Profile
│   │   └── messages/        # Conversations, ChatDetail
│   ├── theme/               # colors.ts (Deep Monochrome, Electric pops, Glass borders)
│   └── types/               # index.ts (centralized TypeScript interfaces)
├── App.tsx                  # Root providers (SafeArea, ReactQuery, Auth, Cart, NavigationContainer)
├── app.json                 # Expo SDK 52 configuration, dark mode, deep link schemes
├── babel.config.js          # Babel preset expo
├── index.js                 # registerRootComponent entry
└── tsconfig.json            # Strict TypeScript configuration
```

### 4.1. "Keys for Keys" Reverse-Engineering Protection
- **Objective**: Prevent malicious attackers from decompiling the Expo mobile bundle (`strings`, `apktool`, or binary inspection) and extracting plaintext database credentials.
- **Client Vault (`mobile/src/lib/security/keyVault.ts`)**:
  - Raw strings are eliminated from static source files.
  - Intermediate byte vectors and dynamic XOR mask (`0x5A`) reconstruct credentials in-memory at execution time.
  - Provides tamper-resistant device handshake headers (`x-string-app-id`, timestamp, random nonce).
- **Server Edge Broker (`supabase/functions/mobile-key-broker`)**:
  - Deployed to remote Supabase infrastructure (`kxynwcuhgawnhqoexpti`).
  - Validates client handshake identity and issues rotated transient access configuration.

### 4.2. Pinterest-Style Floating Bottom Dock (`PinterestTabBar`)
- Floating elevated capsule bar (`backgroundColor: #0A0A0A`, `borderRadius: 40`, `borderWidth: 1`, `borderColor: rgba(255,255,255,0.08)`).
- Bold tactile icons (`strokeWidth: 2.8` on active, `2.2` on inactive) with haptic feedback (`Haptics.impactAsync`).
- Glowing active dot indicators and scale transformations (`scale: 1.08`).
- Role-aware: renders Customer tabs (Discover, Search, Messages, Orders, Profile) or Business tabs (Overview, Goods, Orders, Messages, Growth) dynamically.

### 4.3. Logo-Free Distraction-Free Header (`AppHeader`)
- Strictly adheres to user directive: no String logo clutter on top navigation.
- Focuses purely on utility: Campus location landmark pill, contextual screen title/subtitle, live cart badge trigger, and back navigation.

## 5. Security & Transaction Integrity
- **Escrow Settlement**: Squad GTCO payment gateway integration with dynamic virtual accounts and card payments.
- **Identity Hardening**: Level 2 Didit verification (NIN/BVN) required for delivery orders and bank payouts.
- **Database Safety**: Parameterized queries and PostgreSQL RPCs (`pay_with_wallet`, keep-alive cron) for financial integrity.
- **Zero-Bug Verification**: Automated TypeScript validation (`tsc --noEmit`) and build verification.

