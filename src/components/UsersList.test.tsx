import { render, screen } from '@testing-library/react';
import { UsersList } from './UsersList';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockSuccessResponse = () => {
  return vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]),
  } as Response));
};

const mockErrorResponse = () => {
  return vi.fn(() => Promise.resolve({
    ok: false,
    status: 500,
    json: () => Promise.resolve({message: 'Internal Server Error'})
  } as Response));
};

describe('UsersList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it ('renders users list successfully', async() => {
    global.fetch = mockSuccessResponse();

    render(<UsersList />);

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('displays error message when fetching fails', async () => {
    global.fetch = mockErrorResponse();

    render(<UsersList />);

    const items = screen.queryAllByRole('listitem');
    expect(items).toHaveLength(0);
  })
})
