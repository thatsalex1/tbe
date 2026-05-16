# LegacyHoldEscrow - Professional Implementation Plan

## Project Overview
Build a professional, trustworthy escrow application with role-based dashboards, secure authentication, and realistic transaction features. Focus on conversion-optimized landing page, robust auth checks, and feature-rich buyer/seller dashboards.

---

## 1. LANDING PAGE (index.html)

### Current Status
- File exists at `frontend/index.html`
- Has professional design with navy/gold color scheme
- Cormorant Garamond (serif) + DM Sans typography

### Key Sections & Components
**Header/Navigation**
- Logo + brand name "LegacyHoldEscrow"
- Navigation menu: Features, How It Works, Security, Pricing
- CTA buttons: "Get Started" (prominent), "Sign In"
- Sticky/fixed positioning on scroll

**Hero Section**
- Headline: "Secure Escrow for Legacy & Digital Assets" (conveying trust)
- Subheadline: Professional value proposition
- Dual CTA buttons: Primary (Sign Up), Secondary (Learn More)
- Trust badges/security indicators (3-4 key points)

**Features Section**
- 4-6 feature cards showcasing:
  - Buyer Protection
  - Seller Confidence
  - Real-Time Tracking
  - Secure Payment Methods
  - Zero Hidden Fees
  - 24/7 Support
- Each card: icon + title + description (no emojis)

**How It Works Section**
- 3-step process flow: Deposit → Confirm → Release
- Visual timeline or numbered cards
- Clear, concise step descriptions

**Security/Trust Section**
- Encryption badge
- Multi-factor authentication callout
- Compliance indicators (certified, regulated)
- Trust metrics: "X transactions secured", "X users trust us"

**Social Proof Section**
- Testimonials (3-4) from satisfied users (names + role + quote)
- Star ratings
- Professional headshots (or placeholder avatars)

**Pricing Section**
- Transparent fee structure
- 2-3 tiers if applicable or simple flat fee display
- CTA: "Start Escrow"

**Footer**
- Company info
- Quick links
- Contact info
- Legal links (Terms, Privacy)
- Copyright

### Data Structure
```javascript
// Landing page data (hardcoded for now)
const features = [
  { title: "Buyer Protection", desc: "Funds held securely until all conditions met" },
  { title: "Seller Confidence", desc: "Payment guaranteed once you deliver" },
  // ... more features
];

const testimonials = [
  { name: "James Mitchell", role: "Art Collector", quote: "...", rating: 5 },
  // ... more testimonials
];
```

### User Interactions
- Smooth scrolling to sections
- Hover effects on CTA buttons
- Navigation links scroll to relevant sections
- Mobile-responsive hamburger menu
- "Get Started" → redirect to signup.html
- "Sign In" → redirect to login.html

### Design Approach
- Luxury/premium aesthetic (navy + gold)
- No animations unless subtle and professional
- High contrast for readability
- Whitespace usage for elegance
- Professional typography hierarchy
- No emojis, icons only where appropriate

### Status
- **NEEDS UPDATE**: Enhance hero section, add trust badges, improve feature cards layout

---

## 2. AUTHENTICATION SYSTEM

### Current Status
- Auth routes exist: `backend/routes/auth.js`
- Supabase integration in place
- Login/signup pages exist

### Critical Functionality

**Login Flow (login.html)**
- Email + password fields
- "Forgot password?" link
- "Remember me" checkbox (client-side only)
- Error messages (invalid creds, account not found)
- Redirect to role-based dashboard on success
- Form validation (email format, password length)

**Signup Flow (signup.html)**
- Email + password + full name fields
- Role selection (Buyer or Seller)
- Terms acceptance checkbox
- Password strength indicator
- Duplicate email check (backend)
- Email verification (mock or real?)
- Auto-login after signup or redirect to login

**Authentication Check Middleware**
```javascript
// On every dashboard page:
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || !userId) {
    window.location.href = './login.html';
    return false;
  }
  
  // Validate token with backend (optional but recommended)
  // If expired, refresh or redirect to login
  return true;
}
```

**Logout Functionality**
- Clear localStorage (token, userId, userRole, userEmail)
- Clear sessionStorage
- Redirect to login.html
- Button in header/sidebar

### Backend Endpoints
**POST /api/auth/signup**
- Request: { email, password, full_name, role }
- Response: { success, user, token }
- DB insert: users table

**POST /api/auth/login**
- Request: { email, password }
- Response: { success, user, token }

