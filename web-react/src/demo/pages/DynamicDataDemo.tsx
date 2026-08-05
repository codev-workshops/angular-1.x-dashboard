import { useMemo, useState } from 'react';
import { isEmpty, random, round } from 'lodash-es';
import { Dashboard } from '../../lib/components/Dashboard';
import type { DashboardOptions, WidgetContentProps, WidgetDefinition } from '../../lib/models/types';
import { CartDataModel } from '../dataModels/CartDataModel';
import { CartDetail } from '../widgets/CartDetail';
import { CartSummary } from '../widgets/CartSummary';
import { dataModelRegistry, widgetRegistry } from '../registry';

export function DynamicDataDemo(): JSX.Element {
  const [cart] = useState(() => new CartDataModel());
  const [item, setItem] = useState({ name: '', qty: '0', price: '0' });
  const cartDefinitions = useMemo<WidgetDefinition[]>(() => [
    { name: 'cartDetail', title: 'cart detail', templateUrl: 'app/template/cartDetail.html', size: { width: '800px', minWidth: '600px' }, cart },
    { name: 'cartSummary', title: 'cart summary', templateUrl: 'app/template/cartSummary.html', size: { width: '400px', minWidth: '400px' }, cart },
  ], [cart]);
  const options = useMemo<DashboardOptions>(() => ({
    hideToolbar: true,
    widgetDefinitions: cartDefinitions,
    defaultWidgets: [{ name: 'cartDetail' }, { name: 'cartSummary' }],
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: 'demo_dynamic-data',
  }), [cartDefinitions]);
  const registry = useMemo(() => ({
    ...widgetRegistry,
    // Angular deep-copies definitions, so inject the live cart like the inherited template scope does.
    'app/template/cartDetail.html': (props: WidgetContentProps) => { void props; return <CartDetail widget={{ cart }} widgetData={undefined} scope={{}} />; },
    'app/template/cartSummary.html': (props: WidgetContentProps) => { void props; return <CartSummary widget={{ cart }} widgetData={undefined} scope={{}} />; },
  }), [cart]);
  const addItem = (): void => {
    const qty = Number(item.qty);
    const price = Number(item.price);
    if (!isEmpty(item.name) && item.qty !== undefined && qty > 0 && item.price !== undefined && price > 0) {
      cart.addItem({ name: item.name, qty, price });
      setItem({ name: '', qty: '0', price: '0' });
    }
  };
  const autoFillCart = (): void => {
    ['Apple', 'Banana', 'Coke', 'Milk', 'Pear', 'Water'].forEach((name) => cart.addItem({ name, qty: random(1, 10), price: round(random(1, 10, true), 2) }));
  };
  return (
    <div className="row">
      <div className="col-md-12">
        <div>
          <div>Add item to cart:</div>
          <input ng-model="item.name" placeholder="Item name" value={item.name} onChange={(event) => setItem({ ...item, name: event.target.value })} />
          <input ng-model="item.qty" type="number" placeholder="Quantity" value={item.qty} onChange={(event) => setItem({ ...item, qty: event.target.value })} />
          <input ng-model="item.price" type="number" placeholder="Unit Price" value={item.price} onChange={(event) => setItem({ ...item, price: event.target.value })} />
          <button ng-click="addItem()" className="btn btn-default btn-sm" onClick={addItem}>Add</button>
          <button ng-click="autoFillCart()" className="btn btn-default btn-sm" onClick={autoFillCart}>Auto Fill Cart</button>
        </div>
        <div {...{ dashboard: 'dashboardOptions' }} className="dashboard-container">
          <Dashboard options={options} registry={registry} dataModelRegistry={dataModelRegistry} />
        </div>
      </div>
    </div>
  );
}
