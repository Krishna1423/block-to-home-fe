// LoanContract Contract Configuration
// This file contains the ABI and contract addresses for the LoanContract

// LoanContract Contract ABI (matches actual contract)
export const LOAN_CONTRACT_ABI = [
  // Loan Management Functions
  {
    inputs: [
      { internalType: 'uint256', name: 'propertyTokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'interestRate', type: 'uint256' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
    ],
    name: 'createLoanRequest',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'getLoan',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'loanId', type: 'uint256' },
          { internalType: 'address', name: 'borrower', type: 'address' },
          { internalType: 'uint256', name: 'propertyTokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'fundedAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'interestRate', type: 'uint256' },
          { internalType: 'uint256', name: 'duration', type: 'uint256' },
          { internalType: 'uint256', name: 'monthlyPayment', type: 'uint256' },
          { internalType: 'uint256', name: 'totalOwed', type: 'uint256' },
          { internalType: 'uint256', name: 'amountPaid', type: 'uint256' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'uint256', name: 'fundedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'nextPaymentDue', type: 'uint256' },
          { internalType: 'uint8', name: 'status', type: 'uint8' }, // LoanStatus enum
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct LoanContract.Loan',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'borrower', type: 'address' }],
    name: 'getBorrowerLoans',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'getLoanFundingProgress',
    outputs: [
      { internalType: 'uint256', name: 'fundedAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'fundingPercentage', type: 'uint256' }, // in basis points (0-10000)
      { internalType: 'bool', name: 'isFunded', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'fundLoanFromPool',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'getLoanPayments',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'makePayment',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'loanId', type: 'uint256' }],
    name: 'liquidateCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { internalType: 'uint8', name: 'newStatus', type: 'uint8' },
    ],
    name: 'updateLoanStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'paymentId', type: 'uint256' }],
    name: 'payments',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'paymentId', type: 'uint256' },
          { internalType: 'uint256', name: 'loanId', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'address', name: 'payer', type: 'address' },
        ],
        internalType: 'struct LoanContract.Payment',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'propertyTokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'loanAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'interestRate', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' },
    ],
    name: 'LoanRequestCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'borrower', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'LoanFunded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'paymentId', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'PaymentMade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'LoanCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'LoanDefaulted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'loanId', type: 'uint256' },
      { internalType: 'uint8', name: 'oldStatus', type: 'uint8' },
      { internalType: 'uint8', name: 'newStatus', type: 'uint8' },
    ],
    name: 'LoanStatusUpdated',
    type: 'event',
  },
] as const;

// LoanContract Contract Addresses for different chains
// Update these after deploying the contract to each chain
export const LOAN_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  // Mainnet
  1: '0x0000000000000000000000000000000000000000', // Ethereum Mainnet - NOT DEPLOYED YET
  // Polygon
  137: '0x0000000000000000000000000000000000000000', // Polygon - NOT DEPLOYED YET
  // Sepolia (testnet)
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia - NOT DEPLOYED YET
  // Polygon Amoy (testnet)
  80002: '0x0000000000000000000000000000000000000000', // Polygon Amoy - NOT DEPLOYED YET
  // Polkadot Hub TestNet (PolkaVM)
  420420422: '0x0000000000000000000000000000000000000000', // Polkadot Hub TestNet - NOT DEPLOYED YET
};

// Helper function to get LoanContract address for a chain
export const getLoanContractAddress = (chainId: number): `0x${string}` | undefined => {
  // First, check environment variables (for dynamic configuration)
  const envKey = `VITE_LOAN_CONTRACT_ADDRESS_${chainId}`;
  const envAddress = import.meta.env[envKey];
  
  if (envAddress) {
    return envAddress as `0x${string}`;
  }
  
  // Fallback to default addresses
  const address = LOAN_CONTRACT_ADDRESSES[chainId];
  
  // Return undefined if address is zero address (not deployed)
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return undefined;
  }
  
  return address;
};

// Loan Status Enum (matches smart contract)
export enum LoanStatus {
  PENDING = 0,
  OPEN = 1,
  FUNDED = 2,
  ACTIVE = 3,
  COMPLETED = 4,
  DEFAULTED = 5,
}

// Loan Data Type (matches smart contract struct)
export interface LoanData {
  loanId: bigint;
  borrower: `0x${string}`;
  propertyTokenId: bigint;
  loanAmount: bigint; // in USDT (6 decimals)
  fundedAmount: bigint; // in USDT (6 decimals)
  interestRate: bigint; // in basis points (e.g., 500 = 5%)
  duration: bigint; // in months
  monthlyPayment: bigint; // in USDT (6 decimals)
  totalOwed: bigint; // in USDT (6 decimals)
  amountPaid: bigint; // in USDT (6 decimals)
  createdAt: bigint;
  fundedAt: bigint;
  nextPaymentDue: bigint;
  status: LoanStatus; // uint8 enum
  isActive: boolean;
}

// Format loan amount (USDT has 6 decimals)
export const formatLoanAmount = (amount: bigint): string => {
  const decimals = 6; // USDT uses 6 decimals
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/\.?0+$/, '');
  
  return `${wholePart.toString()}.${trimmedFractional}`;
};

// Parse loan amount to wei (6 decimals)
export const parseLoanAmount = (amount: string): bigint => {
  const decimals = 6;
  const [whole, fractional = ''] = amount.split('.');
  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fractionalPadded);
};

// Convert status number to string
export const getLoanStatusString = (status: number | LoanStatus): 'PENDING' | 'OPEN' | 'FUNDED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' => {
  const statusNum = typeof status === 'number' ? status : Number(status);
  switch (statusNum) {
    case 0: // LoanStatus.PENDING
      return 'PENDING';
    case 1: // LoanStatus.OPEN
      return 'OPEN';
    case 2: // LoanStatus.FUNDED
      return 'FUNDED';
    case 3: // LoanStatus.ACTIVE
      return 'ACTIVE';
    case 4: // LoanStatus.COMPLETED
      return 'COMPLETED';
    case 5: // LoanStatus.DEFAULTED
      return 'DEFAULTED';
    default:
      return 'PENDING';
  }
};

