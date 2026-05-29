# Farm Marketplace — Modular Build Plan

> A direct farm-to-consumer web app connecting Nigerian farmers directly to buyers.
> Eliminates middlemen. Provides real-time pricing, stock visibility, and delivery coordination.

---

## How to use this document

Each phase is self-contained and shippable. Build, test, and deploy each phase before starting the next. Every module lists its components, features, and the data models it introduces. Later phases depend on earlier ones — do not skip ahead.

---

## Tech stack recommendation

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast dev, component-based, PWA support |
| Styling | Tailwind CSS | Rapid UI, responsive by default |
| Backend | Node.js + Express | JavaScript throughout, easy REST API |
| Database | PostgreSQL | Relational data, good for price/stock queries |
| ORM | Prisma | Type-safe DB access, easy migrations |
| Auth | JWT + bcrypt | Stateless, works well for mobile/web |
| Payments | Paystack | Nigerian-first, supports escrow-style holds |
| File Storage | Cloudinary | Farm/product photo uploads |
| Maps | Google Maps API | Delivery zone setup, farm GPS pinning |
| Hosting | Render / Railway | Free tier for school project, easy deploys |
| Version Control | Git + GitHub | Required for modular, team-friendly builds |

---

## Phase overview

| Phase | Name | Delivers |
|---|---|---|
| 1 | Foundation | Project setup, auth, user roles |
| 2 | Farmer module | Listings, stock, pricing, farm profile |
| 3 | Consumer module | Browse, search, filter, product pages |
| 4 | Orders & payments | Cart, orders, Paystack escrow, receipts |
| 5 | Delivery & logistics | Zones, tracking, cold chain flags |
| 6 | Price intelligence | Price history, market averages, scarcity |
| 7 | Trust & safety | Ratings, disputes, KYC, admin panel |
| 8 | Notifications | Push, email, in-app alerts |
| 9 | Subscriptions | Recurring orders, pre-orders |
| 10 | PWA & performance | Offline mode, low-data, USSD stub |

---

---

# Phase 1 — Foundation

> Goal: Working app skeleton with authentication, role routing, and database connected.
> Deliverable: Users can register, log in, and reach a role-specific dashboard.

## 1.1 Project setup

- [ ] Initialise Git repository with `main` and `dev` branches
- [ ] Scaffold frontend with `npm create vite@latest` (React + JS)
- [ ] Scaffold backend with `npm init`, install Express, Prisma, cors, dotenv
- [ ] Set up `.env` files for both frontend and backend (never commit these)
- [ ] Configure Tailwind CSS in the frontend
- [ ] Set up PostgreSQL database (local via Docker or hosted on Railway)
- [ ] Run `prisma init` and connect to the database

## 1.2 Database — initial schema

```prisma
model User {
  id          String   @id @default(uuid())
  phone       String   @unique
  email       String?  @unique
  passwordHash String
  role        Role     @default(CONSUMER)
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  farmer      Farmer?
  consumer    Consumer?
}

enum Role {
  FARMER
  CONSUMER
  ADMIN
}

model Farmer {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  farmName    String
  farmAddress String
  latitude    Float?
  longitude   Float?
  kycStatus   KycStatus @default(PENDING)
  kycDocUrl   String?
  bio         String?
  createdAt   DateTime @default(now())
}

model Consumer {
  id        String  @id @default(uuid())
  userId    String  @unique
  user      User    @relation(fields: [userId], references: [id])
  address   String?
  latitude  Float?
  longitude Float?
}

enum KycStatus {
  PENDING
  SUBMITTED
  VERIFIED
  REJECTED
}
```

## 1.3 Backend — auth module (`/api/auth`)

| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Create user, hash password, assign role |
| `/auth/login` | POST | Validate credentials, return JWT |
| `/auth/me` | GET | Return current user from token |
| `/auth/logout` | POST | Invalidate token (client-side clear) |

- Middleware: `authenticateToken` — validates JWT on protected routes
- Middleware: `requireRole(role)` — checks user role before route handler

## 1.4 Frontend — auth pages

- `/register` — form with: name, phone, email, password, role selector (Farmer / Consumer)
- `/login` — phone/email + password form
- `AuthContext` — React context storing user state, token, login/logout functions
- `ProtectedRoute` — wrapper component that redirects unauthenticated users
- `RoleRoute` — redirects to correct dashboard based on role

## 1.5 Dashboards (empty shells)

- `/farmer/dashboard` — placeholder with farmer nav
- `/consumer/dashboard` — placeholder with consumer nav
- `/admin/dashboard` — placeholder (admin only)

## 1.6 Shared components (build these once, reuse everywhere)

