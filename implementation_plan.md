# Squad Wallet, BVN/NIN Verification, and Anti-Money Laundering (AML) Plan

This document outlines the design and implementation steps for a multi-sided compliance and GTCO Squad payment system. 

---

## 🛠️ Proposed Changes

### 1. Database & Schema Enhancements

We will create a new database migration file `supabase/migrations/20260701010000_squad_aml_verification.sql` to add:
*   **Verification Level**: Add `verification_level` (1 = email verified, 2 = NIN/BVN verified) to the `profiles` table.
*   **Verification Data**: Add encrypted `nin_hash` and `bvn_hash` columns (using cryptographically secure hashing) to `profiles` to preserve user privacy.
*   **Squad Account Data**: Add `squad_subaccount_id` and `squad_virtual_account` fields to `profiles` for GTCO Squad sub-account mappings.
*   **Wallet Balances**: Add `wallet_balance` NUMERIC(12,2) to `profiles` representing deposit balances.
*   **AML Engine Columns**: Add columns to track transaction velocities:
    *   `total_funded` NUMERIC(12,2)
    *   `total_spent` NUMERIC(12,2)
    *   `last_withdrawn_at` TIMESTAMPTZ
    *   `aml_flagged` BOOLEAN DEFAULT false
*   **Updated RPCs**: Redefine `get_customer_conversations` and `get_business_conversations` to return the verification statuses (`verified` for businesses, and `verification_level` for customers).

---

### 2. NIN/BVN Verification UI & Blocks

*   **Shopper Profile Verification Panel**:
    *   Add a **"Verify Account (NIN/BVN)"** form in [CustomerProfile.tsx](file:///C:/Users/Administrator/Documents/string/src/pages/customer/CustomerProfile.tsx) and [CustomerSettings.tsx](file:///C:/Users/Administrator/Documents/string/src/pages/customer/CustomerSettings.tsx).
    *   When a user inputs a valid 11-digit NIN or 11-digit BVN, it mocks/validates with the verification API, updates their profile status to `verification_level = 2`, and awards them a verified checkmark.
*   **Checkout Verification Blocks**:
    *   Add validation check in [Checkout.tsx](file:///C:/Users/Administrator/Documents/string/src/pages/customer/Checkout.tsx): Before placing a `"delivery"` order, the customer must have completed NIN/BVN verification (`verification_level >= 2`). Toggles an alert banner redirecting them to their profile to verify if unverified.
*   **Unverified User Badges**:
    *   **Customer Chat List**: In [CustomerMessages.tsx](file:///C:/Users/Administrator/Documents/string/src/pages/customer/CustomerMessages.tsx), if the merchant is not verified (`selectedConversation.verified === false`), render an `"Unverified Business"` red badge next to their header and sidebar list items.
    *   **Merchant Chat List**: In [BusinessMessages.tsx](file:///C:/Users/Administrator/Documents/string/src/pages/business/BusinessMessages.tsx), if the customer has `verification_level < 2`, display an `"Unverified Customer"` gray badge.

---

### 3. Squad (HabariPay) Payment Sub-accounts & Payouts

We will transition the backend gateway from Paystack to GTCO Squad:
*   **Squad Sub-account Creation**:
    *   When a new profile is fetched in `AuthContext.tsx` or a user signs up, if they do not have a `squad_subaccount_id`, create a sub-account by calling the Squad Subaccount API.
*   **Squad Deposit & Withdrawal Integration**:
    *   **Initialize Payment**: Rewrite [initialize-payment](file:///C:/Users/Administrator/Documents/string/supabase/functions/initialize-payment/index.ts) to hit Squad's Initiate Transaction endpoint: `https://api-d.squadco.com/transaction/initiate`.
    *   **Withdraw Payouts**: Rewrite [paystack-payout](file:///C:/Users/Administrator/Documents/string/supabase/functions/paystack-payout/index.ts) to rename/use Squad's transfer and payout endpoints.
    *   **Squad Webhook Handler**: Create [squad-webhook](file:///C:/Users/Administrator/Documents/string/supabase/functions/squad-webhook/index.ts) (which verifies Squad's webhook payload using HMAC SHA-512 signature `x-squad-signature`), promoting paid orders and adding funded amounts to user balances.

---

### 4. Smart Anti-Money Laundering (AML) System

To prevent illicit funds wash trading, the system will apply strict transaction monitoring:
*   **Deposit-to-Spent Ratio (70% Rule)**:
    *   Runners/shoppers requesting payouts must have purchased items (represented by `total_spent`) worth at least **70%** of their total funded balance (`total_funded`).
    *   If a user funds their account and immediately requests a cash-out without matching order invoices, the transaction is blocked and the profile gets flagged as `aml_flagged = true`.
*   **High Value Limit Limits**:
    *   Single transactions above ₦50,000 are rejected if the user is unverified (`verification_level < 2`).
*   **Cooling Period**:
    *   A mandatory 24-hour lockup is enforced between account funding and withdrawal requests.

---

## 🧪 Verification Plan

### Automated Checks
*   Run the TypeScript compiler to ensure type-safety:
    ```bash
    npx tsc --noEmit
    ```

### Manual Checkout Verification
1.  **Checkout Block**: Try placing a delivery order as an unverified shopper. Confirm checkout displays the block warning.
2.  **Verify NIN/BVN**: Submit an identity document. Verify the profile upgrades to Level 2.
3.  **Checkout Success**: Try checkout again. Verify it succeeds.
4.  **AML Velocity Flag**: Try funding ₦10,000 and immediately requesting a cash-out. Confirm the AML block flags the transaction.
5.  **Messages Badges**: Verify unverified badges render correctly in chat conversations.