**GET /api/auth/me**
- Request: Authorization header
- Response: { user details }

**POST /api/auth/logout**
- Clear session (if applicable)
- Response: { success }

### Files to Create/Update
- ✅ `frontend/login.html` - enhanced form styling
- ✅ `frontend/signup.html` - enhanced form styling
- ✅ `backend/routes/auth.js` - complete endpoints
- `frontend/js/auth.js` - shared auth utilities (NEW)
- `frontend/js/authCheck.js` - dashboard auth verification (NEW)

---

## 3. BUYER DASHBOARD

### Current Status
- File exists: `frontend/buyer-dashboard.html`
- Has auth check already
- Sidebar navigation structure in place

### Key Sections & Components

**Header**
- Logo/breadcrumb
- User greeting: "Welcome, [First Name]"
- Quick links: Profile, Settings
- Logout button

**Sidebar Navigation**
- Dashboard (home)
- Active Escrows (default view)
- Transaction History
- My Wallet
- Profile
- Support/Help

**Main Content Area - Dashboard Tab**

**Wallet Balance Card** (prominent top section)
- Available Balance: $X,XXX.XX
- Pending Balance: $X,XX.XX (in escrow)
- Total Balance: $X,XXX.XX
- Action button: "Add Funds"

**Active Escrows Card** (grid of 1-3 escrows)
- Each escrow row/card shows:
  - Escrow ID (e.g., "ESC-001234")
  - Item/Description: "Vintage Piano - $8,500"
  - Seller: "John's Antiques"
  - Status: "Awaiting Payment" / "Funds Held" / "Ready to Release"
  - Status badge color: yellow/blue/green
  - Amount: $X,XXX.XX
  - Created date
  - Action: "View Details" button
  - Progress indicator (if applicable)

**Recent Activity/Transactions** (last 5 transactions)
- Transaction type: Deposit, Payment to Escrow, Release
- Amount (+ or -)
- Date/time
- Status
- Link: "View All History"

**Quick Actions Section**
- "Start New Escrow" button (primary CTA)
- "Add Funds" button
- "View All Escrows" button

### Data Structure
```javascript
// Mock wallet data
const wallet = {
  user_id: "user123",
  available_balance: 15250.50,
  pending_balance: 8500.00, // in active escrows
  total_balance: 23750.50,
  last_updated: "2024-01-15T10:30:00Z"
};

// Mock active escrows
const activeEscrows = [
  {
    escrow_id: "ESC-001234",
    item_description: "Vintage Grand Piano",
    seller_name: "John's Antiques",
    seller_id: "seller456",
    amount: 8500.00,
    status: "funds_held", // awaiting_payment, funds_held, ready_to_release
    created_at: "2024-01-10T14:22:00Z",
    expected_delivery: "2024-01-20",
    progress: 50 // percentage
  },
  // ... more escrows
];

// Mock transactions
const recentTransactions = [
  {
    tx_id: "TX-987654",
    type: "deposit", // deposit, payment_to_escrow, release, refund
    amount: 5000.00,
    description: "Added funds to wallet",
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    method: "bank_transfer" // bank_transfer, card, crypto
  },
  // ... more transactions
];
```

### User Interactions
- Click escrow card → open transaction details page
- Click "View All History" → navigate to transaction history page
- Click "Add Funds" → navigate to deposit page
- Click "Profile" → navigate to profile page
- Logout → clear storage + redirect to login

### Design Approach
- Grid-based dashboard layout
- Cards with subtle shadows and borders
- Status badges with distinct colors
- Color-coded transaction types
- Icons for transaction types (no emojis)
- Responsive: sidebar collapses on mobile

### Status
- **NEEDS COMPLETION**: Add wallet display, active escrows grid, transaction list, dashboard data integration

---

## 4. SELLER DASHBOARD

### Current Status
- File exists: `frontend/seller-dashboard.html`
- Has auth check already
- Same sidebar structure as buyer

### Key Sections & Components

**Header**
- Logo/breadcrumb
- User greeting: "Welcome, [First Name]"
- Quick links: Profile, Settings
- Logout button

**Sidebar Navigation**
- Dashboard (home)
- Pending Payments (orders waiting)
- Completed Sales
- My Wallet / Withdrawals
- Profile
- Support/Help

**Main Content Area - Dashboard Tab**

