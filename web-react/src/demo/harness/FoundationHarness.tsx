import { useMemo } from 'react';
import { useDashboard } from '../../lib/useDashboard';
import type { DashboardOptions, WidgetDefinition } from '../../lib/models/types';

const definitions: WidgetDefinition[] = [
  { name: 'one' }, { name: 'two' }, { name: 'three' },
];

function DashboardHarness({ explicitSave = false, storageId }: { explicitSave?: boolean; storageId: string }): JSX.Element {
  const options = useMemo<DashboardOptions>(() => ({
    storage: window.localStorage as DashboardOptions['storage'],
    storageId,
    storageHash: '',
    widgetDefinitions: definitions,
    defaultWidgets: [{ name: 'one' }, { name: 'two' }],
    explicitSave,
  }), [explicitSave, storageId]);
  const dashboard = useDashboard(options);
  return (
    <section>
      <h2>{explicitSave ? 'Explicit save' : 'Continuous save'}</h2>
      <div data-testid={`${storageId}-widgets`}>{dashboard.widgets.map((widget) => <div key={widget.uid}>{widget.title}</div>)}</div>
      <button onClick={() => dashboard.addWidget('three')}>Add</button>
      <button onClick={() => dashboard.prependWidget({ name: 'two', title: 'Prepended' })}>Prepend</button>
      <button onClick={() => dashboard.widgets[0] && dashboard.removeWidget(dashboard.widgets[0])}>Remove</button>
      <button onClick={() => dashboard.clear()}>Clear</button>
      <button onClick={() => dashboard.resetWidgetsToDefault()}>Reset</button>
      <button onClick={() => dashboard.externalSaveDashboard()}>Save</button>
      <output data-testid={`${storageId}-count`}>{options.unsavedChangeCount ?? 0}</output>
      <pre data-testid={`${storageId}-payload`}>{window.localStorage.getItem(storageId)}</pre>
    </section>
  );
}

export function FoundationHarness(): JSX.Element {
  return <main><DashboardHarness storageId="foundation-continuous" /><DashboardHarness storageId="foundation-explicit" explicitSave /></main>;
}
