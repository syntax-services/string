# Theme Migration & Feature Implementations

This document outlines the implementation plan to migrate the platform theme, enhance the offers system, build a robust referral system, restructure the authentication flow, and fix mobile navigation issues.

## User Review Required

> [!IMPORTANT]
> The theme change will touch global CSS variables. The new primary color will be a modern, clean Blue (e.g., Tailwind's `blue-600` for light mode and a suitable shade for dark mode). Please confirm if you have a specific hex code for the blue color or if a standard clean marketplace blue is acceptable.

> [!IMPORTANT]
> For the **2 Levels of Verification**, I plan to implement it as follows:
> - **Level 1**: Email Verification (already exists via Supabase Auth).
> - **Level 2**: Profile Completion & Phone Verification (or ID Verification if required).
> Please confirm if this matches your expectation for the 2 levels.

## Proposed Changes

### 1. Theme Migration (Blue Palette)
Update global CSS tokens to shift the monochrome aesthetic to a clean blue marketplace standard.

#### [MODIFY] src/index.css
- Update `--primary` and `--primary-foreground` to a clean blue.
- Adjust `--ring` and active states to match the blue theme.
- Ensure dark mode variables (`.dark`) map correctly to a legible dark blue palette.

---

### 2. Offers System Enhancements
The `CreateOfferPanel` already supports products, services, employment, and collaborations with images and videos. We will add the required trust and communication features.

#### [NEW] supabase/migrations/[timestamp]_enhance_offers.sql
- Add `phone_number` and `allow_calls` columns to the `offers` table.
- Add `verification_level` to the `profiles` table to track trust scores.

#### [MODIFY] src/components/offers/CreateOfferPanel.tsx
- Add a UI check: Only allow users with Verification Level 2 to create offers.
- Add an "Allow Calls" toggle and a phone number input field to the form.
- Pass these new fields to the `createOffer` mutation.

---

### 3. Referral System
Implement a comprehensive referral points system with backend validation and admin analytics.

#### [NEW] supabase/migrations/[timestamp]_referral_system.sql
- Create `referral_codes` table (maps `user_id` to a unique `code`).
- Create `referrals` table (`referrer_id`, `referred_id`, `points_awarded`, `status`).
- Create `user_points` table to track total points.
- Create an RPC function `process_referral` to securely award points when a referred user signs up or completes onboarding.

#### [MODIFY] src/pages/admin/AdminDashboard.tsx
- Update the statistics query to fetch total referrals and points distributed.
- Add a new "Referrals" card to the dashboard overview.

---

### 4. Auth & Onboarding Restructuring
Make the Signup and Login pages distinct to prevent user confusion, moving basic fields from Onboarding to the initial Auth step.

#### [MODIFY] src/pages/Auth.tsx
- Expand the Signup form to include `Full Name` and `Phone Number` inputs.
- Pass these fields securely to Supabase during the `signUp` call (using `user_metadata`).

#### [MODIFY] src/pages/Onboarding.tsx
- Remove "Step 1: Basic Info" (Full Name and Phone) from the onboarding flow.
- The onboarding will now immediately start at selecting the "User Type" (Customer vs. Business).

---

### 5. Mobile Navigation Fix
Prevent UI glitches on mobile devices by removing the "Sign in" button and only showing "Get Started".

#### [MODIFY] src/pages/Landing.tsx
- Add responsive Tailwind classes (`hidden md:inline-flex`) to the "Sign in" button in the top navigation header.
- Ensure the "Get Started" button remains visible and perfectly aligned on small screens.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no TypeScript or Vite build errors occur after refactoring Auth and Onboarding interfaces.

### Manual Verification
1. **Theme Check**: Toggle between light and dark modes to ensure the blue theme looks clean and accessible on all components.
2. **Auth Flow**: Sign up a new user, verifying that Name and Phone are captured upfront, and Onboarding skips Step 1.
3. **Referrals**: Generate a referral code, sign up a secondary account with it, and verify points are awarded in the Supabase DB and visible in the Admin Dashboard.
4. **Offers**: Attempt to create an offer. Verify the "Allow Calls" option works and the 2-level verification check is enforced.
5. **Mobile View**: Inspect the Landing page on a simulated mobile device to ensure the "Sign in" button is hidden and the logo no longer glitches.
