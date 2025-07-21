import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalForm } from './ModalForm';
import '@testing-library/jest-dom'

describe('ModalForm', () => {
  it('renders the modal form', () => {
    render(<ModalForm />);

    fireEvent.click(screen.getByText('Open Modal'));
    expect(screen.getByText('Modal')).toBeInTheDocument();
  })

  it('submits the form if data is valid', async () => {
    render(<ModalForm />);

    fireEvent.click(screen.getByText('Open Modal'));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Vera' }});
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'vera@example.com' }});
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' }});

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument();
    }, { timeout: 2005 });
  })
})
