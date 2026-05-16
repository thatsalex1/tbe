/**
 * TrustBridge Escrow - Buyer Dashboard
 */

// API_BASE_URL is defined in the HTML file before this script loads
const CONFIG = {
  BTC: { icon: '₿', label: 'Bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  ETH: { icon: 'Ξ', label: 'Ethereum', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
  USDC: { icon: '$', label: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  USDT: { icon: '$', label: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  LTC: { icon: 'Ł', label: 'Litecoin', address: 'LTC1qw508d6qejxtdg4y5r3zarvaryv3h0srluc9j3n' }
};

let currentUser = null;
let selectedCrypto = null;

// Initialize dashboard
async function initDashboard() {
  try {
    console.log('Initializing buyer dashboard...');

    // Get current user (already authenticated)
    const user = getCurrentUserSync();
    if (!user) {
      console.log('No authenticated user, redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    console.log('Current user:', user);

    // Check if user is a buyer
    if (user.role !== 'buyer') {
      console.log('User is not a buyer, redirecting to', user.role, '-dashboard.html');
      window.location.href = `${user.role}-dashboard.html`;
      return;
    }

    currentUser = user;

    // Load initial data
    await loadBalance();
    await loadTransactions();
    setupCryptoOptions();
    setupEventListeners();
  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    alert('Failed to load dashboard. Please refresh the page.');
  }
}

// Load and display balance
async function loadBalance() {
  try {
    const data = await apiCall('/balance');
    document.getElementById('availableBalance').textContent = formatCurrency(data.balance.available);
    document.getElementById('pendingBalance').textContent = formatCurrency(data.balance.pending);
    document.getElementById('totalBalance').textContent = formatCurrency(data.balance.total);
  } catch (error) {
    console.error('Failed to load balance:', error);
    // Fallback display when API is unavailable
    document.getElementById('availableBalance').textContent = '₦0.00';
    document.getElementById('pendingBalance').textContent = '₦0.00';
    document.getElementById('totalBalance').textContent = '₦0.00';
  }
}

// Load transactions
async function loadTransactions() {
  try {
    const data = await apiCall('/transactions?limit=10');
    const tbody = document.getElementById('transactionsBody');

    if (!data.transactions || data.transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-gray);">No transactions yet</td></tr>';
      return;
    }

    tbody.innerHTML = data.transactions.map(tx => `
      <tr>
        <td><strong>${tx.id}</strong></td>
        <td>${tx.seller_email || 'Pending'}</td>
        <td>₦${formatNumber(tx.amount)}</td>
        <td><span class="status-badge status-${getStatusClass(tx.status)}">${formatStatus(tx.status)}</span></td>
        <td>${formatDate(tx.created_at)}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load transactions:', error);
  }
}

// Setup crypto options
function setupCryptoOptions() {
  const container = document.getElementById('cryptoOptions');
  container.innerHTML = Object.entries(CONFIG).map(([key, value]) => `
    <div class="crypto-option" onclick="selectCrypto('${key}')">
      <div class="crypto-icon">${value.icon}</div>
      <div style="font-weight: 600; margin-bottom: 0.25rem;">${key}</div>
      <div style="font-size: 0.8rem; color: var(--text-gray);">${value.label}</div>
    </div>
  `).join('');
}

// Select crypto and show details
function selectCrypto(currency) {
  selectedCrypto = currency;
  const config = CONFIG[currency];

  document.getElementById('cryptoName').textContent = `${config.label} (${currency})`;
  document.getElementById('cryptoAddress').textContent = config.address;

  // Highlight selected
  document.querySelectorAll('.crypto-option').forEach(el => {
    el.style.borderColor = 'var(--border-color)';
    el.style.backgroundColor = 'var(--bg-dark)';
  });

  event.target.closest('.crypto-option').style.borderColor = 'var(--primary-color)';
  event.target.closest('.crypto-option').style.backgroundColor = 'rgba(212, 175, 55, 0.1)';

  // Update deposit form currency
  document.getElementById('depositCurrency').value = currency;
  document.getElementById('cryptoDetails').style.display = 'block';
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Address copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar navigation
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);
    });
  });

  // Deposit form
  document.getElementById('depositForm').addEventListener('submit', handleDepositSubmit);

  // Escrow form
  document.getElementById('escrowForm').addEventListener('submit', handleEscrowSubmit);
}

// Switch section
function switchSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

  // Show selected section
  document.getElementById(sectionId).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

  // Refresh data if needed
  if (sectionId === 'transactions') {
    loadTransactions();
  }
}

// Handle deposit submission
async function handleDepositSubmit(e) {
  e.preventDefault();

  const amount = document.getElementById('depositAmount').value;
  const currency = document.getElementById('depositCurrency').value;
  const txHash = document.getElementById('txHash').value;
  const screenshot = document.getElementById('screenshot').files[0];

  if (!amount || !currency || !txHash || !screenshot) {
    alert('Please fill all fields');
    return;
  }

  try {
    // Show loading
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    // Create deposit record
    const depositRes = await apiCall('/deposits', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(amount),
        currency,
        transaction_id_hash: txHash
      })
    });

    const depositId = depositRes.deposit.id;

    // Upload screenshot
    const formData = new FormData();
    formData.append('file', screenshot);
    formData.append('deposit_id', depositId);

    const token = localStorage.getItem('accessToken');
    const uploadRes = await fetch(`${API_BASE_URL}/upload/screenshot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadRes.ok) {
      throw new Error('Upload failed');
    }

    alert('✅ Deposit submitted successfully! Admin will review and confirm within 24 hours.');
    document.getElementById('depositForm').reset();
    document.getElementById('cryptoDetails').style.display = 'none';
    await loadBalance();

    btn.textContent = originalText;
    btn.disabled = false;
  } catch (error) {
    console.error('Deposit error:', error);
    alert(`❌ Error: ${error.message}`);
    const btn = e.target.querySelector('button');
    btn.textContent = 'Submit Deposit';
    btn.disabled = false;
  }
}

// Handle escrow submission
async function handleEscrowSubmit(e) {
  e.preventDefault();

  const sellerEmail = document.getElementById('sellerEmail').value;
  const amount = document.getElementById('escrowAmount').value;

  if (!sellerEmail || !amount) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Creating Deal...';
    btn.disabled = true;

    const data = await apiCall('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        seller_email: sellerEmail,
        amount: parseFloat(amount)
      })
    });

    alert(`✅ Escrow deal created!\n\nTransaction ID: ${data.transaction.id}\nAmount: ₦${formatNumber(data.transaction.amount)}\n\nThe seller will be notified shortly.`);

    document.getElementById('escrowForm').reset();
    await loadBalance();
    await loadTransactions();
    switchSection('transactions');

    btn.textContent = originalText;
    btn.disabled = false;
  } catch (error) {
    console.error('Escrow error:', error);
    alert(`❌ Error: ${error.message}`);
    const btn = e.target.querySelector('button');
    btn.textContent = 'Create Escrow Deal';
    btn.disabled = false;
  }
}

// Utility functions
function formatCurrency(amount) {
  return `₦${formatNumber(amount)}`;
}

function formatNumber(num) {
  return parseFloat(num).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatus(status) {
  const statuses = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'awaiting_funding': 'Awaiting Funding',
    'funds_pending': 'Funds Pending',
    'in_authentication': 'In Authentication',
    'completed': 'Completed'
  };
  return statuses[status] || status;
}

function getStatusClass(status) {
  if (status === 'pending' || status === 'awaiting_funding' || status === 'funds_pending') return 'pending';
  if (status === 'confirmed' || status === 'in_authentication') return 'in-auth';
  if (status === 'completed') return 'completed';
  return 'pending';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
