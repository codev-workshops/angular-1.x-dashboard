import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DynamicDataDemo } from './DynamicDataDemo';

describe('DynamicDataDemo', () => {
  it('renders the cart form and both cart widgets', () => {
    const originalStorage = window.localStorage;
    const storage = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });
    render(<MemoryRouter><DynamicDataDemo /></MemoryRouter>);
    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Quantity')).toHaveAttribute('ng-model', 'item.qty');
    expect(screen.getByRole('button', { name: 'Auto Fill Cart' })).toBeInTheDocument();
    expect(document.querySelector('.cart-detail')).toBeInTheDocument();
    expect(document.querySelector('.cart-summary')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Item name'), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByPlaceholderText('Quantity'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Unit Price'), { target: { value: '1.50' } });
    expect(screen.getByPlaceholderText('Unit Price')).toHaveValue(1.5);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(document.querySelector('.cart-summary')).toHaveTextContent('Apple');
    fireEvent.click(document.querySelector('.glyphicon-remove')!);
    expect(storage.setItem).toHaveBeenCalledWith('demo_dynamic-data', expect.anything());
    Object.defineProperty(window, 'localStorage', { configurable: true, value: originalStorage });
  });
});