**Available Balance Card** (prominent)
- Available Balance: $X,XXX.XX (can withdraw)
- Pending Balance: $X,XXX.XX (in active escrows)
- Total Earned (lifetime): $X,XXX.XX
- Action button: "Withdraw Funds"

**Pending Payments Card** (active escrows as seller)
- Each pending payment row/card shows:
  - Escrow ID: "ESC-001234"
  - Item: "Vintage Piano"
  - Buyer: "Margaret Smith"
  - Amount: $8,500.00
  - Status: "Awaiting Delivery" / "Delivered, Funds Held" / "Ready to Release"
  - Status badge color: yellow/blue/green
  - Created date
  - Action: "View Details" or "Mark as Delivered"

**Completed Sales** (last 5 completed transactions)
- Item description
- Amount received
- Completion date
- Buyer name (clickable to details)
- Transaction ID

**Quick Actions Section**
- "Withdraw Funds" button (primary)
- "View Pending Payments" button
- "View Sales History" button

### Data Structure
```javascript
// Mock seller balance data
const sellerBalance = {
  user_id: "seller456",
  available_balance: 45300.75, // can withdraw
  pending_balance: 8500.00,    // in active escrows
  total_earned: 125450.25,     // lifetime
  withdrawal_pending: 0,
  last_updated: "2024-01-15T10:30:00Z"
};

// Mock pending payments (seller perspective)
const pendingPayments = [
  {
    escrow_id: "ESC-001234",
    item_description: "Vintage Grand Piano",
    buyer_name: "Margaret Smith",
    buyer_id: "user123",
    amount: 8500.00,
    status: "delivered_held", // awaiting_delivery, delivered_held, ready_to_release
    delivery_date: "2024-01-14T16:00:00Z",
    created_at: "2024-01-10T14:22:00Z",
    progress: 75 // percentage
  },
  // ... more pending
];

// Mock completed sales
const completedSales = [
  {
    tx_id: "TX-987654",
    escrow_id: "ESC-001233",
    item_description: "Antique Desk",
    buyer_name: "Robert Johnson",
    amount: 3200.00,
    completed_date: "2024-01-08T10:00:00Z",
    status: "completed"
  },
  // ... more completed
];
```

### User Interactions
- Click pending payment → open transaction details
- Click "Mark as Delivered" → update escrow status (if implemented)
- Click "View All Sales" → navigate to sales history
- Click "Withdraw Funds" → navigate to withdrawal page
- Logout → clear storage + redirect to login

### Design Approach
- Same professional layout as buyer dashboard
- Seller-specific colors/emphasis (focus on available balance for withdrawal)
- Pending payments as prominent feature
- Sales history as secondary display
- Responsive sidebar collapse on mobile

### Status
- **NEEDS COMPLETION**: Add balance display, pending payments grid, completed sales list, seller-specific data integration

---

## 5. DEPOSIT SYSTEM

### Current Status
- File exists: `frontend/deposits.html`
- Backend route exists: `backend/routes/deposits.js`

### Deposit Page Structure

**Header**
- "Add Funds to Your Wallet"
- Current wallet balance display (read-only)

**Amount Input Section**
- Input field: "Deposit Amount"
- Currency selector (USD, BTC, ETH)
- Suggested amounts: $500, $1000, $5000, Custom
- Amount validation (min: $10, max: $100,000)
- Total after fees display (if applicable)

**Deposit Method Selection** (2 primary methods)

**Method 1: Bank Transfer**
- Card title: "Bank Transfer (2-3 Business Days)"
- Steps numbered:
  1. Enter amount
  2. Receive bank details
  3. Make transfer
  4. Confirmation within 48 hours
- "Select This Method" button → expand section with:
  - Bank name: "LegacyHold Financial"
  - Account number: "1234567890"
  - Routing number: "987654321"
  - Account type: "Money Market"
  - Reference code: "DEP-[USER-ID]-[TIMESTAMP]" (copy button)
  - "Copy All Details" button
  - Instructions: "Include reference code as memo"
  - Confirmation: "I've made the transfer" button

**Method 2: Cryptocurrency**
- Card title: "Cryptocurrency (Instant)"
- Steps numbered:
  1. Choose crypto type
  2. Scan QR code or copy address
  3. Send payment
  4. Instant confirmation
- "Select This Method" button → expand section with:
  - Crypto type tabs: Bitcoin, Ethereum
  - QR code display (large, scannable)
  - Wallet address: "1A1z7agoat2..." (copy button)
  - Minimum amount in USD equivalent
  - "Copy Address" button
  - "Copy QR" or download QR button
  - Exchange rate info: "1 BTC = $42,500 USD"
  - Confirmation: "I've sent the payment" button

