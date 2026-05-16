/**
 * Buyer Dashboard Enhanced
 * Handles deposits, balances, and escrow transactions
 */

// Current selected deposit method
let selectedDepositMethod = null;
let isSubmittingDeposit = false;

/**
 * Initialize the dashboard on page load
 */
async function initializeDashboard() {
  console.log('🚀 Initializing buyer dashboard');

  const user = requireAuth();
  if (!user || user.role !== 'buyer') {
    console.error('User is not a buyer');
    window.location.href = './login.html';
    return;
  }

  // Display user info
  displayUserInfo(user);

  // Load and display balance
  await loadBalance();

  // Load and display deposits
  await loadDeposits();

  // Setup form listeners
  setupFormListeners();

  console.log('✓ Dashboard initialized');
}

/**
 * Display user information
 */
function displayUserInfo(user) {
  const emailElement = document.getElementById('userEmail');
  if (emailElement) {
    emailElement.textContent = user.full_name || user.email;
  }
  console.log('User info displayed:', user.email);
}

/**
 * Load and display user balance
 */
async function loadBalance() {
  try {
    console.log('📊 Loading balance...');
    const balance = await getUserBalance();

    const availableEl = document.getElementById('availableBalance');
    const pendingEl = document.getElementById('pendingBalance');
    const totalEl = document.getElementById('totalBalance');

    if (availableEl) availableEl.textContent = formatCurrency(balance.available);
    if (pendingEl) pendingEl.textContent = formatCurrency(balance.pending);
    if (totalEl) totalEl.textContent = formatCurrency(balance.total);

    console.log('✓ Balance loaded:', balance);
  } catch (error) {
    console.error('Error loading balance:', error);
  }
}

/**
 * Load and display deposits
 */
