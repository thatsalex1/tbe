import { getDatabase } from '../db.js';

export const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing or invalid authorization header',
          status: 401
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const supabase = getDatabase();

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired token',
          status: 401
        }
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@trustbridge.local';

  if (req.user?.email !== adminEmail) {
    return res.status(403).json({
      error: {
        message: 'Admin access required',
        status: 403
      }
    });
  }

  next();
};

// Middleware to attach current user
export const attachUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized',
        status: 401
      }
    });
  }
  next();
};
