import { createClient } from '@supabase/supabase-js';

let supabase;

export const initDatabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key in environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Database connected');

  return supabase;
};

export const getDatabase = () => {
  if (!supabase) {
    initDatabase();
  }
  return supabase;
};

// Utility functions for common operations

export const getUser = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(`User not found: ${error.message}`);
  return data;
};

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
};

export const createUser = async (id, email, fullName, phone, role) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id,
      email,
      full_name: fullName,
      phone,
      role,
      available_balance: 0,
      pending_balance: 0
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return data;
};

export const updateUserBalance = async (userId, availableBalance, pendingBalance) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      available_balance: availableBalance,
      pending_balance: pendingBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update balance: ${error.message}`);
  return data;
};

export const getNextTransactionId = async () => {
  const { data, error } = await supabase
    .rpc('get_next_transaction_id');

  if (error) {
    // Fallback: generate ID manually
    const now = Date.now();
    return `TB-${now.toString().slice(-5)}`;
  }

  return data;
};

export const createTransaction = async (transactionData) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) throw new Error(`Failed to create transaction: ${error.message}`);
  return data;
};

export const getTransaction = async (transactionId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) throw new Error(`Transaction not found: ${error.message}`);
  return data;
};

export const updateTransaction = async (transactionId, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update transaction: ${error.message}`);
  return data;
};

export const createDeposit = async (depositData) => {
  const { data, error } = await supabase
    .from('deposits')
    .insert([depositData])
    .select()
    .single();

  if (error) throw new Error(`Failed to create deposit: ${error.message}`);
  return data;
};

export const uploadFile = async (bucket, filePath, fileBuffer, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false
    });

  if (error) throw new Error(`File upload failed: ${error.message}`);
  return data;
};

export const getFileUrl = async (bucket, filePath) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const logAdminAction = async (adminId, action, resourceId, resourceType, details) => {
  const { data, error } = await supabase
    .from('admin_logs')
    .insert([{
      admin_id: adminId,
      action,
      resource_id: resourceId,
      resource_type: resourceType,
      details: details || {}
    }])
    .select()
    .single();

  if (error) console.error('Failed to log admin action:', error.message);
  return data;
};