- `Navbar` — role-aware top navigation
- `Button` — primary, secondary, danger variants
- `Input` — text, password, phone, number variants
- `Select` — dropdown component
- `Modal` — reusable overlay dialog
- `LoadingSpinner` — full-page and inline variants
- `ErrorMessage` — standardised error display
- `Toast` — success/error notification pop-up

## Phase 1 done when:
- A farmer and a consumer can register with different roles
- Both can log in and reach their respective dashboards
- JWT is stored and sent on every protected request
- Invalid credentials show clear error messages

---

---

# Phase 2 — Farmer module

> Goal: Farmers can build a complete farm profile and create product listings with units, stock, and pricing.
> Deliverable: A farmer's listings are saved to the database and retrievable via API.

## 2.1 Database — farmer listings schema

```prisma
model Product {
  id              String    @id @default(uuid())
  farmerId        String
  farmer          Farmer    @relation(fields: [farmerId], references: [id])
  name            String
  description     String?
  category        Category
  unit            Unit
  pricePerUnit    Float
  bulkPricing     Json?     // [{minQty: 10, price: 450}, {minQty: 50, price: 400}]
  stockQty        Float
  minOrderQty     Float     @default(1)
  harvestDate     DateTime?
  nextHarvestDate DateTime?
  isAvailable     Boolean   @default(true)
  isColdChain     Boolean   @default(false)
  photos          String[]  // Cloudinary URLs
  qualityGrade    Grade     @default(STANDARD)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  deliveryZones   DeliveryZone[]
  priceHistory    PriceHistory[]
  orderItems      OrderItem[]
}

enum Category {
  VEGETABLES
  FRUITS
  GRAINS
  TUBERS
  LIVESTOCK
  DAIRY
  POULTRY
  SEAFOOD
  HERBS
  OTHER
}

enum Unit {
  KG
  GRAM
  CRATE
  BAG
  BUNCH
  BASKET
  LITRE
  PIECE
  MUDU
  PAINT
}

enum Grade {
  PREMIUM
  STANDARD
  BUDGET
}
```

## 2.2 Backend — farmer product routes (`/api/farmer`)

| Endpoint | Method | Description |
|---|---|---|
| `/farmer/profile` | GET | Fetch farmer's own profile |
| `/farmer/profile` | PUT | Update farm name, address, GPS, bio |
| `/farmer/products` | GET | List all of farmer's products |
| `/farmer/products` | POST | Create new product listing |
| `/farmer/products/:id` | GET | Get single product |
| `/farmer/products/:id` | PUT | Edit product details |
| `/farmer/products/:id` | DELETE | Remove listing |
| `/farmer/products/:id/toggle` | PATCH | Toggle available/unavailable |

All routes protected by `authenticateToken` + `requireRole('FARMER')`.

## 2.3 Frontend — farmer pages

### Farm profile page (`/farmer/profile`)
- Edit farm name, address, bio
- GPS pin (Google Maps widget — click to place pin)
- Upload farm photo (Cloudinary)
- KYC status indicator (Pending / Submitted / Verified)
- KYC document upload form

### Product listing form (`/farmer/products/new` and `/farmer/products/:id/edit`)
- Product name
- Category selector (dropdown from enum)
- Description textarea
- Unit selector (kg, crate, bag, mudu, etc.)
- Price per unit (number input with ₦ prefix)
- Bulk pricing table — add rows for quantity tiers
- Stock quantity
- Minimum order quantity
- Harvest date (date picker)
- Next expected harvest date
- Quality grade selector (Premium / Standard / Budget)
- Cold chain checkbox (does farmer have refrigerated delivery?)
- Photo upload (up to 5 images, Cloudinary)

### Products list page (`/farmer/products`)
- Table/card view of all listings
- Quick toggle: available / unavailable
- Edit and delete actions
- Stock level indicator (green / amber / red)
- Low stock warning when qty < 10% of typical batch

### Farmer dashboard (`/farmer/dashboard`)
- Summary cards: total listings, active orders, this week's revenue
- Recent orders table (first 5)
- Low stock alerts

## 2.4 Shared utility — image upload

- `useImageUpload` hook — handles Cloudinary direct upload
- Accepts multiple files, shows preview, returns URL array
- Max file size: 2MB per image

## Phase 2 done when:
- Farmer can create, edit, delete, and toggle product listings
- All product fields (price, unit, stock, harvest date, bulk pricing) save correctly
- Photos upload to Cloudinary and display on the listing
- KYC document can be uploaded (admin review comes in Phase 7)

---

---

# Phase 3 — Consumer module