async function loadDeposits() {
  try {
    console.log('📋 Loading deposits...');
    const deposits = await getUserDeposits(10);

    const depositsBody = document.getElementById('depositsBody');
    if (!depositsBody) return;

    if (deposits.length === 0) {
      depositsBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-gray); padding: 2rem;">
            No deposits yet. Make your first deposit to start!
          </td>
        </tr>
      `;
      return;
    }

    depositsBody.innerHTML = deposits.map(deposit => `
      <tr>
        <td>${formatDate(deposit.created_at)}</td>
        <td>${getCurrencySymbol(deposit.currency)}</td>
        <td>${formatCurrency(deposit.amount)}</td>
        <td>
          <span class="status-badge status-${getStatusClass(deposit.status)}">
            ${formatStatus(deposit.status)}
          </span>
        </td>
      </tr>
    `).join('');

    console.log('✓ Deposits loaded:', deposits.length);
  } catch (error) {
    console.error('Error loading deposits:', error);
  }
}

/**
 * Select a deposit method
 */
function selectDeposit(method) {
  selectedDepositMethod = method;
  console.log('📱 Selected deposit method:', method);

  const depositInfo = {
    bitcoin: {
      title: '₿ Bitcoin Deposit',
      desc: 'Send Bitcoin to the address below. Transaction confirms on-chain within minutes.',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      currency: 'BTC'
    },
    ethereum: {
      title: 'Ξ Ethereum Deposit',
      desc: 'Send Ethereum (ETH) to this address. Check gas fees before sending.',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      currency: 'ETH'
    },
    usdc: {
      title: '$ USD Coin Deposit',
      desc: 'USDC stablecoin on Ethereum network. 1 USDC = $1 USD.',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      currency: 'USDC'
    },
    usdt: {
      title: '≈ Tether Deposit',
      desc: 'USDT stablecoin with minimal volatility. Fast and reliable.',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      currency: 'USDT'
    },
    bank: {
      title: '🏦 Bank Transfer',
      desc: 'Request bank details via email. We will send you our account information.',
      currency: 'BANK'
    },
    card: {
      title: '💳 Credit/Debit Card',
      desc: 'Instant deposit via credit/debit card. Small transaction fee applies.',
      currency: 'CARD'
    }
  };

  const info = depositInfo[method];
  if (!info) {
    console.error('Unknown deposit method:', method);
    return;
  }

  // Update display
  document.getElementById('depositTitle').textContent = info.title;
  document.getElementById('depositDesc').textContent = info.desc;
  document.getElementById('selectedDeposit').style.display = 'block';

  // Clear previous selections
  document.getElementById('cryptoAddress').style.display = 'none';
  document.getElementById('bankDetails').style.display = 'none';
  document.getElementById('bankRequestSection').style.display = 'none';
  document.getElementById('depositForm').style.display = 'none';

  // Show appropriate form
  if (info.address) {
    // Crypto address
    document.getElementById('cryptoAddress').style.display = 'flex';
    document.getElementById('addressText').textContent = info.address;
    document.getElementById('depositForm').style.display = 'block';

    // Store currency in form for submission
    document.getElementById('depositForm').dataset.currency = info.currency;
  } else if (method === 'bank') {
    // Bank transfer request
    showBankTransferRequest();
  } else if (method === 'card') {
    // Card payment
    document.getElementById('depositForm').style.display = 'block';
    document.getElementById('depositForm').dataset.currency = 'CARD';
  }

  // Scroll to form
  document.getElementById('selectedDeposit').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show bank transfer request form
 */
function showBankTransferRequest() {
  const user = getCurrentUserSync();
  const bankRequestSection = document.getElementById('bankRequestSection');

  if (!bankRequestSection) {
    console.error('Bank request section not found');
    return;
  }

  // Clear previous content
  bankRequestSection.innerHTML = `
    <div style="background-color: var(--bg-dark); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin: 1rem 0;">
      <h4 style="color: var(--primary-color); margin-top: 0;">📧 Step 1: Request Bank Details</h4>
      <p style="color: var(--text-gray); margin-bottom: 1.5rem;">
        Click the button below to send a bank transfer request. We'll email you our account details within 2 hours.
      </p>

      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label for="bankRequestAmount">Deposit Amount (₦)</label>
        <input type="number" id="bankRequestAmount" placeholder="Enter amount in Naira" min="10000" step="1000" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--bg-darker); color: var(--text-light);">
      </div>

      <button onclick="requestBankDetails()" style="width: 100%; padding: 0.75rem; background-color: var(--primary-color); color: var(--bg-dark); border: none; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
        📧 Request Bank Details via Email
      </button>

      <div style="background-color: rgba(41, 167, 245, 0.1); border: 1px solid rgba(41, 167, 245, 0.3); border-radius: 4px; padding: 1rem; margin-top: 1rem;">
        <p style="color: var(--text-gray); font-size: 0.9rem; margin: 0;">
          <strong>ℹ️ How it works:</strong><br>
          1. Enter your desired deposit amount<br>
          2. Click "Request Bank Details"<br>
          3. Your email client will open with a pre-filled message<br>
          4. Review and send the email<br>
          5. We'll reply within 2 hours with our bank details<br>
          6. Send the funds to the provided account<br>
          7. Fill in Step 2 below to submit your transaction ID
        </p>
      </div>
    </div>

    <div style="background-color: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 4px; padding: 1rem; margin-top: 1rem;">
      <p style="color: var(--text-gray); font-size: 0.9rem; margin: 0;">
        <strong>⏱️ Processing Time:</strong><br>
        • Bank details request: &lt; 2 hours<br>
        • Fund transfer: 24-48 hours<br>
        • Account credit: Upon confirmation
      </p>
    </div>

    <div style="background-color: var(--bg-dark); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin: 2rem 0;">
      <h4 style="color: var(--primary-color); margin-top: 0;">✅ Step 2: Submit Your Transaction Details</h4>
      <p style="color: var(--text-gray); margin-bottom: 1.5rem;">
        After you've sent the funds, fill in your transaction details below.
      </p>

      <form id="bankDepositForm" onsubmit="handleBankDepositSubmit(event)" style="display: block;">
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label for="bankDepositAmount">Deposit Amount (₦)</label>
          <input type="number" id="bankDepositAmount" placeholder="Enter amount sent" min="10000" step="1000" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--bg-darker); color: var(--text-light);" required>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label for="bankTransactionRef">Transaction Reference / Reference ID</label>
          <input type="text" id="bankTransactionRef" placeholder="Enter your bank transaction ID/reference number" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--bg-darker); color: var(--text-light);" required>
        </div>

        <button type="submit" style="width: 100%; padding: 0.75rem; background-color: var(--primary-color); color: var(--bg-dark); border: none; border-radius: 4px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
          ✓ Submit Bank Deposit
        </button>
      </form>

      <div style="background-color: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.3); border-radius: 4px; padding: 1rem; margin-top: 1rem;">
        <p style="color: var(--text-gray); font-size: 0.9rem; margin: 0;">
          <strong>✓ What to include:</strong><br>
          • The exact amount you transferred<br>
          • Your bank transaction reference/ID<br>
          • We'll verify and credit your account within 24 hours
        </p>
      </div>
    </div>
  `;

  bankRequestSection.style.display = 'block';
}

/**
 * Handle bank deposit submission (after sending funds)
 */
async function handleBankDepositSubmit(e) {
  e.preventDefault();

  if (isSubmittingDeposit) {
    console.log('⏳ Deposit already being submitted...');
    return;
  }

  const form = e.target;
  const amount = document.getElementById('bankDepositAmount').value;
  const transactionRef = document.getElementById('bankTransactionRef').value;

  if (!amount || parseFloat(amount) <= 0) {
    showNotification('Please enter a valid amount', 'error');
    return;
  }

  if (!transactionRef || transactionRef.trim() === '') {
    showNotification('Please enter your transaction reference ID', 'error');
    return;
  }

  isSubmittingDeposit = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    console.log('📤 Submitting bank deposit...');

    const depositData = {
      amount: parseFloat(amount),
      currency: 'BANK',
      transactionId: transactionRef,
      notes: 'Bank transfer deposit'
    };

    const result = await createDeposit(depositData);

    console.log('✓ Bank deposit created:', result);
    showNotification('✓ Bank deposit submitted successfully! Admin will verify within 24 hours.', 'success');

    // Reset form
    form.reset();
    document.getElementById('bankRequestAmount').value = '';
    document.getElementById('bankDepositAmount').value = '';
    document.getElementById('bankTransactionRef').value = '';

    // Reload deposits
    await loadDeposits();
    await loadBalance();

  } catch (error) {
    console.error('✗ Bank deposit submission error:', error);
    showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isSubmittingDeposit = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/**
 * Request bank details via email
 */
async function requestBankDetails() {
  const user = getCurrentUserSync();
  const amountInput = document.getElementById('bankRequestAmount');
  const amount = amountInput.value;

  if (!amount || parseFloat(amount) <= 0) {
    showNotification('Please enter a valid amount', 'error');
    return;
  }

  // Create bank transfer request in Supabase
  try {
    console.log('📧 Creating bank transfer request...');

    const requestData = {
      user_id: user.id,
      user_email: user.email,
      user_name: user.full_name,
      amount: parseFloat(amount),
      status: 'pending',
      requested_at: new Date().toISOString()
    };

    // Insert into Supabase if table exists, otherwise just create email
    try {
      const { data, error } = await supabase
        .from('bank_transfer_requests')
        .insert([requestData])
        .select();

      if (error && error.code === '42P01') {
        // Table doesn't exist, that's OK
        console.log('Bank transfer requests table not found, creating via email only');
      } else if (error) {
        console.warn('Could not save to database:', error);
      } else {
        console.log('✓ Bank transfer request saved');
      }
    } catch (dbError) {
      console.log('Database error (non-critical):', dbError);
    }

    // Create email body
    const emailSubject = 'Bank Transfer Request - LegacyHoldEscrow';
    const emailBody = `