**Deposit History Section** (below)
- Recent deposits (last 5)
- Columns: Date, Amount, Method, Status (Pending/Completed), Action
- Status indicators: yellow pending, green completed, red failed

### Data Structure
```javascript
// Deposit form data
const depositForm = {
  amount: 0,
  currency: "USD",
  method: null, // "bank_transfer" or "crypto"
  crypto_type: "BTC" // if crypto selected
};

// Bank transfer details (mock)
const bankDetails = {
  bank_name: "LegacyHold Financial",
  account_number: "1234567890",
  routing_number: "987654321",
  account_type: "Money Market",
  swift_code: "LGCHUSXX"
};

// Crypto wallet addresses (mock)
const cryptoAddresses = {
  BTC: {
    address: "1A1z7agoat2EUa3b1cTZhKyPwQFEoGVa9s",
    qr_code_url: "data:image/png;base64,...",
    min_amount_usd: 10,
    network: "Bitcoin Mainnet"
  },
  ETH: {
    address: "0x742d35Cc6634C0532925a3b844Bc939D28245C36",
    qr_code_url: "data:image/png;base64,...",
    min_amount_usd: 10,
    network: "Ethereum Mainnet"
  }
};

// Deposit history
const depositHistory = [
  {
    deposit_id: "DEP-user123-1231",
    amount: 5000.00,
    currency: "USD",
    method: "bank_transfer",
    status: "completed",
    date: "2024-01-14T16:00:00Z",
    confirmation_tx: "TX-987654"
  },
  // ... more deposits
];
```

### User Interactions
- Enter amount → validation + fee calculation
- Select method → expand relevant section
- Click "Copy Address" → copy to clipboard + visual feedback
- Click "Copy All Details" → copy bank details to clipboard
- Click "Download QR" → trigger QR code download (if implemented)
- Click confirmation button → POST deposit record to backend
- View deposit history → see status of recent deposits

### Design Approach
- Card-based layout for each deposit method
- Large, scannable QR code
- High contrast for wallet address (monospace font)
- Copy buttons with hover states and feedback
- Status badges for deposit history
- Progress indicators showing deposit steps

### Real-looking but Non-functional
- QR codes: Display mock/sample QR codes (functional QR scanning not required)
- Bank details: Use mock but realistic-looking details
- Exchange rates: Static display (not real-time if not implemented)
- Crypto addresses: Use realistic formats, but don't actually process crypto
- Transaction confirmation: Show in UI but could be mocked backend response

### Status
- **NEEDS COMPLETION**: Refine UI, add copy functionality, QR code display, deposit history integration

---

## 6. TRANSACTION HISTORY PAGE

### Current Status
- No dedicated history page yet

### Page Structure

**Header**
- "Transaction History"
- Date range filter (dropdown)
- Search by transaction ID or description
- Export button (to CSV or PDF)

**Filters & Sorting**
- Date range picker: Last 7 days / Last 30 days / Custom range
- Transaction type filter: All / Deposits / Escrow Payments / Releases / Refunds / Withdrawals
- Status filter: All / Pending / Completed / Failed
- Sort: Newest First / Oldest First / Amount (high to low)

**Transaction Table**
- Columns:
  - Date (sortable): Jan 15, 2024 10:30 AM
  - Transaction ID: TX-987654 (clickable → details)
  - Type: Deposit / Escrow Payment / Release / Refund / Withdrawal (with icon)
  - Description: "Funds added to wallet" or "Payment to Escrow ESC-001234"
  - Amount: $5,000.00 (green for incoming, red for outgoing)
  - Status: Pending / Completed / Failed (badge)
  - Action: "View Details" link

**Pagination**
- Show 25 per page
- Previous / Next buttons
- Jump to page selector
- "Showing X-Y of Z results"

**Empty State**
- If no transactions: "No transactions yet" message
- "Get started" CTA

### Data Structure
```javascript
// Transaction history
const transactions = [
  {
    tx_id: "TX-987654",
    user_id: "user123",
    type: "deposit", // deposit, escrow_payment, release, refund, withdrawal
    amount: 5000.00,
    currency: "USD",
    description: "Added funds to wallet",
    related_escrow_id: null,
    date: "2024-01-15T10:30:00Z",
    status: "completed", // pending, completed, failed
    method: "bank_transfer",
    confirmation_id: "CONF-12345"
  },
  // ... more transactions
];
```

