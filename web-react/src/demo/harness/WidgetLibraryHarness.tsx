import { useMemo, useState } from 'react';
import { DashboardContext } from '../../lib/DashboardContext';
import { createDashboardEvents } from '../../lib/events';
import type { DashboardOptions } from '../../lib/models/types';
import { CartDataModel, type CartItem } from '../dataModels/CartDataModel';
import { CartDetail } from '../widgets/CartDetail';
import { CartSummary } from '../widgets/CartSummary';
import { ConfigurableWidgetModalOptions } from '../widgets/ConfigurableWidgetModalOptions';
import { CustomSettingsTemplate } from '../widgets/CustomSettingsTemplate';
import { DynamicOptionsContainer } from '../widgets/DynamicOptionsContainer';
import { Resizable } from '../widgets/Resizable';
import { WidgetSpecificSettings } from '../widgets/WidgetSpecificSettings';
import { WtFluid } from '../widgets/WtFluid';

export function WidgetLibraryHarness(): JSX.Element {
  const events = useMemo(createDashboardEvents, []);
  const options = useMemo<DashboardOptions>(() => ({}), []);
  const cart = useMemo(() => new CartDataModel(), []);
  const [item, setItem] = useState<CartItem>({ name: '', qty: 0, price: 0 });
  const [configResult, setConfigResult] = useState({ dataModelOptions: { limit: 100 as unknown } });
  const [specificResult, setSpecificResult] = useState({ title: 'Special widget' });
  const [customResult, setCustomResult] = useState({ title: 'Custom widget' });
  const context = useMemo(() => ({ options, events, widgetRegistry: {}, dataModelRegistry: {}, dashboard: {} }), [options, events]);
  const updateItem = (field: keyof CartItem, value: string): void => setItem((current) => ({ ...current, [field]: field === 'name' ? value : Number(value) }));
  const addItem = (): void => {
    if (item.name.trim() && item.qty > 0 && item.price > 0) {
      cart.addItem({ ...item, name: item.name.trim() });
      setItem({ name: '', qty: 0, price: 0 });
    }
  };
  return <DashboardContext.Provider value={context}>
    <main>
      <section><WtFluid widgetData={null} scope={{}} /><Resizable widgetData={null} scope={{}} /><button onClick={() => events.emit('widgetResized', { width: '55%', height: '300px' })}>Resize widgets</button></section>
      <section><DynamicOptionsContainer widget={{ includeUrl: 'app/template/peopleList.html' }} widgetData={null} scope={{}} /></section>
      <section>
        <div className="row">
          <div className="col-md-12">
            <div>Add item to cart:</div>
            <input value={item.name} onChange={(event) => updateItem('name', event.target.value)} placeholder="Item name" ng-model="item.name" />
            <input value={item.qty || ''} onChange={(event) => updateItem('qty', event.target.value)} type="number" placeholder="Quantity" ng-model="item.qty" />
            <input value={item.price || ''} onChange={(event) => updateItem('price', event.target.value)} type="number" placeholder="Unit Price" ng-model="item.price" />
            <button onClick={addItem} className="btn btn-default btn-sm">Add</button>
            <button className="btn btn-default btn-sm">Auto Fill Cart</button>
          </div>
        </div>
        <CartDetail widget={{ cart }} widgetData={null} scope={{}} /><CartSummary widget={{ cart }} widgetData={null} scope={{}} />
      </section>
      <section>
        <ConfigurableWidgetModalOptions result={configResult} onChange={setConfigResult} /><pre>{JSON.stringify(configResult)}</pre>
        <WidgetSpecificSettings result={specificResult} onChange={setSpecificResult} onOk={() => undefined} onCancel={() => undefined} /><pre>{JSON.stringify(specificResult)}</pre>
        <CustomSettingsTemplate widget={{ title: 'Custom', partialSettingTemplateUrl: undefined }} result={customResult} onChange={setCustomResult} onOk={() => undefined} onCancel={() => undefined} /><pre>{JSON.stringify(customResult)}</pre>
      </section>
    </main>
  </DashboardContext.Provider>;
}
