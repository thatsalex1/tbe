/**
 * TrustBridge Escrow - Seller Dashboard
 */

// API_BASE_URL is defined in the HTML file before this script loads
let currentUser = null;

// Initialize dashboard
async function initDashboard() {
  try {
    console.log('Initializing seller dashboard...');

    // Get current user (already authenticated)
    const user = getCurrentUserSync();
    if (!user) {
      console.log('No authenticated user, redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    console.log('Current user:', user);

    // Check if user is a seller
    if (user.role !== 'seller') {
      console.log('User is not a seller, redirecting to', user.role, '-dashboard.html');
      window.location.href = `${user.role}-dashboard.html`;
      return;
    }

    currentUser = user;

    await loadBalance();
    await loadSales();
    await loadWithdrawals();
    setupEventListeners();
  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    alert('Failed to load dashboard. Please refresh the page.');
  }
}

// Load balance
async function loadBalance() {
  try {
    const data = await apiCall('/balance');
    document.getElementById('availableBalance').textContent = formatCurrency(data.balance.available);
    document.getElementById('pendingBalance').textContent = formatCurrency(data.balance.pending);
    document.getElementById('totalBalance').textContent = formatCurrency(data.balance.total);
    document.getElementById('maxAmount').textContent = `Available: ₦${formatNumber(data.balance.available)}`;
  } catch (error) {
    console.error('Failed to load balance:', error);
    // Fallback display when API is unavailable
    document.getElementById('availableBalance').textContent = '₦0.00';
    document.getElementById('pendingBalance').textContent = '₦0.00';
    document.getElementById('totalBalance').textContent = '₦0.00';
    if (document.getElementById('maxAmount')) {
      document.getElementById('maxAmount').textContent = 'Available: ₦0.00';
    }
  }
}

// Load pending sales
async function loadSales() {
  try {
    const data = await apiCall('/transactions?limit=20');
    const tbody = document.getElementById('salesBody');

    // Filter transactions where user is seller
    const sales = (data.transactions || []).filter(tx => tx.is_seller && tx.status !== 'completed');

    if (sales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-gray);">No pending sales</td></tr>';
      return;
    }

    tbody.innerHTML = sales.map(tx => `
      <tr>
        <td><strong>${tx.id}</strong></td>
        <td>${tx.buyer?.full_name || 'Unknown'}</td>
        <td>₦${formatNumber(tx.amount)}</td>
        <td><span class="status-badge status-${getStatusClass(tx.status)}">${formatStatus(tx.status)}</span></td>
        <td>${formatDate(tx.created_at)}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load sales:', error);
  }
}

// Load withdrawals
async function loadWithdrawals() {
  try {
    const data = await apiCall('/withdrawals?limit=10');
    const tbody = document.getElementById('withdrawalHistoryBody');

    if (!data.withdrawals || data.withdrawals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-gray);">No withdrawals yet</td></tr>';
      return;
    }

    tbody.innerHTML = data.withdrawals.map(w => `
      <tr>
        <td>₦${formatNumber(w.amount)}</td>
        <td><span class="status-badge status-${w.status}">${formatWithdrawalStatus(w.status)}</span></td>
        <td>${formatDate(w.requested_at)}</td>
        <td>${w.paid_at ? formatDate(w.paid_at) : '-'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load withdrawals:', error);
  }
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

  // Withdrawal form
  document.getElementById('withdrawForm').addEventListener('submit', handleWithdrawalSubmit);
}

// Switch section
function switchSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

  document.getElementById(sectionId).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

  if (sectionId === 'sales') {
    loadSales();
  } else if (sectionId === 'withdraw') {
    loadWithdrawals();
  }
}

// Handle withdrawal submission
async function handleWithdrawalSubmit(e) {
  e.preventDefault();

  const amount = document.getElementById('withdrawAmount').value;

  if (!amount || parseFloat(amount) <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  try {
    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    const data = await apiCall('/withdrawals', {
      method: 'POST',
      body: JSON.stringify({ amount: parseFloat(amount) })
    });

    alert('✅ Withdrawal request submitted!\n\nAdmin will process it within 24 hours.');
    document.getElementById('withdrawForm').reset();
    await loadBalance();
    await loadWithdrawals();

    btn.textContent = originalText;
    btn.disabled = false;
  } catch (error) {
    console.error('Withdrawal error:', error);
    alert(`❌ Error: ${error.message}`);
    const btn = e.target.querySelector('button');
    btn.textContent = 'Request Withdrawal';
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
    day: 'numeric'
  });
}

function formatStatus(status) {
  const statuses = {
    'awaiting_funding': 'Awaiting Funding',
    'funds_pending': 'Funds Pending',
    'in_authentication': 'In Authentication',
    'completed': 'Completed'
  };
  return statuses[status] || status;
}

function formatWithdrawalStatus(status) {
  const statuses = {
    'pending': 'Pending',
    'paid': 'Paid',
    'rejected': 'Rejected'
  };
  return statuses[status] || status;
}

function getStatusClass(status) {
  if (status === 'awaiting_funding' || status === 'funds_pending') return 'pending';
  if (status === 'in_authentication') return 'in-auth';
  return 'pending';
}

document.addEventListener('DOMContentLoaded', initDashboard);