### User Interactions
- Filter by date range → update table
- Filter by type/status → update table
- Click transaction ID → navigate to details page
- Click "View Details" → navigate to details page
- Click "Export" → download CSV or PDF
- Sort by column → reorder table

### Design Approach
- Clean table layout with alternating row colors
- Status badges with colors (pending: yellow, completed: green, failed: red)
- Icons for transaction types
- Hover effects on clickable rows
- Responsive: stack on mobile instead of horizontal table

### Status
- **NEEDS CREATION**: Create transaction-history.html with full filter/sort functionality

---

## 7. TRANSACTION DETAILS PAGE

### Current Status
- No dedicated details page yet

### Page Structure

**Header**
- Breadcrumb: Transactions > [Transaction ID]
- "Transaction Details"
- Back button

**Transaction Info Card** (main focus)
- Transaction ID: TX-987654 (copy button)
- Status: Completed (large badge, green)
- Date & Time: Jan 15, 2024, 10:30 AM
- Amount: $5,000.00 (prominent)
- Currency: USD

**Details Section**
- Type: Deposit
- Description: Added funds to wallet
- Method: Bank Transfer
- Confirmation ID: CONF-12345 (copy button)
- Related Escrow (if applicable): ESC-001234 (link to escrow details)

**Timeline Section** (if multi-step)
- Step 1: "Initiated" - Jan 15, 10:30 AM
- Step 2: "Bank processing" - Jan 15, 11:00 AM
- Step 3: "Received" - Jan 16, 09:00 AM
- Step 4: "Confirmed" - Jan 16, 09:30 AM
- Current step highlighted in green

**Supporting Documents** (if applicable)
- Receipt download link
- Invoice download link
- Proof of transaction (screenshot/PDF)

**Related Information**
- From/To parties (if applicable)
- Counterparty details: Name, Account type
- Reference notes

**Actions Section**
- "Download Receipt" button
- "Contact Support" link
- Back to history button

### Data Structure
```javascript
// Transaction detail
const transactionDetail = {
  tx_id: "TX-987654",
  user_id: "user123",
  type: "deposit",
  amount: 5000.00,
  currency: "USD",
  description: "Added funds to wallet",
  date: "2024-01-15T10:30:00Z",
  status: "completed",
  method: "bank_transfer",
  confirmation_id: "CONF-12345",
  related_escrow_id: null,
  from_account: "User's Bank Account",
  to_account: "LegacyHold Financial - Money Market",
  reference_number: "REF-2024-001234",
  timeline: [
    { step: 1, status: "initiated", time: "2024-01-15T10:30:00Z" },
    { step: 2, status: "processing", time: "2024-01-15T11:00:00Z" },
    { step: 3, status: "received", time: "2024-01-16T09:00:00Z" },
    { step: 4, status: "confirmed", time: "2024-01-16T09:30:00Z" }
  ]
};
```

### User Interactions
- Click transaction ID → copy to clipboard
- Click confirmation ID → copy to clipboard
- Click escrow link → navigate to escrow details
- Click "Download Receipt" → download PDF (mocked)
- Click "Contact Support" → navigate to support page or open chat

### Design Approach
- Card-based layout
- Timeline with visual indicators
- Large amount display
- Status badge prominent and colored
- Related information grouped logically
- Copy buttons for reference numbers
- Professional typography and spacing

### Status
- **NEEDS CREATION**: Create transaction-detail.html with timeline and document downloads

---

## 8. ESCROW DETAILS PAGE (for active escrows)

### Current Status
- No dedicated page yet (dashboards show summary)

### Page Structure

**Header**
- Breadcrumb: Escrows > [Escrow ID]
- Escrow ID: ESC-001234 (copy button)
- Status badge: "Funds Held" (large, colored)

**Escrow Info Card** (main)
- Item Description: "Vintage Grand Piano"
- Amount: $8,500.00 (prominent)
- Buyer: "Margaret Smith" (with link to profile if applicable)
- Seller: "John's Antiques" (with link to profile if applicable)
- Created: Jan 10, 2024
- Expected Delivery: Jan 20, 2024
- Status: Funds Held

**Progress Timeline** (visual)
- Step 1: Deposit Funds (completed, green)
- Step 2: Confirm Details (completed, green)
- Step 3: Deliver Item (in progress, yellow)
- Step 4: Release Funds (pending, gray)
- Current step highlighted

