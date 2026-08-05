import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from '../../lib/components/Dashboard';
import type { DashboardOptions } from '../../lib/models/types';
import { dataModelRegistry, widgetRegistry } from '../registry';
import { defaultWidgets, widgetDefinitions } from '../widgetDefinitions';

export function ExplicitSaveDemo(): JSX.Element {
  const [randomValue, setRandomValue] = useState(() => Math.random());
  const options = useMemo<DashboardOptions>(() => ({
    widgetButtons: true,
    widgetDefinitions,
    defaultWidgets,
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: 'explicitSave',
    explicitSave: true,
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
