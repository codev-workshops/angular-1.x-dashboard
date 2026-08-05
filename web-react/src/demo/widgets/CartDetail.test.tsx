import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartDataModel } from '../dataModels/CartDataModel';
import { CartDetail } from './CartDetail';

describe('CartDetail', () => {
  it('renders sorted details and removes the item', () => {
    const cart = new CartDataModel();
    const { container } = render(<CartDetail widget={{ cart }} widgetData={null} scope={{}} />);
    expect(container.querySelectorAll('tbody')).toHaveLength(2);
    expect(container.querySelectorAll('.empty')).toHaveLength(1);
    expect(container).toHaveTextContent('The cart is empty');
    act(() => cart.addItem({ name: 'Apple', qty: 2, price: 1.5 }));
    expect(container).toHaveTextContent('Apple');
    expect(container).toHaveTextContent('$3.00');
    fireEvent.click(container.querySelector('.glyphicon-remove')!.parentElement!);
    expect(container.querySelector('.empty')).toHaveTextContent('The cart is empty');
    expect(container.querySelectorAll('.glyphicon-remove')).toHaveLength(0);
  });
});
