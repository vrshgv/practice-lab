import { setupWorker } from 'msw/browser';
import { handlers as paymentsHandlers } from '../pages/Payments/mocks/handlers';

export const worker = setupWorker(...paymentsHandlers);
