import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from '../../lib/components/Dashboard';
import type { DashboardOptions, WidgetDefinition } from '../../lib/models/types';
import { dataModelRegistry, widgetRegistry } from '../registry';
import { widgetDefinitions } from '../widgetDefinitions';

const resizeDefaults: WidgetDefinition[] = [
  { name: 'fluid', resizeTimeout: 0 },
  { name: 'resizable', resizeTimeout: 0 },
  { name: 'random', style: { width: '50%' }, resizeTimeout: 0 },
  { name: 'time', style: { width: '50%' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 50%, minWidth: 40%)', size: { width: '50%', minWidth: '40%' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 50%, minWidth: 900px)', size: { width: '50%', minWidth: '900px' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 500px, minWidth: 70%)', size: { width: '500px', minWidth: '70%' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 500px, minWidth: 400px, minHeight: 100px)', size: { width: '200px', height: '50px', minWidth: '400px', minHeight: '100px' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (height = 25% of width)', size: { width: '50%', height: '50px', minWidth: '400px', minHeight: '100px', heightToWidthRatio: .25 }, resizeTimeout: 0 },
];

export function ResizeDemo(): JSX.Element {
  const [randomValue, setRandomValue] = useState(() => Math.random());
  const options = useMemo<DashboardOptions>(() => ({
    widgetButtons: true,
    widgetDefinitions,
    defaultWidgets: resizeDefaults,
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: 'demo_resize',
  }), []);
  useEffect(() => {
    const interval = window.setInterval(() => setRandomValue(Math.random()), 500);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <>
      <p>
        <a ng-click="prependWidget()" onClick={() => options.prependWidget?.({ name: 'random', title: 'Prepend Widget' })}>Click here</a> to add new widget to beginning of dashboard.  This demonstrates the prependWidget function.	See <a href="https://github.com/DataTorrent/malhar-angular-dashboard/issues/141" target="_blank">issue #141</a>.
      </p>
      <div className="row">
        <div className="col-md-12">
          <div {...{ dashboard: 'dashboardOptions' }} className="dashboard-container">
            <Dashboard options={options} scope={{ randomValue }} registry={widgetRegistry} dataModelRegistry={dataModelRegistry} />
          </div>
        </div>
      </div>
    </>
  );
}
