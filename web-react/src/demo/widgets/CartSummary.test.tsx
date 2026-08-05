import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartDataModel } from '../dataModels/CartDataModel';
import { CartSummary } from './CartSummary';

describe('CartSummary', () => {
  it('keeps both ng-show bodies in the DOM and updates cart totals', () => {
    const cart = new CartDataModel();
    const { container } = render(<CartSummary widget={{ cart }} widgetData={null} scope={{}} />);
    expect(container.querySelectorAll('tbody')).toHaveLength(2);
    expect(container.querySelectorAll('.empty')).toHaveLength(1);
    expect(container).toHaveTextContent('The cart is empty');
    act(() => cart.addItem({ name: 'Apple', qty: 2, price: 1.5 }));
    expect(container).toHaveTextContent('$3.00');
    expect(container).toHaveTextContent('2');
    expect(container.querySelectorAll('tbody')[1]).toHaveStyle({ display: 'none' });
  });
});
