import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifySupabaseToken, requireAdmin } from '../middleware/auth.js';
import { getDatabase, updateUserBalance, getUser } from '../db.js';

const router = express.Router();

/**
 * GET /api/deposits
 * Get user's deposits (with pagination)
 */
router.get('/', verifySupabaseToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('deposits')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
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
        amount: parseFloat(d.amount),
        currency: d.currency,
        status: d.status,
        transaction_hash: d.transaction_id_hash,
        screenshot_url: d.screenshot_url,
        created_at: d.created_at,
        updated_at: d.updated_at
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
 * POST /api/deposits
 * Create a new deposit record (before screenshot upload)
 * Body: { amount, currency, transaction_id_hash }
 */
router.post('/', verifySupabaseToken, async (req, res) => {
  try {
    const { amount, currency, transaction_id_hash } = req.body;

    if (!amount || amount <= 0 || !currency) {
      return res.status(400).json({
        error: {
          message: 'Missing or invalid fields: amount, currency'
        }
      });
    }

    const validCurrencies = ['BTC', 'ETH', 'USDC', 'USDT', 'LTC', 'BANK'];
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({
        error: {
          message: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}`
        }
      });
    }

    const supabase = getDatabase();

    const { data: deposit, error } = await supabase
      .from('deposits')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        amount: parseFloat(amount),
        currency,
        transaction_id_hash: transaction_id_hash || null,
        status: 'pending',
        screenshot_url: null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Deposit record created. Please upload screenshot to confirm.',
      deposit: {
        id: deposit.id,
        amount: parseFloat(deposit.amount),
        currency: deposit.currency,
        status: deposit.status,
        created_at: deposit.created_at
      }
    });
  } catch (err) {
    console.error('Error creating deposit:', err);
    res.status(500).json({
      error: {
        message: 'Failed to create deposit',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/deposits/admin
 * Admin: Get all deposits
 */
router.get('/admin', verifySupabaseToken, requireAdmin, async (req, res) => {
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
        user: {
          id: d.users.id,
          email: d.users.email,
          full_name: d.users.full_name
        },
        amount: parseFloat(d.amount),
        currency: d.currency,
        status: d.status,
        transaction_hash: d.transaction_id_hash,
        screenshot_url: d.screenshot_url,
        created_at: d.created_at,
        updated_at: d.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching admin deposits:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch deposits',
        details: err.message
      }
    });
  }
});

/**
 * POST /api/deposits/:id/confirm
 * Admin: Confirm deposit and add balance to user
 * Body: { admin_notes }
 */
router.post('/:id/confirm', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const supabase = getDatabase();

    // Get deposit
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single();

    if (depositError) throw depositError;

    // Update deposit status
    const { error: updateError } = await supabase
      .from('deposits')
      .update({
        status: 'confirmed',
        confirmed_by_admin: req.user.id,
        notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Update user balance
    const user = await getUser(deposit.user_id);
    const newAvailableBalance = parseFloat(user.available_balance) + parseFloat(deposit.amount);

    await updateUserBalance(deposit.user_id, newAvailableBalance, user.pending_balance);

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert([{
        admin_id: req.user.id,
        action: 'confirmed_deposit',
        resource_id: id,
        resource_type: 'deposits',
        details: { amount: deposit.amount, currency: deposit.currency }
      }]);

    if (logError) console.error('Failed to log action:', logError);

    res.json({
      success: true,
      message: 'Deposit confirmed and balance updated',
      deposit: {
        id: deposit.id,
        status: 'confirmed',
        amount: parseFloat(deposit.amount)
      },
      new_balance: newAvailableBalance
    });
  } catch (err) {
    console.error('Error confirming deposit:', err);
    res.status(500).json({
      error: {
        message: 'Failed to confirm deposit',
        details: err.message
      }
    });
  }
});

export default router;