> Goal: Consumers can browse, search, filter, and view detailed product listings from all farmers.
> Deliverable: A working product discovery experience with filtering and farm profiles.

## 3.1 Backend — public product routes (`/api/products`)

| Endpoint | Method | Description |
|---|---|---|
| `/products` | GET | List all available products (with filters) |
| `/products/:id` | GET | Single product detail + farm info |
| `/products/categories` | GET | List all categories |
| `/farms` | GET | List all verified farms |
| `/farms/:id` | GET | Farm profile + all active listings |

### Query parameters for `GET /products`
- `category` — filter by category
- `search` — keyword search on name/description
- `minPrice` / `maxPrice` — price range filter
- `unit` — filter by unit type
- `inStock` — boolean, only show available items
- `grade` — quality grade filter
- `farmerId` — show only one farm's products
- `lat` / `lng` / `radius` — proximity filter (km)
- `sortBy` — price_asc, price_desc, newest, rating
- `page` / `limit` — pagination

## 3.2 Frontend — consumer pages

### Product browse page (`/browse`)
- Grid of product cards (responsive: 2 cols mobile, 3–4 cols desktop)
- Sidebar filters (category, price range, unit, grade, in-stock only)
- Sort dropdown
- Search bar with debounced input
- Pagination or infinite scroll
- "Available near me" button — triggers geolocation + radius filter

### Product card component
- Primary photo (with fallback placeholder)
- Product name + farm name
- Price per unit (₦ + unit label)
- Quality grade badge (Premium / Standard / Budget)
- Stock indicator (In stock / Low stock / Out of season)
- Market price badge (Below avg / At avg / Above avg) — uses Phase 6 data
- Add to cart button

### Product detail page (`/products/:id`)
- Photo gallery (up to 5 images)
- Full product description
- Price + unit, bulk pricing table
- Quality grade + cold chain badge
- Stock quantity remaining
- Harvest date + next harvest date
- Minimum order quantity note
- Scarcity warning (if flagged)
- "Message farmer" button (Phase 8)
- Add to cart (quantity selector)
- Farm profile card (name, location, rating, verification badge)
- Link to farm's full listing page
- Price history chart (Phase 6)

### Farm profile page (`/farms/:id`)
- Farm banner photo + name
- Verification badge
- Location (town/state — not exact address for privacy)
- Farmer bio
- Star rating + review count
- All active product listings from that farm
- "Follow farm" button (nice to have)

### Consumer dashboard (`/consumer/dashboard`)
- Recent orders (last 5)
- Saved/favourite products
- Active subscriptions (Phase 9)
- Personalised suggestions (based on past orders)

## 3.3 Shared components added this phase

- `ProductCard` — reusable card for browse + search results
- `FilterSidebar` — collapsible on mobile
- `SearchBar` — with debounce hook
- `PhotoGallery` — image carousel for product detail
- `RatingStars` — display-only star rating
- `Badge` — variant: grade, verification, stock status, price comparison
- `PriceDisplay` — formats ₦ with correct unit label

## Phase 3 done when:
- Consumer can browse all available products
- Search and filters work correctly and combine
- Product detail page shows all information
- Farm profile page is accessible
- Pagination works

---

---

# Phase 4 — Orders & payments

> Goal: Consumers can place orders and pay. Farmers receive order notifications. Escrow holds funds until delivery is confirmed.
> Deliverable: End-to-end order flow with Paystack integration.

## 4.1 Database — orders schema

```prisma
model Order {
  id              String      @id @default(uuid())
  consumerId      String
  consumer        Consumer    @relation(fields: [consumerId], references: [id])
  farmerId        String
  farmer          Farmer      @relation(fields: [farmerId], references: [id])
  status          OrderStatus @default(PENDING)
  fulfillmentType FulfillType
  totalAmount     Float
  deliveryCost    Float       @default(0)
  escrowReference String?     // Paystack reference
  escrowStatus    EscrowStatus @default(HELD)
  deliveryAddress String?
  deliveryLat     Float?
  deliveryLng     Float?
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  items           OrderItem[]
  statusHistory   OrderStatusHistory[]
  receipt         Receipt?
  dispute         Dispute?
}

model OrderItem {
  id         String  @id @default(uuid())
  orderId    String
  order      Order   @relation(fields: [orderId], references: [id])
  productId  String
  product    Product @relation(fields: [productId], references: [id])
  quantity   Float
  unitPrice  Float
  unit       Unit
  subtotal   Float
}

model OrderStatusHistory {
  id        String      @id @default(uuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id])
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now())
}

model Receipt {
  id          String   @id @default(uuid())
  orderId     String   @unique
  order       Order    @relation(fields: [orderId], references: [id])
  receiptNo   String   @unique
  issuedAt    DateTime @default(now())
  pdfUrl      String?
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PACKED
  DISPATCHED
  DELIVERED
  CANCELLED
  DISPUTED
}

enum FulfillType {
  DELIVERY
  PICKUP
}

enum EscrowStatus {
  HELD
  RELEASED
  REFUNDED
}
```

