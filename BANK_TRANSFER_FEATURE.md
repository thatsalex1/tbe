# Bank Transfer Request Feature - Complete Guide

## Overview

Users can now request bank transfer deposit details via email. The system automatically opens their email client with a pre-filled message to your email address.

---

## How It Works

### User Flow:

1. **User selects Bank Transfer**
   - Clicks "🏦 Bank Transfer" on deposits page

2. **Request Form Appears**
   - Shows message: "Request bank details via email"
   - Input field for deposit amount in Naira (₦)
   - Button: "📧 Request Bank Details via Email"

3. **User Enters Amount**
   - Example: ₦50,000
   - Validates minimum amount

4. **User Clicks Request Button**
   - Email client opens automatically
   - Pre-filled email to: **legacyholdescrow@gmail.com**
   - Pre-filled subject: "Bank Transfer Request - LegacyHoldEscrow"
   - Pre-filled body includes:
     - User email
     - User name
     - Requested amount
     - Request timestamp

5. **User Reviews & Sends**
   - User reviews the email in their email client
   - User clicks Send
   - Email goes to legacyholdescrow@gmail.com

6. **Admin Receives Request**
   - Email arrives with user's bank transfer request
   - Admin replies with bank account details
   - User receives bank details via email reply

7. **User Makes Transfer**
   - User transfers funds to provided bank account
   - User returns to dashboard
   - User submits transaction details (Amount + Transaction ID)

---

## Email Template

When user clicks "Request Bank Details", this email is generated:

```
To: legacyholdescrow@gmail.com
Subject: Bank Transfer Request - LegacyHoldEscrow

---

Hello LegacyHoldEscrow Team,

I would like to make a bank transfer deposit to my LegacyHoldEscrow account.

DEPOSIT REQUEST DETAILS:
========================================
User Email: testbuyer@example.com
User Name: Test Buyer
Requested Amount: ₦50,000.00
Request Time: 5/14/2026, 2:30:45 PM

Please send me the bank account details where I should transfer the funds.

Thank you,
Test Buyer
```

---

## Testing the Feature

### Step 1: Navigate to Deposits
1. Go to Buyer Dashboard
2. Click "Deposits" in sidebar

### Step 2: Select Bank Transfer
1. Click "🏦 Bank Transfer" card
2. See request form appear

### Step 3: Enter Amount
1. Click on amount input field
2. Enter: `50000`
3. Verify value appears

### Step 4: Send Email Request
1. Click "📧 Request Bank Details via Email"
2. Your default email client should open
3. Review the pre-filled email
4. Click Send

### Step 5: Verify Email
1. Check legacyholdescrow@gmail.com inbox (or where configured)
2. Should see request from user
3. Reply with bank details
4. User receives bank details

### Step 6: Submit Deposit
After receiving bank details from email:
1. Return to deposits page
2. Select "Bank Transfer" again
3. (Optional) Enter transfer amount
4. Fill in Transaction ID (from bank receipt)
5. Click "Submit Deposit"
6. Deposit appears as "Pending"

---

## Key Features

### ✅ Automatic Email Generation
- Pre-fills user information
- Includes requested amount
- Includes timestamp
- Professional formatting

### ✅ Validation
- Requires amount > 0
- Shows error if invalid amount
- Validates before opening email

### ✅ User Experience
- Opens default email client
- Pre-filled subject and body
- User can review before sending
- User can modify if needed

### ✅ Tracking
- Request saved to database (optional)
- Stores user, amount, timestamp
- Allows admin to track requests
- Status tracking (pending/responded/completed)

### ✅ Professional Design
- Clear instructions
- Info boxes with processing times
- Helpful tips on how it works
- Visual hierarchy

---

## Implementation Details

### Database Table (Optional)

If you want to track bank transfer requests:

```sql
CREATE TABLE bank_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);
```

### Email Configuration

Email is sent to: **legacyholdescrow@gmail.com**

To change email address, edit in `buyer-dashboard-enhanced.js`:
```javascript
const mailtoLink = `mailto:legacyholdescrow@gmail.com?subject=...`;
```

Change to:
```javascript
const mailtoLink = `mailto:your-email@domain.com?subject=...`;
```

---

## User-Facing Instructions

Display to users:

> **📧 Bank Transfer via Email**
> 
> 1. Enter your desired deposit amount
> 2. Click "Request Bank Details"
> 3. Your email client will open with a pre-filled message
> 4. Review and send the email
> 5. We'll reply within 2 hours with our bank account details
> 6. Send the funds to the provided account
> 7. Submit your transaction ID to confirm the deposit
> 
> **Processing Times:**
> - Request response: < 2 hours
> - Fund transfer: 24-48 hours
> - Account credit: Upon verification

