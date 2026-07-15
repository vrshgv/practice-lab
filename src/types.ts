export type Currency = 'GBP' | 'USD' | 'EUR';

export type TransactionStatus =
  | 'pending_submission'
  | 'submitted'
  | 'confirmed'
  | 'paid_out'
  | 'failed'
  | 'cancelled'
  | 'charged_back';

export type Merchant = {
  id: string;
  name: string;
  /** Decimal fraction, e.g. 0.029 for 2.9%. */
  discountRate: number;
  currency: Currency;
  /** Gross sum of this merchant's transactions in minor units (server-aggregated, page-independent). */
  totalAmount: number;
};

export type Page<T> = {
  data: T[];
  /** 1-indexed. */
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Transaction = {
  id: string;
  merchantId: string;
  /** Minor units (pence/cents). 1200 GBP === 120000. */
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  description: string;
  source: string;
  /** ISO date the customer was charged. */
  chargedAt: string;
  /** ISO date the merchant was paid out. Null until status === 'paid_out'. */
  paidOutAt: string | null;
};
