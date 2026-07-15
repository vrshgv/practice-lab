import type { Merchant, Transaction, TransactionStatus } from '../../../types';

type MerchantSeed = Omit<Merchant, 'totalAmount'>;

const merchantSeeds: MerchantSeed[] = [
  { id: 'MRC_01', name: 'Nashira Test',          discountRate: 0.029, currency: 'GBP' },
  { id: 'MRC_02', name: 'Successful Investor',   discountRate: 0.015, currency: 'GBP' },
  { id: 'MRC_03', name: 'Terry Test',            discountRate: 0.025, currency: 'GBP' },
  { id: 'MRC_04', name: 'Successful Tester',     discountRate: 0.018, currency: 'GBP' },
  { id: 'MRC_05', name: 'Test American',         discountRate: 0.035, currency: 'USD' },
  { id: 'MRC_06', name: 'Acme Subscriptions',    discountRate: 0.020, currency: 'GBP' },
  { id: 'MRC_07', name: 'Bright Bake Co',        discountRate: 0.025, currency: 'GBP' },
  { id: 'MRC_08', name: 'Cobalt Studio',         discountRate: 0.018, currency: 'EUR' },
  { id: 'MRC_09', name: 'Driftwood Audio',       discountRate: 0.030, currency: 'GBP' },
  { id: 'MRC_10', name: 'Evergreen Coaching',    discountRate: 0.022, currency: 'GBP' },
  { id: 'MRC_11', name: 'Foundry & Co',          discountRate: 0.015, currency: 'USD' },
  { id: 'MRC_12', name: 'Greendale Tutors',      discountRate: 0.028, currency: 'GBP' },
  { id: 'MRC_13', name: 'Harbour Yoga',          discountRate: 0.035, currency: 'GBP' },
  { id: 'MRC_14', name: 'Inkwell Press',         discountRate: 0.020, currency: 'EUR' },
  { id: 'MRC_15', name: 'Junebug Bookings',      discountRate: 0.024, currency: 'GBP' },
  { id: 'MRC_16', name: 'Kindling Kitchen',      discountRate: 0.032, currency: 'GBP' },
  { id: 'MRC_17', name: 'Lighthouse Cleaning',   discountRate: 0.019, currency: 'GBP' },
  { id: 'MRC_18', name: 'Mosaic Therapy',        discountRate: 0.026, currency: 'GBP' },
  { id: 'MRC_19', name: 'Northwind Signage',     discountRate: 0.017, currency: 'USD' },
  { id: 'MRC_20', name: 'Orchard Lane Florists', discountRate: 0.023, currency: 'GBP' },
];

const DESCRIPTIONS = [
  'Monthly subscription', 'Annual subscription', 'Top-up payment', 'Add-on services',
  'Enterprise plan', 'Consulting fee', 'Setup fee', 'License renewal',
  'API usage', 'Refund adjustment', 'Bonus payment', 'Quarterly retainer',
  'Pilot program', 'Custom integration', 'Storage upgrade', 'Premium support',
  'User seats', 'Partnership fee', 'Onboarding', 'Training session',
];

const SOURCES = ['Dashboard', 'API', 'Billing import', 'Mobile app', 'CSV import'];

// 20 statuses, weighted toward paid_out so headline numbers are populated.
const STATUS_CYCLE: TransactionStatus[] = [
  'paid_out', 'paid_out', 'paid_out', 'paid_out', 'paid_out',
  'paid_out', 'paid_out', 'paid_out',
  'submitted', 'submitted', 'submitted',
  'confirmed', 'confirmed',
  'pending_submission', 'pending_submission',
  'failed', 'cancelled', 'charged_back',
  'paid_out', 'paid_out',
];

const pad = (n: number, width: number) => String(n).padStart(width, '0');

function generateTransactions(
  merchant: MerchantSeed,
  count: number,
  seqStart: number,
): Transaction[] {
  const out: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const seq = seqStart + i;
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const description = DESCRIPTIONS[(seq * 7) % DESCRIPTIONS.length];
    const source = SOURCES[(seq * 3) % SOURCES.length];
    // 50.00 to 4,000.00 of the merchant's currency, in minor units.
    const amount = (((seq * 13) % 80) + 1) * 5000;
    const day = ((i * 3) % 27) + 1;
    const month = i < 10 ? 11 : 12;
    const chargedAt = `2023-${pad(month, 2)}-${pad(day, 2)}`;
    const paidOutAt =
      status === 'paid_out'
        ? `2023-${pad(month, 2)}-${pad(Math.min(day + 3, 28), 2)}`
        : null;
    out.push({
      id: `TXN_${pad(seq, 4)}`,
      merchantId: merchant.id,
      amount,
      currency: merchant.currency,
      status,
      description,
      source,
      chargedAt,
      paidOutAt,
    });
  }
  return out;
}

// Two explicit transactions for Nashira so the detail-view screenshot still
// has something to verify against (Partnerships pending + Monthly subscription paid_out).
const explicit: Transaction[] = [
  {
    id: 'TXN_0001',
    merchantId: 'MRC_01',
    amount: 50000,
    currency: 'GBP',
    status: 'pending_submission',
    description: 'Partnerships',
    source: 'Billing import',
    chargedAt: '2023-12-06',
    paidOutAt: null,
  },
  {
    id: 'TXN_0002',
    merchantId: 'MRC_01',
    amount: 120000,
    currency: 'GBP',
    status: 'paid_out',
    description: 'Monthly subscription',
    source: 'Dashboard',
    chargedAt: '2023-12-05',
    paidOutAt: '2023-12-08',
  },
];

const generated: Transaction[] = [];
let nextSeq = 3;

// MRC_01: 2 explicit + 18 generated = 20.
generated.push(...generateTransactions(merchantSeeds[0], 18, nextSeq));
nextSeq += 18;

// MRC_02..MRC_05: 20 generated each.
for (let i = 1; i < 5; i++) {
  generated.push(...generateTransactions(merchantSeeds[i], 20, nextSeq));
  nextSeq += 20;
}

// MRC_06..MRC_20 intentionally have zero transactions — empty-state practice.

export const transactions: Transaction[] = [...explicit, ...generated];

// Server-side aggregate: gross sum of every transaction per merchant, in minor units.
// Includes all statuses (failed/cancelled/charged_back too) — adjust the filter here
// if the requirements say fees should only apply to successful charges.
const totalsByMerchant = transactions.reduce<Record<string, number>>((acc, t) => {
  acc[t.merchantId] = (acc[t.merchantId] ?? 0) + t.amount;
  return acc;
}, {});

export const merchants: Merchant[] = merchantSeeds.map((m) => ({
  ...m,
  totalAmount: totalsByMerchant[m.id] ?? 0,
}));