## 4.2 Backend — order routes (`/api/orders`)

| Endpoint | Method | Description |
|---|---|---|
| `/orders` | POST | Consumer creates order |
| `/orders` | GET | List orders (consumer sees own; farmer sees theirs) |
| `/orders/:id` | GET | Order detail |
| `/orders/:id/confirm` | PATCH | Farmer confirms order |
| `/orders/:id/decline` | PATCH | Farmer declines order |
| `/orders/:id/pack` | PATCH | Farmer marks as packed |
| `/orders/:id/dispatch` | PATCH | Farmer marks as dispatched |
| `/orders/:id/deliver` | PATCH | Consumer confirms delivery → triggers escrow release |
| `/orders/:id/cancel` | PATCH | Either party cancels (before dispatch) |

### Payment routes (`/api/payments`)

| Endpoint | Method | Description |
|---|---|---|
| `/payments/initiate` | POST | Creates Paystack transaction, returns payment URL |
| `/payments/verify/:ref` | GET | Verifies Paystack callback, marks order as paid |
| `/payments/webhook` | POST | Paystack webhook — backup payment confirmation |

### Paystack escrow logic
1. Consumer places order → backend calls Paystack to initiate charge
2. Consumer pays → Paystack confirms via webhook
3. Funds are "held" (tracked in our DB as `HELD` — not a real Paystack escrow product; simulate with a transfer delay)
4. Consumer confirms delivery → backend triggers Paystack transfer to farmer's subaccount
5. On dispute → funds stay held, admin resolves (Phase 7)

> Note: For the school project, you can simulate escrow in your own DB without needing Paystack's full split payment feature.

## 4.3 Frontend — order & payment pages

### Cart (`/cart`)
- List of items with quantities (editable)
- Per-item subtotal
- Order total + delivery cost
- Fulfillment type selector (Delivery / Pickup)
- Delivery address input (if delivery selected)
- Notes to farmer field
- "Proceed to payment" button

### Checkout / payment page (`/checkout`)
- Order summary (read-only)
- Total breakdown (items + delivery + any fees)
- "Pay with Paystack" button — redirects to Paystack hosted page
- On return: success or failure screen

### Order confirmation page (`/orders/:id/confirmation`)
- Order reference number
- Summary of items ordered
- Estimated delivery window
- Downloadable receipt link

### Order list page (`/orders`)
- Consumer: all their orders with status badges
- Farmer: all incoming orders with accept/decline actions
- Filter by status

### Order detail page (`/orders/:id`)
- Full order breakdown
- Current status with timeline (Placed → Confirmed → Packed → Dispatched → Delivered)
- "Confirm delivery" button (consumer, shown when status = DISPATCHED)
- "Raise dispute" button (Phase 7)
- Receipt download

## 4.4 Cart state management

- `CartContext` — React context for cart items (persisted to localStorage)
- `useCart` hook — add, remove, update quantity, clear cart
- Cart is per-farm (one order = one farmer; consumer must checkout separately per farm)

## Phase 4 done when:
- Consumer can add items to cart, check out, and pay via Paystack
- Farmer receives the order and can accept/decline/update status
- Consumer can confirm delivery
- Escrow status updates correctly at each step
- Receipt is generated and downloadable

---

---

# Phase 5 — Delivery & logistics

> Goal: Each listing has delivery zone configuration. Consumers see accurate delivery cost and estimated time based on their location.
> Deliverable: Dynamic delivery cost calculation and logistics partner integration stub.

## 5.1 Database — delivery schema

```prisma
model DeliveryZone {
  id           String   @id @default(uuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  farmerId     String
  stateName    String
  lgaName      String?
  deliveryCost Float
  estimatedDays Int     @default(1)
  isActive     Boolean  @default(true)
}

model LogisticsPartner {
  id       String @id @default(uuid())
  name     String
  apiKey   String?
  regions  String[]
  isActive Boolean @default(true)
}
```

## 5.2 Backend — delivery routes (`/api/delivery`)

| Endpoint | Method | Description |
|---|---|---|
| `/delivery/zones` | POST | Farmer adds a delivery zone to a product |
| `/delivery/zones/:productId` | GET | List zones for a product |
| `/delivery/zones/:id` | PUT | Update zone cost/days |
| `/delivery/zones/:id` | DELETE | Remove zone |
| `/delivery/calculate` | POST | Given product + consumer location, return cost + ETA |

