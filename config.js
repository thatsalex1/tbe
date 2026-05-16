/**
 * TrustBridge Escrow - Configuration
 *
 * IMPORTANT: Replace placeholder addresses with real values before going live
 * These are test/placeholder addresses for development
 */

module.exports = {
  // Cryptocurrency wallet addresses (PLACEHOLDERS - REPLACE BEFORE DEPLOYMENT)
  CRYPTO_WALLETS: {
    BTC: {
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      label: "Bitcoin (BTC)",
      network: "Bitcoin",
      min_confirmation: "1"
    },
    ETH: {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      label: "Ethereum (ETH)",
      network: "Ethereum",
      min_confirmation: "12"
    },
    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      label: "USD Coin (USDC)",
      network: "Ethereum",
      min_confirmation: "12"
    },
    USDT: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      label: "Tether (USDT)",
      network: "Ethereum",
      min_confirmation: "12"
    },
    LTC: {
      address: "LTC1qw508d6qejxtdg4y5r3zarvaryv3h0srluc9j3n",
      label: "Litecoin (LTC)",
      network: "Litecoin",
      min_confirmation: "6"
    }
  },

  // Bank transfer details (PLACEHOLDERS - REPLACE BEFORE DEPLOYMENT)
  BANK_DETAILS: {
    bank_name: "First Bank of Nigeria",
    account_name: "TrustBridge Escrow Limited",
    account_number: "1234567890",
    account_type: "Business Savings",
    swift_code: "FBNINGLA",
    bank_code: "011",
    routing_number: "123456789",
    currency: "NGN",
    instructions: "Include transaction ID in transfer reference"
  },

  // Admin settings
  ADMIN: {
    // Hardcoded credentials for initial setup (CHANGE IMMEDIATELY)
    default_email: "admin@trustbridge.local",
    default_password_hash: "$2b$10$..." // Will be set in .env
  },

  // File upload settings
  UPLOAD: {
    max_file_size: 5 * 1024 * 1024, // 5MB
    allowed_types: ["image/jpeg", "image/png", "application/pdf"],
    storage_bucket: "payment-screenshots"
  },

  // Platform settings
  PLATFORM: {
    currency: "NGN",
    company_name: "TrustBridge Escrow",
    support_email: "support@trustbridge.local",
    support_phone: "+234 (0) 123 456 7890"
  }
};
