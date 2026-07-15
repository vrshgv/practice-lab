import { http, HttpResponse, delay } from 'msw';
import { merchants, transactions } from './fixtures';
import type { Merchant, Page } from '../../../types';

export const API_BASE = 'https://api.payments.test';

const DEFAULT_PAGE_SIZE = 10;

function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}

type PaginationResult =
  | { ok: true; page: number; pageSize: number }
  | { ok: false; status: 400; error: string };

function readPagination(url: URL): PaginationResult {
  const pageRaw = url.searchParams.get('page') ?? '1';
  const pageSizeRaw = url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE);
  const page = Number(pageRaw);
  const pageSize = Number(pageSizeRaw);
  if (!Number.isInteger(page) || page < 1) {
    return { ok: false, status: 400, error: `Invalid page=${pageRaw}` };
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return { ok: false, status: 400, error: `Invalid pageSize=${pageSizeRaw}` };
  }
  return { ok: true, page, pageSize };
}

async function simulateLatency() {
  await delay(150 + Math.random() * 250);
}

export const handlers = [
  http.get(`${API_BASE}/merchants`, async ({ request }) => {
    await simulateLatency();
    const url = new URL(request.url);
    const parsed = readPagination(url);
    if (!parsed.ok) return HttpResponse.json({ error: parsed.error }, { status: parsed.status });
    return HttpResponse.json(paginate<Merchant>(merchants, parsed.page, parsed.pageSize));
  }),

  http.get(`${API_BASE}/merchants/:id`, async ({ params }) => {
    await simulateLatency();
    const merchant = merchants.find((m) => m.id === params.id);
    if (!merchant) {
      return HttpResponse.json({ error: `Merchant ${params.id} not found` }, { status: 404 });
    }
    return HttpResponse.json(merchant);
  }),

  http.get(`${API_BASE}/merchants/:id/transactions`, async ({ params, request }) => {
    await simulateLatency();
    const merchant = merchants.find((m) => m.id === params.id);
    if (!merchant) {
      return HttpResponse.json({ error: `Merchant ${params.id} not found` }, { status: 404 });
    }
    const url = new URL(request.url);
    const parsed = readPagination(url);
    if (!parsed.ok) return HttpResponse.json({ error: parsed.error }, { status: parsed.status });
    const merchantTx = transactions.filter((t) => t.merchantId === params.id);
    return HttpResponse.json(paginate(merchantTx, parsed.page, parsed.pageSize));
  }),
];