### Delivery cost logic
```
POST /delivery/calculate
body: { productId, consumerLat, consumerLng }

1. Find matching DeliveryZone for consumer's state/LGA
2. If no zone match → return "not available in your area"
3. Return { cost, estimatedDays, logisticsPartner }
```

## 5.3 Frontend — delivery components

### Delivery zone manager (farmer side, inside product form)
- Add zone button → opens modal
- Select state from Nigerian states dropdown
- Select LGA (optional)
- Enter delivery cost (₦)
- Enter estimated days
- List of current zones with edit/delete

### Delivery cost display (consumer side)
- On product detail page: "Enter your location to see delivery cost"
- On cart: auto-calculated delivery cost per farm
- Estimated delivery window displayed clearly

### Nigerian states + LGA data
- Store as a static JSON file in the frontend
- 36 states + FCT, each with their LGAs
- Used for delivery zone setup and consumer address inputs

## 5.4 Cold chain flag

- Product has `isColdChain: Boolean` — farmer sets this
- If true, show a "Refrigerated delivery" badge on the listing
- On checkout, if a cold chain product is in cart, show a warning: "Ensure you can receive this order promptly"

## Phase 5 done when:
- Farmer can configure delivery zones per product with cost and ETA
- Consumer sees real delivery cost based on their location
- Cart correctly sums delivery costs across items
- Cold chain flag appears on relevant listings

---

---

# Phase 6 — Price intelligence

> Goal: Build the price history, market average, scarcity warning, and seasonal calendar systems.
> Deliverable: Price history charts on product pages, market comparison badges, and scarcity flags.

## 6.1 Database — price intelligence schema

```prisma
model PriceHistory {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  price     Float
  unit      Unit
  recordedAt DateTime @default(now())
}

model MarketAverage {
  id         String   @id @default(uuid())
  productName String
  category   Category
  unit       Unit
  avgPrice   Float
  minPrice   Float
  maxPrice   Float
  sampleSize Int
  region     String?
  computedAt DateTime @default(now())
}

model SeasonalCalendar {
  id          String   @id @default(uuid())
  productName String
  category    Category
  peakMonths  Int[]    // [1,2,3] = Jan, Feb, Mar
  scarcePeriods Json   // [{start: 4, end: 6, reason: "dry season"}]
  region      String?
}
```

## 6.2 Backend — price intelligence routes (`/api/intelligence`)

| Endpoint | Method | Description |
|---|---|---|
| `/intelligence/history/:productId` | GET | Price history for a product (30/90/365 days) |
| `/intelligence/averages` | GET | Market averages by category + region |
| `/intelligence/compare/:productId` | GET | Is this product below/at/above market avg? |
| `/intelligence/seasonal/:category` | GET | Seasonal availability for a category |
| `/intelligence/scarcity` | GET | All products currently flagged as scarce |

### Automated jobs (run via cron or on price update)
- `recordPriceSnapshot` — on every product price update, write to PriceHistory
- `computeMarketAverages` — runs nightly, aggregates PriceHistory into MarketAverage
- `checkScarcity` — runs nightly, flags products where stock < 10% of 30-day avg or season is scarce

## 6.3 Frontend — price intelligence components

### Price history chart (`PriceHistoryChart`)
- Line chart using Recharts or Chart.js
- Toggle: 30 days / 90 days / 1 year
- X-axis: date, Y-axis: ₦ per unit
- Shown on product detail page below the price

### Market comparison badge (`MarketBadge`)
- Three states: "Below market avg", "At market avg", "Above market avg"
- Colour coded: green / gray / amber
- Shown on product card and detail page
- Tooltip on hover: "Avg market price: ₦X per kg"

### Scarcity warning (`ScarcityBanner`)
- Shown on product page when stock is low or season is scarce
- Message: "Low stock — only X kg remaining" or "Out of season until [month]"
- Pre-order prompt if next harvest date is set

### Seasonal availability indicator
- Small calendar icon on product card
- On hover/click: shows which months this product is typically available

## Phase 6 done when:
- Every price update logs a PriceHistory record
- Price history chart renders on product pages
- Market average badges show on product cards
- Scarcity warnings appear when stock is low
- Seasonal calendar data is seeded for common Nigerian crops

---

---

# Phase 7 — Trust & safety

> Goal: KYC verification, ratings and reviews, dispute resolution, and admin panel.
> Deliverable: Admin can verify farmers. Consumers can rate orders. Disputes are logged and resolved.

## 7.1 Database — trust schema

