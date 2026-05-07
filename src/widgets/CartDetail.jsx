import React, { useState, useEffect } from 'react';

export default function CartDetail({ widget }) {
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
      <table className="table table-striped table-condensed">
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>${item.price}</td>
              <td>${item.total}</td>
              <td><a onClick={() => cart.removeItem(item)} style={{ cursor: 'pointer' }}>remove</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
