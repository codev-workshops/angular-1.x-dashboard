import { useSyncExternalStore } from 'react';
import type { WidgetContentProps } from '../../lib/models/types';
import { CartDataModel } from '../dataModels/CartDataModel';

function currency(value: number): string {
  const absolute = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `($${absolute})` : `$${absolute}`;
}

export function CartDetail({ widget }: WidgetContentProps & { widget: { cart: CartDataModel } }): JSX.Element {
  const cart = widget.cart;
  useSyncExternalStore(cart.subscribe.bind(cart), () => `${cart.total}:${cart.qty}:${cart.items.length}`);
  const items = [...cart.items].sort((a, b) => a.name.localeCompare(b.name));
  return <table className="cart-detail"><tbody style={{ display: cart.items.length > 0 ? undefined : 'none' }}><tr><th>Name</th><th>Qty</th><th>Unit</th><th>Total</th></tr>{items.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.qty}</td><td>{currency(item.price)}</td><td>{currency(item.total ?? 0)}</td><td><button onClick={() => cart.removeItem(item)} className="btn btn-danger btn-xs"><span className="glyphicon glyphicon-remove"></span></button></td></tr>)}</tbody><tbody style={{ display: cart.items.length === 0 ? undefined : 'none' }}><tr><td className="empty">The cart is empty</td></tr></tbody></table>;
}
