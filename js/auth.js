/**
 * TrustBridge Escrow - Frontend Auth Utilities
 * Uses Supabase SDK directly - No backend needed
 */

const SUPABASE_URL = 'https://wdhvrghpmypjthpkfffb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHZyZ2hwbXlwanRocGtmZmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDUzNzksImV4cCI6MjA5MzYyMTM3OX0.dXNJyQZNOfvqLwYl10gtZv5sCHP9XLlxYdRnHzp5p3g';

// Initialize Supabase
let supabase = null;

function initSupabase() {
  if (window.supabase && !supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase initialized');
  }
}

// Wait for Supabase to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}
setTimeout(initSupabase, 500);

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!localStorage.getItem('userId') && !!localStorage.getItem('userEmail');
}

/**
 * Get current user from localStorage
 */
function getCurrentUserSync() {
  if (!isAuthenticated()) return null;

  return {
    id: localStorage.getItem('userId'),
    email: localStorage.getItem('userEmail'),
    role: localStorage.getItem('userRole'),
    full_name: localStorage.getItem('userName') || localStorage.getItem('userEmail')
  };
}

/**
 * Require authentication - redirect to login if not authenticated
 */
function requireAuth() {
  const user = getCurrentUserSync();
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    window.location.href = './login.html';
    return null;
  }
  console.log('✓ User authenticated:', user.email);
  return user;
}

/**
 * Create a new deposit
 */
async function createDeposit(depositData) {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('Not authenticated');

    console.log('📝 Creating deposit:', depositData);

    const { data, error } = await supabase
      .from('deposits')
      .insert([
        {
          user_id: userId,
          amount: parseFloat(depositData.amount),
          currency: depositData.currency || 'BANK',
          transaction_id_hash: depositData.transactionId || null,
          screenshot_url: depositData.screenshotUrl || null,
          status: 'pending',
          notes: depositData.notes || null
        }
      ])
      .select();

    if (error) {
      console.error('✗ Deposit creation error:', error);
      throw error;
    }

    console.log('✓ Deposit created successfully:', data);
    return data[0];
  } catch (error) {
    console.error('Error creating deposit:', error);
    throw error;
  }
}

/**
 * Get user deposits
 */
async function getUserDeposits(limit = 20) {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('Not authenticated');

  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return [];
  }
}

/**
 * Get user balance from database
 */
async function getUserBalance() {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .select('available_balance, pending_balance')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    available: parseFloat(data.available_balance) || 0,
    pending: parseFloat(data.pending_balance) || 0,
    total: (parseFloat(data.available_balance) || 0) + (parseFloat(data.pending_balance) || 0)
  };
}

/**
 * Get user transactions
 */
async function getUserTransactions(limit = 10) {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Create a transaction (escrow)
 */
async function createTransaction(sellerEmail, amount) {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      buyer_id: userId,
      seller_email: sellerEmail,
      amount,
      status: 'awaiting_funding'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Request withdrawal
 */
async function createWithdrawal(amount, accountInfo) {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('withdrawals')
    .insert([{
      user_id: userId,
      amount,
      account_info: accountInfo,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user withdrawals
 */
async function getUserWithdrawals(limit = 10) {
  const userId = localStorage.getItem('userId');
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Logout - Clear all stored data
 */
function logout() {
  if (supabase) {
    supabase.auth.signOut().catch(err => console.error('Sign out error:', err));
  }
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = 'login.html';
}

/**
 * Format currency (Nigerian Naira)
 */
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format number
 */
function formatNumber(num) {
  return parseFloat(num).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format date
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format status
 */
function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'completed': 'Completed',
    'in_authentication': 'In Review',
    'awaiting_funding': 'Awaiting Funding',
    'funds_pending': 'Funds Pending',
    'paid': 'Paid',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
}

/**
 * Get CSS class for status badge
 */
function getStatusClass(status) {
  const classMap = {
    'pending': 'pending',
    'confirmed': 'confirmed',
    'completed': 'completed',
    'in_authentication': 'in-auth',
    'awaiting_funding': 'pending',
    'funds_pending': 'in-auth',
    'paid': 'completed',
    'rejected': 'pending'
  };
  return classMap[status] || 'pending';
}
