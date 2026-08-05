import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DynamicOptionsDemo } from './DynamicOptionsDemo';

describe('DynamicOptionsDemo', () => {
  it('renders the dynamic option controls and people list', async () => {
    const originalStorage = window.localStorage;
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
    render(<MemoryRouter><DynamicOptionsDemo /></MemoryRouter>);
    expect(screen.getAllByRole('button', { name: 'List' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Thumbnail' })[0]).toBeEnabled();
    expect(document.querySelector('table.people')).toBeInTheDocument();
    expect(document.querySelector('[dashboard="dashboardOptions"]')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Thumbnail' })[0]);
    await waitFor(() => {
      expect(document.querySelector('table.people')).not.toBeInTheDocument();
      expect(document.querySelectorAll('img').length).toBeGreaterThan(0);
      fireEvent.click(document.querySelector('.glyphicon-remove')!);
      expect(storage.setItem.mock.calls.some(([key]) => /^demo_dynamic-options_\d+$/.test(String(key)))).toBe(true);
    });
    Object.defineProperty(window, 'localStorage', { configurable: true, value: originalStorage });
  });
});
