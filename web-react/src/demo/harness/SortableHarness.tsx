import { useEffect, useMemo, useRef, useState } from 'react';
import { Dashboard } from '../../lib/components/Dashboard';
import { useSortable } from '../../lib/useSortable';
import type { DashboardOptions, WidgetDefinition } from '../../lib/models/types';
import { dataModelRegistry, widgetRegistry } from '../registry';

const definitions: WidgetDefinition[] = [
  { name: 'wt-time', directive: 'wt-time' },
  { name: 'wt-scope-watch', directive: 'wt-scope-watch' },
];
const defaults: WidgetDefinition[] = [
  { name: 'wt-time', title: 'Widget 1', directive: 'wt-time' },
  { name: 'wt-scope-watch', title: 'Widget 2', directive: 'wt-scope-watch' },
  { name: 'wt-time', title: 'Widget 3', directive: 'wt-time' },
  { name: 'wt-scope-watch', title: 'Widget 4', directive: 'wt-scope-watch' },
  { name: 'wt-time', title: 'Widget 5', directive: 'wt-time' },
];

function SimpleSortableList(): JSX.Element {
  const [items, setItems] = useState(['Plain 1', 'Plain 2', 'Plain 3']);
  const containerRef = useRef<HTMLUListElement>(null);
  useSortable({
    containerRef,
    items,
    itemSelector: 'li',
    onReorder: (from, to) => {
      const next = items.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      setItems(next);
    },
  });
  return (
    <section>
      <h2>Plain sortable list</h2>
      <ul ref={containerRef}>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
}

function SortableDashboard(): JSX.Element {
  const options = useMemo<DashboardOptions>(() => ({
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: 'demo_simple',
    storageHash: '',
    widgetDefinitions: definitions,
    defaultWidgets: defaults,
  }), []);
  const [order, setOrder] = useState<string[]>(defaults.map((widget) => widget.title ?? ''));
  const [payload, setPayload] = useState<string>('');

  useEffect(() => {
    const update = (): void => {
      setOrder((options.currentWidgets ?? []).map((widget) => widget.title ?? ''));
      setPayload(window.localStorage.getItem('demo_simple') ?? '');
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [options]);

  return (
    <section>
      <h1>Sortable harness</h1>
      <Dashboard options={options} registry={widgetRegistry} dataModelRegistry={dataModelRegistry} />
      <p data-testid="sortable-order">Current order: {order.join(', ')}</p>
      <pre data-testid="sortable-storage">{payload}</pre>
    </section>
  );
}

export function SortableHarness(): JSX.Element {
  return <main><SortableDashboard /><SimpleSortableList /></main>;
}
