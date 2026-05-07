import React, { useState, useEffect } from 'react';

export default function CartSummary({ widget }) {
  const [, forceUpdate] = useState(0);
  const cart = widget.dataModelArgs;

  useEffect(() => {
    if (cart) {
      return cart.onChange(() => forceUpdate(n => n + 1));
    }
  }, [cart]);

  if (!cart) return <div>No cart data</div>;

  return (
    <div>
      <p>Total items: <strong>{cart.qty}</strong></p>
      <p>Total cost: <strong>${cart.total}</strong></p>
      {cart.expItem && cart.expItem.name && <p>Most expensive: <strong>{cart.expItem.name} (${cart.expItem.price})</strong></p>}
      {cart.cheapItem && cart.cheapItem.name && <p>Cheapest: <strong>{cart.cheapItem.name} (${cart.cheapItem.price})</strong></p>}
    </div>
  );
}