```prisma
model Review {
  id         String   @id @default(uuid())
  orderId    String   @unique
  order      Order    @relation(fields: [orderId], references: [id])
  consumerId String
  farmerId   String
  rating     Int      // 1–5
  comment    String?
  createdAt  DateTime @default(now())
}

model Dispute {
  id          String        @id @default(uuid())
  orderId     String        @unique
  order       Order         @relation(fields: [orderId], references: [id])
  raisedById  String
  reason      String
  evidence    String[]      // Cloudinary URLs (photos)
  status      DisputeStatus @default(OPEN)
  resolution  String?
  resolvedById String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_REFUND
  RESOLVED_RELEASE
  CLOSED
}
```

## 7.2 Backend — trust routes

### Reviews (`/api/reviews`)

| Endpoint | Method | Description |
|---|---|---|
| `/reviews` | POST | Submit review after delivery confirmed |
| `/reviews/farmer/:farmerId` | GET | All reviews for a farmer |
| `/reviews/product/:productId` | GET | Reviews mentioning a product |

### Disputes (`/api/disputes`)

| Endpoint | Method | Description |
|---|---|---|
| `/disputes` | POST | Raise a dispute on an order |
| `/disputes/:id` | GET | Dispute detail |
| `/disputes/:id/evidence` | POST | Add photo evidence |

### Admin routes (`/api/admin`)

| Endpoint | Method | Description |
|---|---|---|
| `/admin/kyc` | GET | List all pending KYC submissions |
| `/admin/kyc/:farmerId/approve` | PATCH | Approve farmer KYC |
| `/admin/kyc/:farmerId/reject` | PATCH | Reject with reason |
| `/admin/disputes` | GET | List all open disputes |
| `/admin/disputes/:id/resolve` | PATCH | Resolve dispute: refund or release |
| `/admin/users` | GET | List all users |
| `/admin/users/:id/suspend` | PATCH | Suspend a user account |

## 7.3 Frontend — trust pages

### Review form (shown after delivery confirmed)
- 1–5 star selector
- Optional comment field
- Submit button (one review per order — enforced by DB unique constraint)

### Farmer rating display
- Aggregate star rating on farm profile
- Total review count
- Most recent reviews list (last 10)

### Dispute flow (consumer side)
- "Raise dispute" button on order detail (only if status = DELIVERED or DISPATCHED)
- Form: reason selector + description + photo upload
- Dispute status tracker

### Admin panel (`/admin`)
- KYC queue: list of pending farmers with document previews, approve/reject buttons
- Dispute queue: open disputes with order details, evidence, resolve buttons
- User management table

## 7.4 Farmer verification badge

- `isVerified` computed from `kycStatus === 'VERIFIED'`
- Blue checkmark badge shown on farm profile and product cards
- Unverified farmers can list products but get a "Pending verification" label

## Phase 7 done when:
- Admin can approve/reject KYC submissions
- Verified farmers show a badge across the platform
- Consumers can leave ratings after order completion
- Disputes are logged, evidence attached, and resolvable by admin
- Escrow correctly refunds or releases based on dispute resolution

---

---

# Phase 8 — Notifications

> Goal: Real-time and asynchronous notifications for key events.
> Deliverable: In-app, email, and optional push notifications for orders, disputes, and stock alerts.

## 8.1 Notification events to handle

| Event | Notifies | Channel |
|---|---|---|
| New order placed | Farmer | In-app + email |
| Order confirmed | Consumer | In-app + email |
| Order dispatched | Consumer | In-app + email |
| Delivery confirmed | Farmer | In-app |
| Dispute raised | Farmer + Admin | In-app + email |
| Dispute resolved | Consumer + Farmer | In-app + email |
| Low stock (< 10%) | Farmer | In-app |
| KYC approved/rejected | Farmer | In-app + email |
| New review received | Farmer | In-app |

