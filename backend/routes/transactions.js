import express from 'express';
import { verifySupabaseToken, requireAdmin } from '../middleware/auth.js';
import { getDatabase, getUser, updateUserBalance } from '../db.js';

const router = express.Router();

// Helper: Generate transaction ID
const generateTransactionId = async (supabase) => {
  const { data, error } = await supabase
    .rpc('get_next_transaction_id');

  if (!error && data) {
    return data;
  }

  // Fallback: generate manually
  const now = Date.now();
  return `TB-${now.toString().slice(-5)}`;
};

/**
 * GET /api/transactions
 * Get user's transactions
 */
router.get('/', verifySupabaseToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const supabase = getDatabase();

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Get transactions where user is buyer OR seller
    const { data: buyerTransactions, error: buyerError, count: buyerCount } = await query
      .eq('buyer_id', req.user.id)
      .range(offset, offset + parseInt(limit) - 1);

    if (buyerError) throw buyerError;

    // Also get transactions where user is seller
    let sellerTransactions = [];
    let sellerCount = 0;
    if (buyerCount < parseInt(limit)) {
      const { data: sellerData, error: sellerError, count: sCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('seller_id', req.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (sellerError) throw sellerError;
      sellerTransactions = sellerData || [];
      sellerCount = sCount || 0;
    }

    // Merge and sort
    const allTransactions = [...(buyerTransactions || []), ...sellerTransactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, parseInt(limit));

    res.json({
      success: true,
      transactions: allTransactions.map(t => ({
        id: t.id,
        buyer_id: t.buyer_id,
        seller_id: t.seller_id,
        seller_email: t.seller_email,
        amount: parseFloat(t.amount),
        status: t.status,
        created_at: t.created_at,
        updated_at: t.updated_at,
        completed_at: t.completed_at,
        is_buyer: t.buyer_id === req.user.id,
        is_seller: t.seller_id === req.user.id
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: (buyerCount || 0) + (sellerCount || 0)
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
 * POST /api/transactions
 * Buyer: Initiate new escrow transaction
 * Body: { seller_email, amount }
 */
router.post('/', verifySupabaseToken, async (req, res) => {
  try {
    const { seller_email, amount } = req.body;

    if (!seller_email || !amount || amount <= 0) {
      return res.status(400).json({
        error: {
          message: 'Missing or invalid fields: seller_email, amount'
        }
      });
    }

    const supabase = getDatabase();

    // Check buyer has sufficient balance
    const buyer = await getUser(req.user.id);
    if (parseFloat(buyer.available_balance) < parseFloat(amount)) {
      return res.status(400).json({
        error: {
          message: 'Insufficient balance for this transaction',
          available_balance: parseFloat(buyer.available_balance),
          required_amount: parseFloat(amount)
        }
      });
    }

    // Generate transaction ID
    const transactionId = await generateTransactionId(supabase);

    // Find seller by email (optional - may not be registered yet)
    let sellerId = null;
    const { data: sellerData } = await supabase
      .from('users')
      .select('id')
      .eq('email', seller_email)
      .single();

    if (sellerData) {
      sellerId = sellerData.id;
    }

    // Create transaction
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert([{
        id: transactionId,
        buyer_id: req.user.id,
        seller_id: sellerId,
        seller_email,
        amount: parseFloat(amount),
        status: 'awaiting_funding'
      }])
      .select()
      .single();

    if (transError) throw transError;

    // Deduct from buyer's available balance, add to pending
    const newAvailableBalance = parseFloat(buyer.available_balance) - parseFloat(amount);
    const newPendingBalance = parseFloat(buyer.pending_balance) + parseFloat(amount);

    await updateUserBalance(req.user.id, newAvailableBalance, newPendingBalance);

    // Log action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert([{
        admin_id: req.user.id,
        action: 'created_transaction',
        resource_id: transactionId,
        resource_type: 'transactions',
        details: { seller_email, amount }
      }]);

    if (logError) console.error('Failed to log action:', logError);

    res.status(201).json({
      success: true,
      message: 'Transaction initiated successfully',
      transaction: {
        id: transaction.id,
        seller_email: transaction.seller_email,
        amount: parseFloat(transaction.amount),
        status: transaction.status,
        created_at: transaction.created_at
      },
      new_balance: {
        available: newAvailableBalance,
        pending: newPendingBalance
      }
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({
      error: {
        message: 'Failed to create transaction',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/transactions/admin
 * Admin: Get all transactions
 */
router.get('/admin', verifySupabaseToken, requireAdmin, async (req, res) => {
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
        created_at: t.created_at,
        updated_at: t.updated_at,
        completed_at: t.completed_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching admin transactions:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch transactions',
        details: err.message
      }
    });
  }
});

/**
 * POST /api/transactions/:id/status
 * Admin: Update transaction status
 * Body: { status, admin_notes }
 */
router.post('/:id/status', verifySupabaseToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['awaiting_funding', 'funds_pending', 'in_authentication', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        }
      });
    }

    const supabase = getDatabase();

    // Get transaction
    const { data: transaction, error: getError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Update status
    const updateData = {
      status,
      admin_notes: admin_notes || null,
      updated_at: new Date().toISOString()
    };

    // If completing transaction, add funds to seller's balance
    if (status === 'completed' && transaction.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();

      // Get seller
      const seller = await getUser(transaction.seller_id);
      const newSellerAvailableBalance = parseFloat(seller.available_balance) + parseFloat(transaction.amount);

      // Update seller balance
      await updateUserBalance(
        transaction.seller_id,
        newSellerAvailableBalance,
        seller.pending_balance
      );

      // Update buyer's pending balance (remove from escrow)
      const buyer = await getUser(transaction.buyer_id);
      const newBuyerPendingBalance = parseFloat(buyer.pending_balance) - parseFloat(transaction.amount);

      await updateUserBalance(
        transaction.buyer_id,
        buyer.available_balance,
        newBuyerPendingBalance
      );
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    // Log action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert([{
        admin_id: req.user.id,
        action: 'updated_transaction_status',
        resource_id: id,
        resource_type: 'transactions',
        details: { old_status: transaction.status, new_status: status }
      }]);

    if (logError) console.error('Failed to log action:', logError);

    res.json({
      success: true,
      message: 'Transaction status updated',
      transaction: {
        id: transaction.id,
        status: status,
        updated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({
      error: {
        message: 'Failed to update transaction',
        details: err.message
      }
    });
  }
});

export default router;
