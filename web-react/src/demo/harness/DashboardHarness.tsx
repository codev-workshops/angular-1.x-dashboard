import { useMemo } from 'react';
import { Dashboard } from '../../lib/components/Dashboard';
import type { DashboardOptions, WidgetDefinition } from '../../lib/models/types';
import { dataModelRegistry, widgetRegistry } from '../registry';

const definitions: WidgetDefinition[] = [
  { name: 'wt-time', directive: 'wt-time' },
  { name: 'wt-scope-watch', directive: 'wt-scope-watch' },
];
const defaults: WidgetDefinition[] = [
  { name: 'wt-time', title: 'Widget 1', directive: 'wt-time' },
  { name: 'wt-scope-watch', title: 'Widget 2', directive: 'wt-scope-watch' },
];

function HarnessDashboard({ title, storageId, widgetButtons, explicitSave, hideToolbar }: {
  title: string;
  storageId: string;
  widgetButtons?: boolean;
  explicitSave?: boolean;
  hideToolbar?: boolean;
}): JSX.Element {
  const options = useMemo<DashboardOptions>(() => ({
    storage: window.localStorage as DashboardOptions['storage'],
    storageId,
    storageHash: '',
    widgetDefinitions: definitions,
    defaultWidgets: defaults,
    widgetButtons,
    explicitSave,
    hideToolbar,
  }), [explicitSave, hideToolbar, storageId, widgetButtons]);
  return (
    <section>
      <h2>{title}</h2>
      <Dashboard options={options} registry={widgetRegistry} dataModelRegistry={dataModelRegistry} />
    </section>
  );
}

export function DashboardHarness(): JSX.Element {
  return (
    <main>
      <HarnessDashboard title="Widget buttons" storageId="harness_dashboard_buttons" widgetButtons />
      <HarnessDashboard title="Explicit save" storageId="harness_dashboard_explicit" explicitSave />
      <HarnessDashboard title="Toolbar hidden" storageId="harness_dashboard_hidden" hideToolbar />
    </main>
  );
}