## 8.2 Database — notifications schema

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  title     String
  body      String
  isRead    Boolean  @default(false)
  link      String?  // e.g. "/orders/abc123"
  createdAt DateTime @default(now())
}
```

## 8.3 Backend — notification routes

| Endpoint | Method | Description |
|---|---|---|
| `/notifications` | GET | Current user's notifications |
| `/notifications/:id/read` | PATCH | Mark as read |
| `/notifications/read-all` | PATCH | Mark all as read |

- Email: use Nodemailer with Gmail SMTP or Resend API
- In-app: polling every 30s (or WebSocket for real-time — optional)

## 8.4 Frontend — notification components

- `NotificationBell` — navbar icon with unread count badge
- `NotificationDropdown` — list of recent notifications, mark-read on click
- `NotificationPage` (`/notifications`) — full history with filters

## 8.5 In-app messaging (farmer ↔ consumer)

```prisma
model Message {
  id         String   @id @default(uuid())
  productId  String
  senderId   String
  receiverId String
  body       String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

- Thread is tied to a product listing (pre-purchase enquiry)
- Simple REST polling (no WebSocket needed for MVP)
- Accessible from product detail page ("Message farmer") and from orders

## Phase 8 done when:
- Key events send notifications to the right users
- Unread count shows in navbar
- Email is sent for order status changes
- Consumer can message farmer from a product page

---

---

# Phase 9 — Subscriptions & pre-orders

> Goal: Consumers can subscribe to recurring deliveries. Farmers can accept pre-orders against upcoming harvests.
> Deliverable: Active subscriptions auto-generate orders on schedule. Pre-orders tied to harvest dates.

## 9.1 Database — subscription schema

```prisma
model Subscription {
  id            String       @id @default(uuid())
  consumerId    String
  consumer      Consumer     @relation(fields: [consumerId], references: [id])
  productId     String
  product       Product      @relation(fields: [productId], references: [id])
  quantity      Float
  frequency     Frequency
  status        SubStatus    @default(ACTIVE)
  priceLock     Boolean      @default(false)
  lockedPrice   Float?
  nextOrderDate DateTime
  createdAt     DateTime     @default(now())

  orders        Order[]
}

model PreOrder {
  id              String   @id @default(uuid())
  consumerId      String
  productId       String
  quantity        Float
  expectedDate    DateTime
  depositPaid     Float    @default(0)
  status          PreOrderStatus @default(PENDING)
  createdAt       DateTime @default(now())
}

enum Frequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
}

enum SubStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

enum PreOrderStatus {
  PENDING
  CONFIRMED
  FULFILLED
  CANCELLED
}
```

## 9.2 Backend — subscription routes (`/api/subscriptions`)

| Endpoint | Method | Description |
|---|---|---|
| `/subscriptions` | POST | Create subscription |
| `/subscriptions` | GET | Consumer's active subscriptions |
| `/subscriptions/:id/pause` | PATCH | Pause subscription |
| `/subscriptions/:id/cancel` | PATCH | Cancel subscription |
| `/subscriptions/:id/resume` | PATCH | Resume paused subscription |
| `/preorders` | POST | Place pre-order on a future harvest |
| `/preorders` | GET | Consumer's pre-orders |

### Subscription cron job
- Runs daily: check all `ACTIVE` subscriptions where `nextOrderDate <= today`
- Auto-creates an Order record + Paystack payment link
- Sends notification to consumer: "Your weekly order is ready to pay"
- Updates `nextOrderDate` to next cycle

## 9.3 Frontend — subscription pages

### Subscribe button (on product detail page)
- Shown after "Add to cart"
- Opens modal: select frequency, quantity, price lock preference

### Subscriptions page (`/consumer/subscriptions`)
- List of active subscriptions with next order date
- Pause, cancel, change quantity actions
- Subscription history

### Pre-order flow
- Shown on product page when stock = 0 but `nextHarvestDate` is set
- "Pre-order for [date]" button
- Simple form: quantity + optional deposit

## Phase 9 done when:
- Consumers can subscribe to weekly/bi-weekly/monthly orders
- Cron job auto-generates orders on schedule
- Subscriptions can be paused and resumed without cancelling
- Pre-orders are recorded and linked to harvest dates

---

---

# Phase 10 — PWA, performance & accessibility

> Goal: App works on low-end devices, slow connections, and partially offline.
> Deliverable: Installable PWA with offline product browsing and optimised performance.

## 10.1 PWA setup

- Add `manifest.json` — app name, icons (192px + 512px), theme colour
- Register service worker using Vite PWA plugin (`vite-plugin-pwa`)
- Configure caching strategy:
  - **Cache-first**: static assets (JS, CSS, fonts)
  - **Network-first with cache fallback**: product listings
  - **Network-only**: payments, order mutations

## 10.2 Offline capabilities

- Product browse page: loads cached listings when offline
- Product detail page: loads cached version if previously visited
- Offline banner: "You're offline — showing saved products"
- Cart: persisted to localStorage, survives page refresh
- Order actions (place order, confirm delivery): queue offline, sync on reconnect

## 10.3 Performance optimisations

- Lazy-load all page-level components with `React.lazy + Suspense`
- Image optimisation: serve WebP from Cloudinary, use `loading="lazy"` on all product images
- Pagination: default 20 items per page, load more on scroll
- Debounce all search inputs (300ms)
- Memoize expensive filter/sort computations with `useMemo`

## 10.4 Low-data mode

- Toggle in consumer settings: "Low data mode"
- When on: hide images, show text-only product cards
- Reduce API polling frequency for notifications from 30s to 5min

## 10.5 Accessibility

- All forms: proper `<label>` elements linked to inputs
- Error messages announced via `aria-live="polite"`
- Keyboard navigation through all interactive elements
- Contrast ratios meet WCAG AA (4.5:1 for body text)
- `alt` text on all product images (use product name + farm name)

## 10.6 USSD stub (stretch goal)

- Document a basic USSD flow for farmers to update stock without internet:
  - `*123#` → `1` (Update stock) → Select product → Enter new quantity
- Implement as a simple Twilio or Africa's Talking USSD endpoint
- This is a stretch goal; the REST API is the primary interface

## Phase 10 done when:
- App installs as a PWA on Android and iOS
- Product browse page works offline with cached data
- Lighthouse PWA score ≥ 85
- Low-data mode hides images and reduces data usage
- No critical accessibility violations (run axe-core audit)

---

---

## Module dependency map

```
Phase 1 (Auth)
  └── Phase 2 (Farmer listings)
        └── Phase 3 (Consumer browse)
              └── Phase 4 (Orders & payments)
                    ├── Phase 5 (Delivery)
                    ├── Phase 6 (Price intelligence)
                    ├── Phase 7 (Trust & safety)
                    ├── Phase 8 (Notifications)
                    └── Phase 9 (Subscriptions)
                          └── Phase 10 (PWA & performance)
```

---

## File structure

```
/farm-marketplace
  /client                  ← React frontend
    /public
      manifest.json
    /src
      /components
        /ui                ← Button, Input, Modal, Toast, Badge
        /layout            ← Navbar, Sidebar, Footer
        /farmer            ← FarmerDashboard, ListingForm, DeliveryZones
        /consumer          ← ProductCard, FilterSidebar, Cart
        /orders            ← OrderTimeline, OrderCard
        /charts            ← PriceHistoryChart, MarketBadge
        /trust             ← ReviewForm, DisputeForm, AdminPanel
      /pages
        /auth              ← Login, Register
        /farmer            ← Dashboard, Products, Profile
        /consumer          ← Browse, ProductDetail, FarmProfile
        /orders            ← OrderList, OrderDetail, Checkout
        /admin             ← KycQueue, DisputeQueue
      /context
        AuthContext.jsx
        CartContext.jsx
      /hooks
        useAuth.js
        useCart.js
        useImageUpload.js
        useDebounce.js
      /lib
        api.js             ← Axios instance with JWT interceptor
        paystack.js
        cloudinary.js
      /data
        nigerianStates.json
        seasonalCalendar.json
      App.jsx
      main.jsx

  /server                  ← Express backend
    /prisma
      schema.prisma
      /migrations
      /seed.js
    /src
      /routes
        auth.js
        farmer.js
        products.js
        orders.js
        payments.js
        delivery.js
        intelligence.js
        reviews.js
        disputes.js
        admin.js
        notifications.js
        subscriptions.js
      /middleware
        authenticate.js
        requireRole.js
        validate.js
        rateLimiter.js
      /services
        paystackService.js
        cloudinaryService.js
        emailService.js
        notificationService.js
        priceIntelligenceService.js
      /jobs
        computeAverages.js
        checkScarcity.js
        processSubscriptions.js
      /lib
        prisma.js
      app.js
      server.js

  .env.example
  README.md
```

---

## Environment variables

```env
# Server
DATABASE_URL=postgresql://user:pass@localhost:5432/farmmarket
JWT_SECRET=your-secret-key
PORT=3001

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password

# Google Maps
GOOGLE_MAPS_API_KEY=...

# Client
VITE_API_URL=http://localhost:3001/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_GOOGLE_MAPS_KEY=...
```

---

## Recommended build order within each phase

1. Database schema first — run migration
2. Backend routes + service logic
3. Test all routes with Postman or Insomnia before touching the frontend
4. Build shared/reusable frontend components
5. Build pages that consume those components
6. Connect pages to the API
7. Test the full user journey end-to-end
8. Commit and deploy before starting the next phase

---

## Seed data to create for testing

- 3 farmer accounts (with verified KYC)
- 2 consumer accounts
- 1 admin account
- 10–15 product listings across different categories
- Price history records going back 90 days (generated)
- Seasonal calendar entries for: tomatoes, yam, cassava, plantain, maize, pepper, onion
- Nigerian states + LGA JSON (36 states + FCT)
- 3 sample orders at different status stages

---

*Build plan version 1.0 — Farm Marketplace school project*
