import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Hardcoded admin credentials - should be changed in production
// In production, store this in environment variables with hashed passwords
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password_hash: process.env.ADMIN_PASSWORD_HASH || hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
  id: 'admin-001'
};

// Simple password hashing function (for demo - use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate admin session token
function generateAdminToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /admin/login
 * Admin login with username and password
 * Body: { username, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: {
          message: 'Username and password are required'
        }
      });
    }

    // Verify credentials
    const passwordHash = hashPassword(password);
    if (username !== ADMIN_CREDENTIALS.username || passwordHash !== ADMIN_CREDENTIALS.password_hash) {
      return res.status(401).json({
        error: {
          message: 'Invalid admin credentials'
        }
      });
    }

    // Generate session token
    const token = generateAdminToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    res.json({
      success: true,
      message: 'Admin login successful',
      token: token,
      admin: {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username
      },
      expires_at: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: {
        message: 'Login failed',
        details: error.message
      }
    });
  }
});

/**
 * POST /admin/logout
 * Admin logout
 */
router.post('/logout', (req, res) => {
  // In this simple implementation, we just return success
  // The client deletes the token from localStorage
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /admin/verify
 * Verify admin token is valid
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'No admin token provided'
        }
      });
    }

    // In production, check token against a database/cache
    // For now, we just verify it's a valid hex string of correct length
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(401).json({
        error: {
          message: 'Invalid admin token'
        }
      });
    }

    res.json({
      success: true,
      admin: {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: {
        message: 'Token verification failed'
      }
    });
  }
});

export default router;
