import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SimpleDemo } from './SimpleDemo';

describe('SimpleDemo', () => {
  it('renders the shared view copy and dashboard shell', async () => {
    const originalStorage = window.localStorage;
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
    render(<MemoryRouter><SimpleDemo /></MemoryRouter>);
    expect(screen.getByText('Click here')).toBeInTheDocument();
    expect(screen.getByText(/This demonstrates the prependWidget function/)).toBeInTheDocument();
    expect(document.querySelector('[dashboard="dashboardOptions"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.widget-container')).toHaveLength(5);
    expect(Array.from(document.querySelectorAll('.widget-title')).filter((element) => !element.closest('form')).map((element) => element.textContent)).toEqual(['Widget 1', 'Widget 2', 'Widget 3', 'Widget 4', 'Widget 5']);
    expect(Array.from(document.querySelectorAll('.label.label-primary')).map((element) => element.textContent)).toEqual(['random', 'time', 'datamodel', 'random', 'time']);
    screen.getByText('Click here').click();
    await waitFor(() => expect(storage.setItem).toHaveBeenCalledWith('demo_simple', expect.anything()));
    expect(JSON.parse(String(storage.setItem.mock.calls.at(-1)?.[1]))).not.toHaveProperty('hash');
    Object.defineProperty(window, 'localStorage', { configurable: true, value: originalStorage });
  });
});
