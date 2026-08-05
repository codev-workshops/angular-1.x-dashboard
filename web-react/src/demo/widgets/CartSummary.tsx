import { useSyncExternalStore } from 'react';
import type { WidgetContentProps } from '../../lib/models/types';
import { CartDataModel } from '../dataModels/CartDataModel';

function currency(value: number): string {
  const absolute = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `($${absolute})` : `$${absolute}`;
}

export function CartSummary({ widget }: WidgetContentProps): JSX.Element {
  const cart = (widget as WidgetContentProps & { cart: CartDataModel }).cart;
  useSyncExternalStore(cart.subscribe.bind(cart), () => `${cart.total}:${cart.qty}:${cart.items.length}`);
  return <table className="cart-summary"><tbody style={{ display: cart.items.length > 0 ? undefined : 'none' }}><tr><td>Cart Total:</td><td>{currency(cart.total)}</td></tr><tr><td>Total Qty:</td><td>{cart.qty}</td></tr><tr><td>Most Expensive:</td><td style={{ display: cart.expItem.name ? undefined : 'none' }}>{cart.expItem.qty} {cart.expItem.name} @{currency(cart.expItem.price ?? 0)}</td></tr><tr><td>Cheapest:</td><td style={{ display: cart.cheapItem.name ? undefined : 'none' }}>{cart.cheapItem.qty} {cart.cheapItem.name} @{currency(cart.cheapItem.price ?? 0)}</td></tr></tbody><tbody style={{ display: cart.items.length === 0 ? undefined : 'none' }}><tr><td className="empty">The cart is empty</td></tr></tbody></table>;
}
