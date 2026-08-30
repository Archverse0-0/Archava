// Contract addresses — replace after forge deploy
export const CONTRACT_ADDRESSES = {
  whiteRockPass: '0x5Bb5A242A2Db2a40592407676FcfcEe94ce7342E' as `0x${string}`,
  bookingEscrow: '0x7FB626bcF2722f45e25EEd445385e2Da34B1077e' as `0x${string}`,
  mockUSDT: '0x53f42a3edfca4927f9754b92b458323c77d6a4fd' as `0x${string}`,
} as const;

export const WHITE_ROCK_PASS_ABI = [
  {
    inputs: [{ internalType: 'uint8', name: 'tier', type: 'uint8' }],
    name: 'mintPass',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getDiscountBpsForUser',
    outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'enum WhiteRockPass.PassTier', name: '', type: 'uint8' },
    ],
    name: 'tierConfigs',
    outputs: [
      { internalType: 'uint256', name: 'price', type: 'uint256' },
      { internalType: 'uint16', name: 'discountBps', type: 'uint16' },
      { internalType: 'uint32', name: 'maxSupply', type: 'uint32' },
      { internalType: 'uint32', name: 'currentSupply', type: 'uint32' },
      { internalType: 'bool', name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const BOOKING_ESCROW_ABI = [
  {
    inputs: [
      { internalType: 'uint8', name: 'daybedType', type: 'uint8' },
      { internalType: 'uint64', name: 'visitTimestamp', type: 'uint64' },
      { internalType: 'address', name: 'paymentToken', type: 'address' },
    ],
    name: 'createBooking',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'guest', type: 'address' },
      { internalType: 'uint8', name: 'daybedType', type: 'uint8' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'calculateDeposit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserBookings',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'bookingId', type: 'uint256' },
          { internalType: 'address', name: 'guest', type: 'address' },
          { internalType: 'uint8', name: 'daybedType', type: 'uint8' },
          { internalType: 'uint64', name: 'visitTimestamp', type: 'uint64' },
          { internalType: 'uint256', name: 'depositAmount', type: 'uint256' },
          { internalType: 'address', name: 'paymentToken', type: 'address' },
          { internalType: 'bool', name: 'checkedIn', type: 'bool' },
          { internalType: 'bool', name: 'cancelled', type: 'bool' },
          { internalType: 'bool', name: 'settled', type: 'bool' },
        ],
        internalType: 'struct BookingEscrow.Booking[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'bookingId', type: 'uint256' }],
    name: 'cancelBooking',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Daybed type mapping for the UI
export const DAYBED_TYPES = [
  { id: 0, name: 'Lagoon Bed', minSpend: '0.01 MON', minSpendUsdt: '30 USDT' },
  { id: 1, name: 'VIP Cabana', minSpend: '0.05 MON', minSpendUsdt: '270 USDT' },
  { id: 2, name: 'Party Executive Suite', minSpend: '0.10 MON', minSpendUsdt: '480 USDT' },
  { id: 3, name: 'Single Sofa', minSpend: '0.005 MON', minSpendUsdt: '18 USDT' },
] as const;

// Pass tier mapping
export const PASS_TIERS = [
  { id: 0, name: 'Lagoon Pass', price: '10 USDT', discount: '5%' },
  { id: 1, name: 'VIP Cabana Pass', price: '50 USDT', discount: '10%' },
  { id: 2, name: 'Party Suite Pass', price: '100 USDT', discount: '20%' },
] as const;
