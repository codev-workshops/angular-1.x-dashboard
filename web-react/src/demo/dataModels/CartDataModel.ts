import { WidgetDataModel } from '../../lib/models/WidgetDataModel';

export type CartItem = {
  name: string;
  qty: number;
  price: number;
  total?: number;
};

export type CartListener = () => void;

export class CartDataModel extends WidgetDataModel {
  items: CartItem[] = [];
  total = 0;
  qty = 0;
  expItem: Partial<CartItem> & { price?: number } = {};
  cheapItem: Partial<CartItem> & { price?: number } = {};
  private readonly listeners = new Set<CartListener>();

  subscribe(listener: CartListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  addItem(item: CartItem): void {
    const existing = this.items.find((candidate) => candidate.name === item.name);
    if (existing) {
      existing.qty += item.qty;
      existing.total = (existing.total ?? 0) + item.qty * item.price;
      existing.price = Math.round((existing.total / existing.qty) * 100) / 100;
    } else {
      item.total = Math.round(item.qty * item.price * 100) / 100;
      this.items.push(item);
    }
    this.processItems();
  }

  removeItem(item: Pick<CartItem, 'name'>): void {
    const index = this.items.findIndex((candidate) => candidate.name === item.name);
    if (index > -1) {
      this.items.splice(index, 1);
      this.processItems();
    }
  }

  processItems(): void {
    this.total = 0;
    this.qty = 0;
    this.expItem = { price: -Infinity };
    this.cheapItem = { price: Infinity };
    this.items.forEach((item) => {
      this.total += item.total ?? 0;
      this.qty += item.qty;
      if (item.price > (this.expItem.price ?? -Infinity)) this.expItem = item;
      if (item.price < (this.cheapItem.price ?? Infinity)) this.cheapItem = item;
    });
    this.total = Math.round(this.total * 100) / 100;
    this.listeners.forEach((listener) => listener());
  }
}
