import express from 'express';
import { verifySupabaseToken } from '../middleware/auth.js';
import { getDatabase } from '../db.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', verifySupabaseToken, async (req, res) => {
  try {
    const supabase = getDatabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User doesn't exist in database yet
        return res.status(404).json({
          error: {
            message: 'User profile not found. Please complete signup.',
            code: 'USER_NOT_FOUND'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        available_balance: user.available_balance,
        pending_balance: user.pending_balance,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({
      error: {
        message: 'Failed to fetch user profile',
        details: err.message
      }
    });
  }
});

/**
 * POST /api/auth/signup
 * Create new account with email and password
 * Body: { email, password, full_name, phone, role }
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name || !role || !['buyer', 'seller'].includes(role)) {
      return res.status(400).json({
        error: {
          message: 'Missing or invalid required fields: email, password, full_name, role'
        }
      });
    }

    const supabase = getDatabase();

    // Create user account with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/index.html`
      }
    });

    if (authError) {
      return res.status(400).json({
        error: {
          message: authError.message
        }
      });
    }

    // Create user profile record
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email,
        full_name,
        phone: phone || null,
        role,
        available_balance: 0,
        pending_balance: 0
      }])
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '23505') {
        // Unique constraint violation (user already exists)
        return res.status(409).json({
          error: {
            message: 'User already registered'
          }
        });
      }
      throw dbError;
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Check your email to confirm.',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({
      error: {
        message: 'Failed to create account',
        details: err.message
      }
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: email, password'
        }
      });
    }

    const supabase = getDatabase();

    // Authenticate with Supabase
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password'
        }
      });
    }

    // Fetch user profile
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (dbError) {
      return res.status(404).json({
        error: {
          message: 'User profile not found'
        }
      });
    }

    res.json({
      success: true,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at
      },
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        available_balance: user.available_balance,
        pending_balance: user.pending_balance
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({
      error: {
        message: 'Failed to login',
        details: err.message
      }
    });
  }
});

export default router;
