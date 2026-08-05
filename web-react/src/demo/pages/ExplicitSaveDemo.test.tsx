import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExplicitSaveDemo } from './ExplicitSaveDemo';

describe('ExplicitSaveDemo', () => {
  it('renders the explicit-save dashboard and view copy', () => {
    window.localStorage.clear();
    render(<MemoryRouter><ExplicitSaveDemo /></MemoryRouter>);
    expect(screen.getByText('Click here')).toBeInTheDocument();
    expect(document.querySelector('[dashboard="dashboardOptions"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'all saved' })).toBeDisabled();
    fireEvent.click(screen.getByText('Click here'));
    expect(screen.getByRole('button', { name: /save changes/ })).toBeInTheDocument();
    expect(window.localStorage.getItem('explicitSave')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /save changes/ }));
    return waitFor(() => expect(window.localStorage.getItem('explicitSave')).not.toBeNull());
  });
});
