import { setupServer } from 'msw/node';
import { handlers as paymentsHandlers } from '../pages/Payments/mocks/handlers';

export const server = setupServer(...paymentsHandlers);
