import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResizeDemo } from './ResizeDemo';

describe('ResizeDemo', () => {
  it('renders its nine configured widgets', async () => {
    const originalStorage = window.localStorage;
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
    render(<MemoryRouter><ResizeDemo /></MemoryRouter>);
    expect(document.querySelector('[dashboard="dashboardOptions"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.widget-container')).toHaveLength(9);
    expect(document.querySelectorAll('.e-resizer')).toHaveLength(9);
    expect(Array.from(document.querySelectorAll('.widget-title')).filter((element) => !element.closest('form')).map((element) => element.textContent)).toEqual([
      'Widget 1',
      'Widget 2',
      'Widget 3',
      'Widget 4',
      'resizable (width: 50%, minWidth: 40%)',
      'resizable (width: 50%, minWidth: 900px)',
      'resizable (width: 500px, minWidth: 70%)',
      'resizable (width: 500px, minWidth: 400px, minHeight: 100px)',
      'resizable (height = 25% of width)',
    ]);
    screen.getByText('Click here').click();
    await waitFor(() => expect(storage.setItem).toHaveBeenCalledWith('demo_resize', expect.anything()));
    Object.defineProperty(window, 'localStorage', { configurable: true, value: originalStorage });
  });
});