Hello LegacyHoldEscrow Team,

I would like to make a bank transfer deposit to my LegacyHoldEscrow account.

DEPOSIT REQUEST DETAILS:
========================================
User Email: ${user.email}
User Name: ${user.full_name}
Requested Amount: ₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Request Time: ${new Date().toLocaleString()}

Please send me the bank account details where I should transfer the funds.

Thank you,
${user.full_name}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:legacyholdescrow@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    console.log('🔗 Opening email client...');
    console.log('Email to: legacyholdescrow@gmail.com');
    console.log('Subject:', emailSubject);

    // Open default email client
    window.location.href = mailtoLink;

    // Show notification
    showNotification('✓ Opening your email client. Please review and send the bank details request.', 'success');

    // Clear form
    amountInput.value = '';

  } catch (error) {
    console.error('Error creating bank request:', error);
    showNotification('Error: Could not create bank request', 'error');
  }
}

/**
 * Copy address to clipboard
 */
function copyAddress() {
  const address = document.getElementById('addressText').textContent;
  navigator.clipboard.writeText(address).then(() => {
    showNotification('✓ Address copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy address', 'error');
  });
}

/**
 * Submit deposit form
 */
async function handleDepositSubmit(e) {
  e.preventDefault();

  if (isSubmittingDeposit) {
    console.log('⏳ Deposit already being submitted...');
    return;
  }

  const form = e.target;
  const amount = document.getElementById('depositAmount').value;
  const transactionId = document.getElementById('transactionId').value;
  const currency = form.dataset.currency || 'BANK';

  if (!amount || parseFloat(amount) <= 0) {
    showNotification('Please enter a valid amount', 'error');
    return;
  }

  if (!transactionId && currency !== 'CARD') {
    showNotification('Please enter transaction ID or reference', 'error');
    return;
  }

  isSubmittingDeposit = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    console.log('📤 Submitting deposit...');

    const depositData = {
      amount: parseFloat(amount),
      currency: currency,
      transactionId: transactionId || null,
      notes: `Submitted via ${selectedDepositMethod} method`
    };

    const result = await createDeposit(depositData);

    console.log('✓ Deposit created:', result);
    showNotification('✓ Deposit submitted successfully! Admin will verify within 24 hours.', 'success');

    // Reset form
    form.reset();
    document.getElementById('selectedDeposit').style.display = 'none';
    document.getElementById('depositAmount').value = '';
    document.getElementById('transactionId').value = '';

    // Reload deposits
    await loadDeposits();
    await loadBalance();

  } catch (error) {
    console.error('✗ Deposit submission error:', error);
    showNotification(`Error: ${error.message}`, 'error');
  } finally {
    isSubmittingDeposit = false;
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

/**
 * Switch sections
 */
function switchSection(sectionId) {
  console.log('Switching to section:', sectionId);

  document.querySelectorAll('.section').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');

  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

  // Scroll to top
  document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Logout
 */
function logoutClick() {
  if (confirm('Are you sure you want to logout?')) {
    logout();
  }
}

/**
 * Setup form listeners
 */
function setupFormListeners() {
  const depositForm = document.getElementById('depositForm');
  if (depositForm) {
    depositForm.addEventListener('submit', handleDepositSubmit);
  }

  // Sidebar navigation
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section');
      switchSection(sectionId);
    });
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Create a simple alert (you can enhance this with a toast notification)
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
    color: white;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Get currency symbol
 */
function getCurrencySymbol(currency) {
  const symbols = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'USDC': '$',
    'USDT': '≈',
    'BANK': '🏦',
    'CARD': '💳'
  };
  return symbols[currency] || currency;
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
});
