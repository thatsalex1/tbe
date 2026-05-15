import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { verifySupabaseToken } from '../middleware/auth.js';
import { getDatabase } from '../db.js';

const router = express.Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, PDF'));
    }
  }
});

/**
 * POST /api/upload/screenshot
 * Upload payment screenshot to Supabase Storage
 * Body: FormData with file and deposit_id
 */
router.post('/screenshot', verifySupabaseToken, upload.single('file'), async (req, res) => {
  try {
    const { deposit_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'No file provided'
        }
      });
    }

    if (!deposit_id) {
      return res.status(400).json({
        error: {
          message: 'Missing deposit_id'
        }
      });
    }

    const supabase = getDatabase();

    // Verify deposit belongs to user
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', deposit_id)
      .eq('user_id', req.user.id)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({
        error: {
          message: 'Deposit not found or does not belong to you'
        }
      });
    }

    // Generate unique filename
    const ext = req.file.originalname.split('.').pop();
    const filename = `${deposit_id}_${uuidv4()}.${ext}`;
    const filePath = `deposits/${req.user.id}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Update deposit record with screenshot URL
    const { data: updatedDeposit, error: updateError } = await supabase
      .from('deposits')
      .update({
        screenshot_url: fileUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', deposit_id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Screenshot uploaded successfully. Awaiting admin confirmation.',
      deposit: {
        id: updatedDeposit.id,
        screenshot_url: updatedDeposit.screenshot_url,
        status: updatedDeposit.status
      }
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({
      error: {
        message: 'Failed to upload file',
        details: err.message
      }
    });
  }
});

/**
 * GET /api/upload/screenshot/:deposit_id
 * Download payment screenshot (admin only)
 */
router.get('/screenshot/:deposit_id', verifySupabaseToken, async (req, res) => {
  try {
    const { deposit_id } = req.params;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trustbridge.local';

    // Check if user is admin
    if (req.user.email !== adminEmail) {
      return res.status(403).json({
        error: {
          message: 'Admin access required'
        }
      });
    }

    const supabase = getDatabase();

    // Get deposit
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('screenshot_url')
      .eq('id', deposit_id)
      .single();

    if (error || !deposit || !deposit.screenshot_url) {
      return res.status(404).json({
        error: {
          message: 'Screenshot not found'
        }
      });
    }

    // Redirect to signed URL (if needed) or return URL
    res.json({
      success: true,
      screenshot_url: deposit.screenshot_url
    });
  } catch (err) {
    console.error('Error retrieving screenshot:', err);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve screenshot',
        details: err.message
      }
    });
  }
});

export default router;
