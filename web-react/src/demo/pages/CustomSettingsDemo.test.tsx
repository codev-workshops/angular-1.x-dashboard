import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomSettingsDemo } from './CustomSettingsDemo';

describe('CustomSettingsDemo', () => {
  it('renders both custom widget definitions and the view copy', async () => {
    const originalStorage = window.localStorage;
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
    render(<MemoryRouter><CustomSettingsDemo /></MemoryRouter>);
    expect(screen.getByText('Click here')).toBeInTheDocument();
    expect(Array.from(document.querySelectorAll('.label-primary')).map((element) => element.textContent)).toEqual(['congfigurable widget', 'override modal widget']);
    expect(Array.from(document.querySelectorAll('.widget-title')).filter((element) => !element.closest('form')).map((element) => element.textContent)).toEqual(['Widget 1', 'Widget 2']);
    fireEvent.click(document.querySelectorAll('.glyphicon-cog')[0]);
    expect(screen.getByText('Random Limit')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(document.querySelectorAll('.glyphicon-cog')[1]);
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Click here'));
    await waitFor(() => expect(storage.setItem).toHaveBeenCalledWith('custom-settings', expect.anything()));
    Object.defineProperty(window, 'localStorage', { configurable: true, value: originalStorage });
  });
});
