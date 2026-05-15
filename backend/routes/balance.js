import express from 'express';
import { verifySupabaseToken } from '../middleware/auth.js';
import { getDatabase } from '../db.js';

const router = express.Router();

/**
 * GET /api/balance
 * Get user's available and pending balance
 */
router.get('/', verifySupabaseToken, async (req, res) => {
  try {
    const supabase = getDatabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, available_balance, pending_balance')
      .eq('id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      balance: {
        available: parseFloat(user.available_balance),
        pending: parseFloat(user.pending_balance),
        total: parseFloat(user.available_balance) + parseFloat(user.pending_balance)
      }
    });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch balance',
        details: err.message
      }
    });
  }
});

/**
 * POST /api/balance/check
 * Check if user has sufficient balance for a transaction
 * Body: { amount }
 */
router.post('/check', verifySupabaseToken, async (req, res) => {
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

    const { data: user, error } = await supabase
      .from('users')
      .select('available_balance')
      .eq('id', req.user.id)
      .single();

    if (error) {
      throw error;
    }

    const hasSufficientBalance = parseFloat(user.available_balance) >= parseFloat(amount);

    res.json({
      success: true,
      has_sufficient_balance: hasSufficientBalance,
      available_balance: parseFloat(user.available_balance),
      required_amount: parseFloat(amount)
    });
  } catch (err) {
    console.error('Error checking balance:', err);
    res.status(500).json({
      error: {
        message: 'Failed to check balance',
        details: err.message
      }
    });
  }
});

export default router;
