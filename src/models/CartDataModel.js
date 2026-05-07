import _ from 'lodash';

export default class CartDataModel {
  constructor() {
    this.items = [];
    this.total = 0;
    this.qty = 0;
    this.expItem = {};
    this.cheapItem = {};
    this._listeners = [];
  }

  onChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  _notify() {
    this._listeners.forEach(fn => fn());
  }

  addItem(item) {
    const index = _.findIndex(this.items, (i) => i.name === item.name);
    if (index > -1) {
      this.items[index].qty += item.qty;
      this.items[index].total += item.qty * item.price;
      this.items[index].price = Math.round(this.items[index].total / this.items[index].qty * 100) / 100;
    } else {
      item.total = Math.round(item.qty * item.price * 100) / 100;
      this.items.push({ ...item });
    }
    this.processItems();
    this._notify();
  }

  removeItem(item) {
    const index = _.findIndex(this.items, (i) => i.name === item.name);
    if (index > -1) {
      this.items.splice(index, 1);
      this.processItems();
      this._notify();
    }
  }

  processItems() {
    this.total = 0;
    this.qty = 0;
    this.expItem = { price: -Infinity };
    this.cheapItem = { price: Infinity };

    _.each(this.items, (item) => {
      this.total += item.total;
      this.qty += item.qty;
      if (item.price > this.expItem.price) {
        this.expItem = item;
      }
      if (item.price < this.cheapItem.price) {
        this.cheapItem = item;
      }
    });

    this.total = Math.round(this.total * 100) / 100;
  }
}
