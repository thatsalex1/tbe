-- ============================================================
-- TRUSTBRIDGE ESCROW - CLEAN DATABASE SETUP
-- This script safely handles existing tables
-- ============================================================

-- DROP EXISTING TABLES (if they exist) - CAREFUL: This deletes data
-- Uncomment these lines only if you want to start completely fresh
-- DROP TABLE IF EXISTS withdrawals CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS deposits CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- CREATE TABLES (only if they don't exist)
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'buyer',
  available_balance DECIMAL(15, 2) DEFAULT 0,
  pending_balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(20) NOT NULL,
  transaction_id_hash VARCHAR(255),
  screenshot_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  confirmed_by_admin UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_email VARCHAR(255),
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'awaiting_funding',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  admin_notes TEXT
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - DROP OLD ONES FIRST (if they exist)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Create user on signup" ON users;
DROP POLICY IF EXISTS "Users can view own deposits" ON deposits;
DROP POLICY IF EXISTS "Users can insert own deposits" ON deposits;
DROP POLICY IF EXISTS "Buyers can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Buyers can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can request withdrawals" ON withdrawals;

-- ============================================================
-- CREATE NEW RLS POLICIES
-- ============================================================

-- USERS TABLE POLICIES
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Create user on signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- DEPOSITS TABLE POLICIES
CREATE POLICY "Users can view own deposits"
  ON deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits"
  ON deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TRANSACTIONS TABLE POLICIES
CREATE POLICY "Buyers can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- WITHDRAWALS TABLE POLICIES
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);

-- ============================================================
-- DONE!
-- ============================================================
-- All tables are ready for signup/login
-- The auth.uid() function links to Supabase Auth automatically
-- ============================================================
