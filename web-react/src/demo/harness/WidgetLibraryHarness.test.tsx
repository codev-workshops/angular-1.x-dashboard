import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WidgetLibraryHarness } from './WidgetLibraryHarness';

describe('WidgetLibraryHarness', () => {
  it('renders widget sections and exercises resize and cart add flows', () => {
    const { container } = render(<WidgetLibraryHarness />);
    expect(container.querySelector('.demo-widget-fluid')).toBeInTheDocument();
    expect(container.querySelector('.cart-detail')).toBeInTheDocument();
    expect(container.querySelector('.cart-summary')).toBeInTheDocument();
    expect(screen.getByText('Random Limit')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resize widgets' }));
    expect(screen.getAllByText('New width: 55%')).toHaveLength(2);
    expect(screen.getAllByText('New height: 300px')).toHaveLength(2);
    const inputs = container.querySelectorAll('input[ng-model^="item."]');
    fireEvent.change(inputs[0], { target: { value: 'Apple' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '1.50' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add$/ }));
    expect(container.querySelector('.cart-detail')).toHaveTextContent('Apple');
    expect(container.querySelector('.cart-summary')).toHaveTextContent('$3.00');
  });
});
