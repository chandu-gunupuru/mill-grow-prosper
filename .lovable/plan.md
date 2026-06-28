## My Orders page — implementation plan

### Route & access
- New route: `src/routes/_authenticated/orders.tsx` at `/orders` (auth-gated; existing `/admin/orders` stays for admins).
- Header "Orders" link in `src/routes/index.tsx` will point to `/orders` for non-admins.

### Data source
Orders live in Shopify. I will add a customer-scoped server function:

- `listMyShopifyOrders` in `src/lib/orders.functions.ts`
  - `.middleware([requireSupabaseAuth])`
  - Reads `context.claims.email`; if missing, returns `{ orders: [] }`.
  - Calls Shopify Admin REST: `GET /orders.json?status=any&email=<user_email>&limit=50` with `SHOPIFY_ACCESS_TOKEN`.
  - Maps to a typed DTO with: id, name, createdAt, financialStatus, fulfillmentStatus, cancelledAt, totalPrice, currency, paymentGatewayNames, shippingAddress, billingAddress, lineItems (title, variantTitle, quantity, price, imageUrl via product image lookup omitted — uses `line_items[].image` when present, otherwise a placeholder), trackingNumbers, trackingCompany, trackingUrls, estimatedDeliveryAt (from `fulfillments[].estimated_delivery_at` when available), taxLines, subtotal, totalTax, totalShipping, noteAttributes, note.
  - Returns plain DTOs only.

- `getMyShopifyOrder(orderId)` for the details view (same auth + email match to prevent IDOR).

### UI components (new, under `src/components/orders/`)
- `OrderSummaryCards.tsx` — 6 stat cards (Total, Active, Pending, Delivered, Cancelled, Total Spent), responsive grid, animated count-up.
- `OrderFiltersBar.tsx` — search input (id/product), status chips (All/Pending/Processing/Shipped/Delivered/Cancelled), sort select (Newest/Oldest/Highest/Lowest).
- `OrderCard.tsx` — rounded card with product thumbnail, title/variant, qty/price, payment + order status badges, ETA, action buttons.
- `OrderStatusTimeline.tsx` — 7-step horizontal (desktop) / vertical (mobile) tracker. Step state derived from `financial_status`, `fulfillment_status`, `fulfillments[].shipment_status`, `cancelled_at`.
- `OrderDetailsSheet.tsx` — slide-in `Sheet` with full breakdown (customer, addresses, payment, price breakdown, GST from `tax_lines`, notes, tracking).
- `OrdersEmptyState.tsx` — illustration + "Shop Now" CTA → `/#products`.
- `OrderSkeleton.tsx` — skeleton loaders.

### Status derivation (single source of truth)
Helper `deriveOrderStatus(order)` in `src/lib/orders.ts` returns one of `pending | processing | packed | shipped | out_for_delivery | delivered | cancelled` based on Shopify fields. Used by filter chips, summary counts, and timeline.

### Actions wired
- View Details → opens `OrderDetailsSheet`.
- Track Order → opens `trackingUrls[0]` in new tab (disabled when none).
- Download Invoice → client-side PDF via lightweight `jspdf` (added with `bun add jspdf`); renders order summary with brand header.
- Reorder → adds each line item back into the Shopify cart via existing cart store, then opens the cart sheet.
- Cancel Order → only visible when `fulfillment_status` is null/unfulfilled and not cancelled; calls a new `cancelMyShopifyOrder` server fn (Shopify `POST /orders/{id}/cancel.json`, re-verifies email ownership server-side).
- Request Return/Refund → only when delivered; opens prefilled Help Center form (`/help?topic=Return%20%2F%20Refund&orderId=...`).
- Contact Support → links to `/help`.

### Loading / errors
- `useQuery` with skeleton state for first load.
- Error component with friendly copy + Retry (`router.invalidate()` + `refetch`).
- Empty state when zero orders.

### Pagination
- Initial 50 orders. "Load more" button calls server fn with `page_info` cursor (Shopify link header), appended via `useInfiniteQuery`. Implementation kept simple: cursor passed through DTO.

### Performance / a11y
- Cards use `motion/react` with `prefers-reduced-motion` respected.
- Status badges use existing semantic theme tokens — no hardcoded colors.
- Mobile-first grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for summary; order list is single column for readability.

### Known mapping caveats (Shopify limits)
- "Rice Variety" → uses Shopify variant title.
- "Delivery Partner" → uses `fulfillments[].tracking_company` when present, else "—".
- "Estimated Delivery" → `fulfillments[].estimated_delivery_at`, else computed `createdAt + 5 days` as a soft fallback (clearly labelled "Estimated").
- "GST details" → derived from `tax_lines` (rate + amount). If none, the GST block is hidden rather than faked.

### Files to create
- `src/lib/orders.functions.ts`
- `src/lib/orders.ts` (status helpers, formatters)
- `src/components/orders/{OrderSummaryCards,OrderFiltersBar,OrderCard,OrderStatusTimeline,OrderDetailsSheet,OrdersEmptyState,OrderSkeleton}.tsx`
- `src/routes/_authenticated/orders.tsx`

### Files to edit
- `src/routes/index.tsx` — add "My Orders" link in account menu pointing to `/orders`.
- `package.json` — add `jspdf`.

No DB schema changes. No new secrets. Uses existing `SHOPIFY_ACCESS_TOKEN`.
