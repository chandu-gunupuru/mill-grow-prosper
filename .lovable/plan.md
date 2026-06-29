# User Profile System

A polished profile avatar in the navbar, an animated dropdown with all account shortcuts, and a full `/profile` page backed by Lovable Cloud.

## 1. Navbar Profile Avatar (replaces Login button)

Location: `src/routes/index.tsx` header (and reused on other pages via a new component).

New component: `src/components/UserMenu.tsx`
- Circular avatar (Google `avatar_url` from `user.user_metadata.avatar_url` → fallback initials from `full_name` / email).
- Small green online dot (bottom-right of avatar).
- Name + chevron beside avatar on `md+`, avatar-only on mobile.
- Click opens an animated dropdown (Radix `DropdownMenu` + `motion/react` scale/fade).
- Sections inside dropdown:
  - Header card: avatar, full name, verified email (with check icon if `email_confirmed_at`).
  - Account: My Profile, My Orders, Wishlist, Cart, Saved Addresses, Payment Methods.
  - Preferences: Notifications, Offers & Coupons, Reviews & Ratings, Account Settings, Privacy & Security, Language, Dark/Light toggle (inline switch).
  - Support: Help & Support, Contact Us.
  - Logout (destructive style).
- Each row is a `<Link>` to its existing route or to a new placeholder route. Keyboard accessible (Radix handles arrow keys, Esc, focus ring).

Replace the current "Login" / account `Sheet` in `src/routes/index.tsx` with `<UserMenu />` when signed in; show existing Login button when signed out.

## 2. My Profile Page (`/_authenticated/profile`)

New file: `src/routes/_authenticated/profile.tsx` — tabbed layout with glassmorphism cards.

Tabs (using `Tabs` from shadcn):

1. **Personal Information** — avatar uploader (Supabase `avatars` bucket), full name, email (read-only), phone, date joined, Customer ID (`user.id` short hash). Save via `updateMyProfile` server fn.
2. **Address Book** — list of saved addresses with add / edit / delete / set-default. New table `user_addresses`.
3. **Account Settings** — Edit profile (link to tab 1), Change password (Supabase `updateUser`), Link/Unlink Google (show provider list from `user.identities`), Delete account (confirm dialog → server fn → `auth.admin.deleteUser`), Manage login sessions (list + revoke).
4. **Order Summary** — totals derived from existing `listMyShopifyOrders`. Reuses `SummaryCards` pattern.
5. **Saved Items** — Wishlist (new table) + Recently Viewed (localStorage).
6. **Security** — Two-factor (Supabase MFA enroll/unenroll), Login Activity, Devices, Logout-from-all.

## 3. Backend

New Supabase tables (via migration) with RLS + GRANTS:

- `user_addresses` — id, user_id, label, name, phone, line1, line2, city, state, postal_code, country, is_default, timestamps.
- `wishlist_items` — id, user_id, product_id, product_handle, title, image_url, price, currency, added_at.

Reuses existing `profiles` table for name / avatar / phone (add `phone` column if missing).

New server functions in `src/lib/profile.functions.ts`:
- `getMyProfile` — profile row + provider list + order summary.
- `updateMyProfile({ full_name, phone, avatar_url })`.
- `listMyAddresses`, `upsertMyAddress`, `deleteMyAddress`, `setDefaultAddress`.
- `listMyWishlist`, `addToWishlist`, `removeFromWishlist`.
- `listMySessions`, `revokeSession`, `signOutAllDevices`.
- `deleteMyAccount` (admin client, scoped to caller).

All use `requireSupabaseAuth`; `deleteMyAccount` loads `supabaseAdmin` inside the handler.

## 4. UX polish

- Loading skeletons on every tab.
- `motion/react` page enter, list-item stagger, dropdown spring.
- Empty states with friendly copy + CTA.
- Toast feedback (`sonner`) on save / delete.
- Fully responsive: tabs become a vertical accordion < `md`.
- Semantic tokens only (no hardcoded colors).

## Files touched

```text
src/components/UserMenu.tsx                 (new)
src/components/profile/AvatarUploader.tsx   (new)
src/components/profile/AddressForm.tsx      (new)
src/routes/_authenticated/profile.tsx       (new)
src/routes/index.tsx                        (swap login UI for UserMenu)
src/lib/profile.functions.ts                (new)
supabase migration                          (user_addresses, wishlist_items, profiles.phone)
```

## Out of scope (placeholders linking to existing/empty routes)

Wishlist page, Payment Methods, Offers & Coupons, Reviews list, Notifications settings page — dropdown links route to stubs that can be expanded later. Orders, Help, Settings reuse existing routes.

Approve to proceed, or tell me which sections to drop / expand.