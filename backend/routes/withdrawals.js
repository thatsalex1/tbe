import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifySupabaseToken, requireAdmin } from '../middleware/auth.js';
import { getDatabase, getUser, updateUserBalance } from '../db.js';

const router = express.Router();

/**
 * GET /api/withdrawals
 * Get user's withdrawal requests
 */
router.get('/', verifySupabaseToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('withdrawals')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
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
        amount: parseFloat(w.amount),
        status: w.status,
        requested_at: w.requested_at,
        paid_at: w.paid_at,
        admin_notes: w.admin_notes
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
 * POST /api/withdrawals
 * Request withdrawal
 * Body: { amount }
 */
router.post('/', verifySupabaseToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: {
          message: 'Invalid amount'
        }
      });
    }

    const supabase = getDatabase();

    // Check user has sufficient balance
    const user = await getUser(req.user.id);
    if (parseFloat(user.available_balance) < parseFloat(amount)) {
      return res.status(400).json({
        error: {
          message: 'Insufficient balance for withdrawal',
          available_balance: parseFloat(user.available_balance),
          requested_amount: parseFloat(amount)
        }
      });
    }

    // Create withdrawal request
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert([{
        id: uuidv4(),
        user_id: req.user.id,
        amount: parseFloat(amount),
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted. Admin will process it shortly.',
      withdrawal: {
        id: withdrawal.id,
        amount: parseFloat(withdrawal.amount),
        status: withdrawal.status,
        requested_at: withdrawal.requested_at
      }
    });
  } catch (err) {
    console.error('Error creating withdrawal:', err);
    res.status(500).json({
      error: {
        message: 'Failed to create withdrawal request',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/withdrawals/admin
 * Admin: Get all withdrawal requests
 */
router.get('/admin', verifySupabaseToken, requireAdmin, async (req, res) => {
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
        user: {
          id: w.users.id,
          email: w.users.email,
          full_name: w.users.full_name
        },
        amount: parseFloat(w.amount),
        status: w.status,
        requested_at: w.requested_at,
        paid_at: w.paid_at,
        admin_notes: w.admin_notes
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching admin withdrawals:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch withdrawals',
        details: err.message
      }
    });
  }
});

/**
 * POST /api/withdrawals/:id/pay
 * Admin: Mark withdrawal as paid
 * Body: { admin_notes }
 */
router.post('/:id/pay', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const supabase = getDatabase();

    // Get withdrawal
    const { data: withdrawal, error: getError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    if (withdrawal.status === 'paid') {
      return res.status(400).json({
        error: {
          message: 'This withdrawal has already been paid'
        }
      });
    }

    // Update withdrawal status
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Deduct from user's available balance
    const user = await getUser(withdrawal.user_id);
    const newAvailableBalance = parseFloat(user.available_balance) - parseFloat(withdrawal.amount);

    await updateUserBalance(withdrawal.user_id, newAvailableBalance, user.pending_balance);

    // Log action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert([{
        admin_id: req.user.id,
        action: 'marked_withdrawal_paid',
        resource_id: id,
        resource_type: 'withdrawals',
        details: { amount: withdrawal.amount }
      }]);

    if (logError) console.error('Failed to log action:', logError);

    res.json({
      success: true,
      message: 'Withdrawal marked as paid',
      withdrawal: {
        id: withdrawal.id,
        amount: parseFloat(withdrawal.amount),
        status: 'paid',
        paid_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error paying withdrawal:', err);
    res.status(500).json({
      error: {
        message: 'Failed to process withdrawal',
        details: err.message
      }
    });
  }
});

export default router;
