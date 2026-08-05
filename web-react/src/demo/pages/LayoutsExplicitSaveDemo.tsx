import { useMemo } from 'react';
import { DashboardLayouts } from '../../lib/components/DashboardLayouts';
import type { DashboardLayoutsOptions } from '../../lib/useDashboardLayouts';
import { layoutsDefaultWidgets, layoutsWidgetDefinitions, useRandomValue } from './LayoutsDemo';
import { dataModelRegistry, widgetRegistry } from '../registry';

export function LayoutsExplicitSaveDemo(): JSX.Element {
  const options = useMemo<DashboardLayoutsOptions>(() => ({
    storageId: 'demo-layouts-explicit-save',
    storage: window.localStorage as DashboardLayoutsOptions['storage'],
    storageHash: 'fs4df4d51',
    widgetDefinitions: layoutsWidgetDefinitions,
    defaultWidgets: layoutsDefaultWidgets,
    explicitSave: true,
    defaultLayouts: [
      { title: 'Layout 1', active: true, defaultWidgets: layoutsDefaultWidgets },
      { title: 'Layout 2', active: false, defaultWidgets: layoutsDefaultWidgets },
      { title: 'Layout 3', active: false, defaultWidgets: layoutsDefaultWidgets },
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
