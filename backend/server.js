// LegacyHold Backend API Server
// Express.js + Supabase

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Endpoints

// GET /api/users/:id - Get user profile
app.get('/api/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/balance/:userId - Get user balance
app.get('/api/balance/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('available_balance, pending_balance')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    res.json({
      available_balance: data.available_balance,
      pending_balance: data.pending_balance,
      total_balance: parseFloat(data.available_balance) + parseFloat(data.pending_balance)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/deposits - Create deposit record
app.post('/api/deposits', async (req, res) => {
  try {
    const { user_id, amount, currency, transaction_id_hash } = req.body;

    const { data, error } = await supabase
      .from('deposits')
      .insert([{
        user_id,
        amount,
        currency,
        transaction_id_hash,
        status: 'pending'
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deposits/:userId - Get user deposits
app.get('/api/deposits/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transactions - Create escrow transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { buyer_id, seller_email, amount } = req.body;

    // Generate transaction ID
    const txId = `TB-${Date.now()}`;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        id: txId,
        buyer_id,
        seller_email,
        amount,
        status: 'awaiting_funding'
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/:userId - Get user transactions
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { data: buyerTx, error: buyerError } = await supabase
      .from('transactions')
      .select('*')
      .eq('buyer_id', req.params.userId)
      .order('created_at', { ascending: false });

    const { data: sellerTx, error: sellerError } = await supabase
      .from('transactions')
      .select('*')
      .eq('seller_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (buyerError) throw buyerError;
    if (sellerError) throw sellerError;

    res.json({
      buying: buyerTx || [],
      selling: sellerTx || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/withdrawals - Request withdrawal
app.post('/api/withdrawals', async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    const { data, error } = await supabase
      .from('withdrawals')
      .insert([{
        user_id,
        amount,
        status: 'pending'
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints (basic - add proper authentication later)
app.get('/api/admin/deposits', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/deposits/:id/approve', async (req, res) => {
  try {
    const depositId = req.params.id;

    // Get deposit details
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();

    if (fetchError) throw fetchError;

    // Update deposit status
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ status: 'confirmed' })
      .eq('id', depositId);

    if (updateError) throw updateError;

    // Add to user's available balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('available_balance')
      .eq('id', deposit.user_id)
      .single();

    if (userError) throw userError;

    const newBalance = parseFloat(user.available_balance) + parseFloat(deposit.amount);

    const { error: balanceError } = await supabase
      .from('users')
      .update({ available_balance: newBalance })
      .eq('id', deposit.user_id);

    if (balanceError) throw balanceError;

    res.json({ success: true, message: 'Deposit approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Supabase connected`);
});