**Funds Status Section**
- Buyer Deposited: $8,500.00 (green check)
- Seller Address/Details (if visible)
- Release Condition: "After item delivery confirmation"
- Release Deadline: Jan 25, 2024

**Actions Section** (context-dependent)
- If Buyer:
  - "Confirm Item Received" button (after delivery)
  - "Open Dispute" link (if needed)
  - "Message Seller" button
- If Seller:
  - "Mark as Delivered" button (if not yet shipped)
  - "Message Buyer" button
  - "Request Release" button (after delivery)

**Communication Section**
- Recent messages/notes between parties
- Timestamp, sender, message content
- Message input field (if chat enabled)

**Dispute Section** (if applicable)
- "Open a Dispute" button/link
- "View Dispute History" (if any)

**Timeline/History Section**
- All events for this escrow:
  - "Escrow created" - Jan 10, 10:30 AM
  - "Funds deposited" - Jan 10, 11:00 AM
  - "Escrow confirmed" - Jan 10, 12:00 PM
  - "Item shipped" - Jan 13, 09:00 AM
  - etc.

### Data Structure
```javascript
// Escrow detail
const escrowDetail = {
  escrow_id: "ESC-001234",
  item_description: "Vintage Grand Piano",
  item_category: "antiques",
  amount: 8500.00,
  currency: "USD",
  buyer_id: "user123",
  buyer_name: "Margaret Smith",
  seller_id: "seller456",
  seller_name: "John's Antiques",
  status: "funds_held", // awaiting_payment, funds_held, delivered_held, completed
  created_at: "2024-01-10T10:30:00Z",
  expected_delivery: "2024-01-20T23:59:00Z",
  release_deadline: "2024-01-25T23:59:00Z",
  funds_status: {
    deposited: true,
    amount: 8500.00,
    deposited_date: "2024-01-10T11:00:00Z"
  },
  timeline: [
    { event: "Escrow created", date: "2024-01-10T10:30:00Z", actor: "system" },
    { event: "Funds deposited", date: "2024-01-10T11:00:00Z", actor: "buyer" },
    { event: "Escrow confirmed", date: "2024-01-10T12:00:00Z", actor: "seller" },
    { event: "Item shipped", date: "2024-01-13T09:00:00Z", actor: "seller" }
  ]
};
```

### User Interactions
- Click buyer/seller name → view profile (if enabled)
- Click "Confirm Item Received" → update escrow status
- Click "Mark as Delivered" → update escrow status
- Click "Open Dispute" → navigate to dispute form
- Click "Message" button → open chat (if enabled)
- View timeline events → see full history

### Design Approach
- Clear status at top
- Visual timeline showing progress
- Two-column layout: info on left, actions/messages on right
- Color-coded status badges
- Clear action buttons for next steps
- Emphasis on security and protection

### Status
- **NEEDS CREATION**: Create escrow-detail.html with timeline and status updates

---

## 9. USER PROFILE PAGE

### Current Status
- No dedicated profile page yet

### Page Structure

**Header**
- "My Profile"
- Edit button (toggle edit mode)

**User Info Section**
- Profile picture/avatar (placeholder if none)
- Full Name
- Email
- Phone Number
- Account Status: "Active" (green badge)
- Member Since: Jan 1, 2024
- Edit button (pencil icon)

**Account Settings Section**
- Current Password (for viewing mode: hidden)
- Change Password button → modal/form
- Two-Factor Authentication: Enabled/Disabled
- Enable/Disable 2FA button

**Role Information Section**
- Role: Buyer / Seller
- Role-specific stats:
  - If Buyer: Active Escrows, Total Spent, Avg. Escrow Value
  - If Seller: Active Listings, Total Earned, Completed Sales

**Address Information Section** (if applicable)
- Billing Address
- Shipping Address (if applicable)
- Edit button for each

**Payment Methods Section**
- Default payment method
- Linked bank accounts (masked): Bank Name ending in ****1234
- Add new payment method button
- Remove button for each

**Notification Settings Section**
- Email notifications: enabled/disabled (toggle)
- Escrow updates: enabled/disabled (toggle)
- Marketing emails: enabled/disabled (toggle)

**Preferences Section**
- Display currency: USD / BTC / ETH
- Language: English
- Theme: Light / Dark (if implemented)

