import { useEffect, useMemo, useState } from 'react';
import { DashboardLayouts } from '../../lib/components/DashboardLayouts';
import type { DashboardLayoutsOptions } from '../../lib/useDashboardLayouts';
import type { WidgetDefinition } from '../../lib/models/types';
import { RandomDataModel } from '../dataModels/RandomDataModel';
import { dataModelRegistry, widgetRegistry } from '../registry';

export const layoutsWidgetDefinitions: WidgetDefinition[] = [
  { name: 'random', directive: 'wt-scope-watch', attrs: { value: 'randomValue' } },
  { name: 'time', directive: 'wt-time' },
  { name: 'datamodel', directive: 'wt-scope-watch', dataAttrName: 'value', dataModelType: RandomDataModel },
  { name: 'resizable', templateUrl: 'app/template/resizable.html', attrs: { class: 'demo-widget-resizable' } },
  { name: 'fluid', directive: 'wt-fluid', size: { width: '50%', height: '250px' } },
];

export const layoutsDefaultWidgets: WidgetDefinition[] = [
  { name: 'random' },
  { name: 'time' },
  { name: 'datamodel' },
  { name: 'random', style: { width: '50%', minWidth: '39%' } },
  { name: 'time', style: { width: '50%' } },
];

export function useRandomValue(): number {
  const [randomValue, setRandomValue] = useState(() => Math.random());
  useEffect(() => {
    const timer = window.setInterval(() => setRandomValue(Math.random()), 500);
    return () => window.clearInterval(timer);
  }, []);
  return randomValue;
}

export function LayoutsDemo(): JSX.Element {
  const options = useMemo<DashboardLayoutsOptions>(() => ({
    storageId: 'demo-layouts',
    storage: window.localStorage as DashboardLayoutsOptions['storage'],
    storageHash: 'fs4df4d51',
    widgetDefinitions: layoutsWidgetDefinitions,
    defaultWidgets: layoutsDefaultWidgets,
    lockDefaultLayouts: true,
    defaultLayouts: [
      { title: 'Layout 1', active: true, defaultWidgets: layoutsDefaultWidgets },
      { title: 'Layout 2', active: false, defaultWidgets: layoutsDefaultWidgets },
      { title: 'Layout 3', active: false, defaultWidgets: layoutsDefaultWidgets, locked: false },
    ],
  }), []);
  const randomValue = useRandomValue();
  const scope = useMemo(() => ({ randomValue }), [randomValue]);

  return (
    <div>
      <p>
        <a onClick={() => options.prependWidget?.({ name: 'random', title: 'Prepend Widget' })}>Click here</a> to add new
        &quot;random&quot; widget to beginning of dashboard.  This demonstrates the prependWidget function.	See{' '}
        <a href="https://github.com/DataTorrent/malhar-angular-dashboard/issues/141" target="_blank" rel="noreferrer">issue #141</a>.
      </p>
      <DashboardLayouts
        options={options}
        scope={scope}
        registry={widgetRegistry}
        dataModelRegistry={dataModelRegistry}
      />
    </div>
  );
}
