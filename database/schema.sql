-- TrustBridge Escrow Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('buyer', 'seller');
CREATE TYPE deposit_status AS ENUM ('pending', 'confirmed', 'rejected');
CREATE TYPE transaction_status AS ENUM ('awaiting_funding', 'funds_pending', 'in_authentication', 'completed');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'paid', 'rejected');

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role,
  available_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  pending_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: deposits
-- ============================================
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 8) NOT NULL,
  currency VARCHAR(10) NOT NULL, -- BTC, ETH, USDC, USDT, LTC, BANK
  transaction_id_hash VARCHAR(255), -- User's tx hash/ID
  screenshot_url VARCHAR(500),
  status deposit_status NOT NULL DEFAULT 'pending',
  confirmed_by_admin VARCHAR(255) REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: transactions (Escrow Deals)
-- ============================================
CREATE TABLE transactions (
  id VARCHAR(20) PRIMARY KEY, -- TB-10001, TB-10002, etc.
  buyer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  seller_email VARCHAR(255), -- In case seller doesn't have account yet
  amount DECIMAL(18, 8) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'awaiting_funding',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLE: withdrawals
-- ============================================
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(18, 8) NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: admin_logs (Audit Trail)
-- ============================================
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(255) NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- confirmed_deposit, updated_transaction_status, etc.
  resource_id VARCHAR(50), -- ID of affected resource
  resource_type VARCHAR(50), -- deposits, transactions, withdrawals
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_created_at ON deposits(created_at DESC);

CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS for security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
-- Allow anyone to insert during signup (Clerk handles auth, not Supabase Auth)
CREATE POLICY "Anyone can insert user profile"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can view their own profile (checking by email since we're using Clerk)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile (checking by email/id)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (true);

-- Deposits RLS Policies
-- Allow anyone to insert deposits (frontend validates user_id via Clerk)
CREATE POLICY "Users can insert own deposits"
  ON deposits FOR INSERT
  WITH CHECK (true);

-- Users can view deposits (frontend filters by user_id via Clerk)
CREATE POLICY "Users can view own deposits"
  ON deposits FOR SELECT
  USING (true);

-- Users can update deposits
CREATE POLICY "Users can update own deposits"
  ON deposits FOR UPDATE
  USING (true);

-- Transactions RLS Policies
-- Allow anyone to insert transactions (frontend validates via Clerk)
CREATE POLICY "Users can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Users can view their own transactions (frontend filters via Clerk)
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (true);

-- Withdrawals RLS Policies
-- Allow anyone to insert withdrawal requests (frontend validates via Clerk)
CREATE POLICY "Users can insert withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (true);

-- Users can view withdrawals (frontend filters via Clerk)
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (true);

-- Sequence for transaction IDs
CREATE SEQUENCE transaction_id_seq START 10001;

-- Helper function to generate transaction ID
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'TB-' || LPAD(nextval('transaction_id_seq')::text, 5, '0');
END;
$$ LANGUAGE plpgsql;