**Danger Zone Section** (bottom, red styling)
- "Delete Account" button → confirmation modal
- "Account Deactivation" button → form

### Data Structure
```javascript
// User profile
const userProfile = {
  user_id: "user123",
  email: "margaret@example.com",
  full_name: "Margaret Smith",
  phone: "+1 (555) 123-4567",
  role: "buyer", // buyer, seller, admin
  avatar_url: null,
  created_at: "2024-01-01T00:00:00Z",
  account_status: "active",
  two_factor_enabled: false,
  notification_settings: {
    email_notifications: true,
    escrow_updates: true,
    marketing_emails: false
  },
  preferences: {
    display_currency: "USD",
    language: "en",
    theme: "light"
  },
  stats: {
    active_escrows: 1,
    total_spent: 8500.00,
    completed_transactions: 5
  }
};
```

### User Interactions
- Click "Edit" button → enable edit mode for fields
- Save changes → POST to backend
- Click "Change Password" → modal form
- Toggle 2FA → enable/disable button
- Click "Add Payment Method" → form/modal
- Click "Delete Account" → confirmation modal
- Update notification settings → toggle switches

### Design Approach
- Grouped sections with clear hierarchy
- Edit mode toggle (inline editing)
- Confirmation modals for destructive actions
- Sensitive info partially masked
- Clear labels and helpful hints
- Settings organized logically

### Status
- **NEEDS CREATION**: Create profile.html with edit mode and settings management

---

## 10. LOGOUT FUNCTIONALITY

### Implementation
- Logout button in header (all authenticated pages)
- Location: Top-right corner, next to user menu
- Click handler:
  ```javascript
  function logout() {
    // Clear all stored auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = './login.html';
  }
  ```

---

## FILE STRUCTURE & CREATION

### Files to Create
```
frontend/
├── pages/
│   ├── transaction-history.html (NEW)
│   ├── transaction-detail.html (NEW)
│   ├── escrow-detail.html (NEW)
│   ├── profile.html (NEW)
│   ├── withdrawal.html (NEW - for seller cash out)
│   └── dispute.html (NEW - for disputes)
├── js/
│   ├── auth.js (NEW - shared auth utilities)
│   ├── authCheck.js (NEW - dashboard auth verification)
│   ├── dashboard-utils.js (NEW - shared dashboard logic)
│   └── api.js (NEW - API call wrapper)
├── css/
│   ├── style.css (UPDATE - consolidate styles)
│   ├── dashboard.css (NEW - dashboard-specific styles)
│   └── responsive.css (UPDATE - improve mobile)
├── index.html (UPDATE - enhance landing page)
├── login.html (UPDATE - improve styling)
├── signup.html (UPDATE - improve styling)
├── buyer-dashboard.html (UPDATE - add wallet, escrows, transactions)
├── seller-dashboard.html (UPDATE - add balance, pending, sales)
└── deposits.html (UPDATE - enhance UI, add QR codes)

backend/
├── routes/
│   ├── auth.js (VERIFY - ensure all endpoints)
│   ├── transactions.js (VERIFY/UPDATE - ensure complete)
│   ├── deposits.js (VERIFY - ensure complete)
│   ├── balance.js (VERIFY - ensure complete)
│   ├── escrows.js (NEW - escrow operations)
│   ├── profile.js (NEW - user profile operations)
│   └── withdrawals.js (VERIFY - ensure complete)
├── middleware/
│   ├── auth.js (VERIFY - ensure token validation)
│   └── validation.js (NEW - input validation)
├── db.js (VERIFY - ensure connection pooling)
└── server.js (VERIFY - ensure routes mounted)

.env file (CREATE IF NOT EXISTS)
├── SUPABASE_URL=
├── SUPABASE_KEY=
└── PORT=3000
```

### Files to Update
- `frontend/index.html` - enhance landing page
- `frontend/login.html` - improve form styling
- `frontend/signup.html` - improve form styling
- `frontend/buyer-dashboard.html` - add all dashboard features
- `frontend/seller-dashboard.html` - add all seller features
- `frontend/deposits.html` - enhance UI and QR codes
- `backend/server.js` - mount all routes
- `backend/package.json` - verify dependencies

---

## AUTHENTICATION FLOW REQUIREMENTS

### Authentication States
1. **Not Logged In** - User sees landing page, can access login/signup only
2. **Logged In (Buyer)** - User sees buyer dashboard, buyer-specific pages
3. **Logged In (Seller)** - User sees seller dashboard, seller-specific pages
4. **Session Expired** - Clear storage, redirect to login with message