---

## Admin Instructions

When you receive a bank transfer request email:

### Step 1: Receive Request
You'll get an email like:
```
From: user@email.com
Subject: Bank Transfer Request - LegacyHoldEscrow

User Email: testbuyer@example.com
User Name: Test Buyer
Requested Amount: ₦50,000.00
```

### Step 2: Reply with Bank Details
Send reply with:
```
Account Name: LegacyHoldEscrow Escrow Ltd
Account Number: 0123456789
Bank Name: First Bank Nigeria
Bank Code: 011
Swift Code: FBNGNGLA

Note: The user will submit a deposit record with transaction ID 
after they make the transfer. Please verify and approve.
```

### Step 3: Wait for Deposit Submission
User will submit deposit record with:
- Amount
- Transaction ID from bank receipt
- Status: Pending

### Step 4: Verify & Approve
1. Check Supabase deposits table
2. Verify amount matches request
3. Change status from "pending" to "confirmed"
4. Add to user's available_balance

---

## Security Considerations

### ✅ What's Secure
- User authentication required
- Email contains no sensitive info (just request)
- User's own email client used (not our system)
- User controls what they send
- No direct payment processing

### ⚠️ What to Monitor
- Bank details should only be sent via direct email reply
- Don't put bank details in publicly viewable areas
- Verify user identity before sending bank details
- Keep bank account info updated

### 🔒 Best Practices
- Only admins should see bank account details
- Verify deposits before crediting accounts
- Log all bank transfer requests
- Monitor for suspicious patterns

---

## Troubleshooting

### Issue: Email client doesn't open
**Solution:**
- User may not have default email client configured
- Alternative: Display bank details on request form
- Ask user to manually email: legacyholdescrow@gmail.com

### Issue: Email looks corrupted
**Cause:** Browser encoding issue
**Solution:** Email still contains correct information, user can fix formatting

### Issue: Amount not showing in email
**Cause:** JavaScript not executing
**Solution:** Check browser console for errors, verify JavaScript loaded

### Issue: User forgets what they requested
**Solution:** Email is saved in Sent folder, user can review
**Better:** Add confirmation page before closing form

---

## Future Enhancements

### Phase 2 - Enhanced Tracking:
- Create bank_transfer_requests table
- Store all requests in database
- Admin dashboard shows pending requests
- Admin can see request history

### Phase 3 - In-App Bank Details:
- Display bank details directly on form (not via email)
- Copy account number button
- QR code for quick reference
- Request still sent to admin for tracking

### Phase 4 - Automated Responses:
- Autoresponder for bank details request
- Automatic email reply with bank info
- No admin action needed for initial request
- Admin still verifies deposits

---

## Configuration

### Email Address
File: `js/buyer-dashboard-enhanced.js`
Line: `const mailtoLink = `mailto:legacyholdescrow@gmail.com...`

Change to your email address.

### Amount Validation
File: `js/buyer-dashboard-enhanced.js`
Line: `min="10000"` in amount input

Change to your minimum deposit amount.

### Processing Times
File: `js/buyer-dashboard-enhanced.js`
Update these in the info box:
```javascript
// Bank details request: < 2 hours
// Fund transfer: 24-48 hours
```

---

## Summary

Users can now easily request bank transfer details:

✅ **Easy:** One-click email request
✅ **Transparent:** Users see exactly what's sent
✅ **Flexible:** Can edit email before sending
✅ **Trackable:** Email with timestamp
✅ **Professional:** Pre-formatted message
✅ **Secure:** Uses user's own email client

---

## Next Steps

1. **Test the feature:**
   - Go to deposits
   - Select bank transfer
   - Enter amount
   - Click request button
   - Verify email opens

2. **Set up email receiving:**
   - Monitor legacyholdescrow@gmail.com
   - Create email template for bank details
   - Keep response time < 2 hours

3. **Monitor requests:**
   - Track incoming emails
   - Log requests in spreadsheet (or database)
   - Verify deposits when submitted

4. **Optimize process:**
   - Consider auto-responder
   - Consider in-app bank details display
   - Consider approval automation

---

## Support

Users should:
1. Check spam/promotions folder for email
2. Verify email was sent to correct address
3. Contact support if email client doesn't open
4. Resend request manually if needed

Email template is available in browser console logs for debugging.
