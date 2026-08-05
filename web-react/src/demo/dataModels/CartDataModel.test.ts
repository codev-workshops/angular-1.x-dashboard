import { describe, expect, it } from 'vitest';
import { CartDataModel } from './CartDataModel';

describe('CartDataModel', () => {
  it('creates a cart with empty properties', () => {
    const model = new CartDataModel();
    expect(model.items).toEqual([]);
    expect(model.total).toBe(0);
    expect(model.qty).toBe(0);
    expect(model.expItem).toEqual({});
    expect(model.cheapItem).toEqual({});
  });

  it('adds, merges, processes, and removes items', () => {
    const model = new CartDataModel();
    model.addItem({ name: 'Apple', qty: 2, price: 0.55 });
    model.addItem({ name: 'Pear', qty: 5, price: 0.75 });
    model.addItem({ name: 'Banana', qty: 3, price: 0.35 });
    expect(model.total).toBe(5.9);
    expect(model.qty).toBe(10);
    expect(model.expItem).toMatchObject({ name: 'Pear', qty: 5, price: 0.75 });
    expect(model.cheapItem).toMatchObject({ name: 'Banana', qty: 3, price: 0.35 });
    model.addItem({ name: 'Pear', qty: 2, price: 0.67 });
    expect(model.items[1]).toMatchObject({ name: 'Pear', qty: 7, price: 0.73 });
    model.addItem({ name: 'Orange', qty: 2, price: 0.75 });
    expect(model.items).toHaveLength(4);
    model.removeItem({ name: 'Pear' });
    expect(model.items.map((item) => item.name)).toEqual(['Apple', 'Banana', 'Orange']);
    model.removeItem({ name: 'Name_not_in_cart' });
    expect(model.items).toHaveLength(3);
  });

  it('notifies subscribers after mutations', () => {
    const model = new CartDataModel();
    let calls = 0;
    const unsubscribe = model.subscribe(() => { calls += 1; });
    model.addItem({ name: 'Apple', qty: 1, price: 1 });
    model.removeItem({ name: 'Apple' });
    unsubscribe();
    model.addItem({ name: 'Pear', qty: 1, price: 1 });
    expect(calls).toBe(2);
  });
});