### Token Management
- Store `authToken` in localStorage (or sessionStorage for security)
- Validate token on page load (checkAuth function)
- Include token in API headers: `Authorization: Bearer [token]`
- Refresh token if expired (backend returns 401)
- Logout clears all storage

### Protected Routes
- All dashboard pages: require auth + correct role
- All transaction pages: require auth
- Logout page: redirect to login

### Open Routes
- Landing page (index.html)
- Login page
- Signup page
- Privacy/Terms pages (if created)

---

## CRITICAL FUNCTIONALITY vs UI-ONLY

### Critical (Must Work)
1. **Authentication**
   - Signup with validation
   - Login with token
   - Auth check on protected pages
   - Logout clearing storage
   - Role-based access

2. **Balance Display**
   - Fetch user balance from backend
   - Display available + pending + total
   - Real-time updates

3. **Transaction History**
   - Fetch transactions from backend
   - Display with filtering/sorting
   - Show transaction details

4. **Deposits**
   - Display bank details (mock)
   - Display crypto addresses/QR codes
   - Record deposit attempt

### UI-Only (Non-functional but Real-looking)
1. **Escrow Management** (display only initially)
   - Show active escrows
   - Display progress
   - Show status (actual status updates can be mocked)

2. **Withdrawals** (form display only)
   - Show form to request withdrawal
   - Display pending withdrawal status
   - Actual processing mocked in backend

3. **Dispute System** (display only initially)
   - Show dispute form
   - Display dispute history
   - Actual dispute resolution mocked

4. **Chat/Messaging** (optional, not required)
   - Show message interface
   - Can be mocked without real functionality

5. **QR Code Scanning** (display only)
   - Show QR codes
   - Allow copy of addresses
   - Actual payment confirmation mocked

---

## SUMMARY OF IMPLEMENTATION PHASES

### Phase 1: Foundation (Priority 1)
- Enhance landing page (index.html)
- Improve login/signup pages
- Verify authentication system works
- Create auth utility scripts (auth.js, authCheck.js)

### Phase 2: Dashboards (Priority 2)
- Build buyer dashboard with wallet + escrows + transactions
- Build seller dashboard with balance + pending + sales
- Create shared dashboard styles

### Phase 3: Pages (Priority 3)
- Transaction history page
- Transaction detail page
- User profile page

### Phase 4: Escrows (Priority 4)
- Escrow detail page
- Escrow status updates (display-only)
- Dispute page (optional)

### Phase 5: Deposits & Withdrawals (Priority 5)
- Enhance deposits page with QR codes + copy functionality
- Create withdrawals page
- Add deposit history to dashboard

---

## KEY DESIGN PRINCIPLES

1. **Professional Design**
   - Navy + gold color scheme (already in place)
   - Serif headers, sans-serif body text
   - No emojis, use icons where appropriate
   - Clear hierarchy and whitespace

2. **Trustworthiness**
   - Security indicators (SSL badge, 2FA)
   - Clear transaction flows
   - Transparent fees
   - User testimonials

3. **Conversion-Optimized**
   - Clear CTAs ("Get Started", "Sign Up")
   - Minimal friction (quick signup)
   - Trust badges prominent
   - Testimonials and social proof

4. **Real-looking but Non-functional**
   - Use realistic but mock data
   - Display QR codes but don't process crypto
   - Show forms but don't require actual integration
   - Display timelines but can mock status updates

5. **Responsive**
   - Mobile-first approach
   - Sidebar collapse on mobile
   - Touch-friendly buttons
   - Readable on all screen sizes

---

## TESTING CHECKLIST

- [ ] Authentication flow (signup → login → dashboard → logout)
- [ ] Role-based access (buyer sees buyer dashboard, seller sees seller dashboard)
- [ ] Auth check on protected pages (logged-out users redirected)
- [ ] Balance display updated correctly
- [ ] Transaction history filters and sorting
- [ ] Transaction detail page loads correctly
- [ ] Profile page edit mode works
- [ ] Deposit page displays correctly with QR codes
- [ ] Logout clears all storage
- [ ] Responsive design on mobile/tablet/desktop
- [ ] No console errors or warnings
- [ ] All links and buttons functional
- [ ] Copy buttons copy to clipboard
- [ ] Form validation working

---

END OF IMPLEMENTATION PLAN
