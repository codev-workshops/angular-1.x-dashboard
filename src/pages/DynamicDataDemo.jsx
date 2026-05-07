import React, { useState, useRef } from 'react';
import Dashboard from '../components/Dashboard';
import CartDataModel from '../models/CartDataModel';

const SAMPLE_ITEMS = [
  { name: 'Keyboard', qty: 1, price: 49.99 },
  { name: 'Mouse', qty: 2, price: 19.99 },
  { name: 'Monitor', qty: 1, price: 299.99 },
  { name: 'Headset', qty: 1, price: 79.99 },
  { name: 'USB Cable', qty: 5, price: 5.99 },
];

export default function DynamicDataDemo() {
  const cartRef = useRef(new CartDataModel());
  const cart = cartRef.current;
  const dashboardRef = useRef(null);
  const [item, setItem] = useState({ name: '', qty: 1, price: 0 });

  const dashboardOptions = useRef({
    widgetButtons: false,
    widgetDefinitions: [
      {
        name: 'cartDetail',
        directive: 'cartDetail',
        title: 'Cart Detail',
        dataModelArgs: cart,
        size: { width: '50%' },
      },
      {
        name: 'cartSummary',
        directive: 'cartSummary',
        title: 'Cart Summary',
        dataModelArgs: cart,
        size: { width: '50%' },
      },
    ],
    defaultWidgets: [
      { name: 'cartDetail' },
      { name: 'cartSummary' },
    ],
    useLocalStorage: false,
    storageId: 'demo_dynamic_data',
    storageHash: 'dd1',
  }).current;

  const addItem = () => {
    if (item.name && item.qty > 0) {
      cart.addItem({ ...item, qty: Number(item.qty), price: Number(item.price) });
      setItem({ name: '', qty: 1, price: 0 });
    }
  };

  const autoFillCart = () => {
    SAMPLE_ITEMS.forEach(si => cart.addItem({ ...si }));
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div style={{ marginBottom: 12 }}>
          <div>Add item to cart:</div>
          <input
            value={item.name}
            placeholder="Item name"
            onChange={(e) => setItem({ ...item, name: e.target.value })}
            style={{ marginRight: 4 }}
          />
          <input
            type="number"
            value={item.qty}
            placeholder="Quantity"
            onChange={(e) => setItem({ ...item, qty: e.target.value })}
            style={{ marginRight: 4, width: 80 }}
          />
          <input
            type="number"
            value={item.price}
            placeholder="Unit Price"
            onChange={(e) => setItem({ ...item, price: e.target.value })}
            style={{ marginRight: 4, width: 80 }}
          />
          <button className="btn btn-default btn-sm" onClick={addItem} style={{ marginRight: 4 }}>Add</button>
          <button className="btn btn-default btn-sm" onClick={autoFillCart}>Auto Fill Cart</button>
        </div>
        <Dashboard options={dashboardOptions} dashboardRef={dashboardRef} />
      </div>
    </div>
  );
}
