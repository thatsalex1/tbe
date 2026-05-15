import express from 'express';
import { verifySupabaseToken, requireAdmin } from '../middleware/auth.js';
import { getDatabase } from '../db.js';

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Admin: Get dashboard statistics
 */
router.get('/dashboard', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const supabase = getDatabase();

    // Get statistics
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role', { count: 'exact' });

    const { data: pendingDeposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*', { count: 'exact' })
      .eq('status', 'pending');

    const { data: activeTransactions, error: transError } = await supabase
      .from('transactions')
      .select('amount', { count: 'exact' })
      .neq('status', 'completed');

    const { data: pendingWithdrawals, error: withdrawError } = await supabase
      .from('withdrawals')
      .select('amount', { count: 'exact' })
      .eq('status', 'pending');

    const buyerCount = users?.filter(u => u.role === 'buyer').length || 0;
    const sellerCount = users?.filter(u => u.role === 'seller').length || 0;

    res.json({
      success: true,
      stats: {
        total_users: users?.length || 0,
        buyers: buyerCount,
        sellers: sellerCount,
        pending_deposits: pendingDeposits?.length || 0,
        active_transactions: activeTransactions?.length || 0,
        pending_withdrawals: pendingWithdrawals?.length || 0,
        total_in_escrow: activeTransactions?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch dashboard statistics',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/admin/users
 * Admin: Get all users
 */
router.get('/users', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (role && ['buyer', 'seller'].includes(role)) {
      query = query.eq('role', role);
    }

    const { data: users, count, error } = await query
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        role: u.role,
        available_balance: parseFloat(u.available_balance),
        pending_balance: parseFloat(u.pending_balance),
        created_at: u.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch users',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/admin/deposits
 * Admin: Get all deposits (already implemented in deposits.js)
 * This is a convenience endpoint
 */
router.get('/deposits', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('deposits')
      .select('*, users(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: deposits, count, error } = await query
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      deposits: deposits.map(d => ({
        id: d.id,
        user: d.users,
        amount: parseFloat(d.amount),
        currency: d.currency,
        status: d.status,
        transaction_hash: d.transaction_id_hash,
        screenshot_url: d.screenshot_url,
        created_at: d.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching deposits:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch deposits',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/admin/transactions
 * Admin: Get all transactions (already implemented in transactions.js)
 * This is a convenience endpoint
 */
router.get('/transactions', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('transactions')
      .select('*, buyer:buyer_id(id, email, full_name), seller:seller_id(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: transactions, count, error } = await query
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        buyer: t.buyer,
        seller: t.seller,
        seller_email: t.seller_email,
        amount: parseFloat(t.amount),
        status: t.status,
        created_at: t.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch transactions',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/admin/withdrawals
 * Admin: Get all withdrawals (already implemented in withdrawals.js)
 * This is a convenience endpoint
 */
router.get('/withdrawals', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('withdrawals')
      .select('*, users(id, email, full_name)', { count: 'exact' })
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: withdrawals, count, error } = await query
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        user: w.users,
        amount: parseFloat(w.amount),
        status: w.status,
        requested_at: w.requested_at,
        paid_at: w.paid_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch withdrawals',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/admin/logs
 * Admin: Get admin action logs
 */
router.get('/logs', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    const { data: logs, count, error } = await supabase
      .from('admin_logs')
      .select('*, users(id, email, full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      logs: logs.map(l => ({
        id: l.id,
        admin: l.users,
        action: l.action,
        resource_id: l.resource_id,
        resource_type: l.resource_type,
        details: l.details,
        created_at: l.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch logs',
        details: err.message
      }
    });
  }
});

export default router;
