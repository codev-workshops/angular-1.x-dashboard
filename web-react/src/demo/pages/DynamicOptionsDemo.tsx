import { useMemo, useState } from 'react';
import { Dashboard } from '../../lib/components/Dashboard';
import type { DashboardOptions, WidgetContentProps, WidgetDefinition } from '../../lib/models/types';
import { DynamicOptionsContainer } from '../widgets/DynamicOptionsContainer';
import { dataModelRegistry, widgetRegistry } from '../registry';

const definitions: WidgetDefinition[] = [
  { name: 'peopleList', title: 'people list', templateUrl: 'app/template/dynamicOptionsContainer.html', size: { width: '800px', minWidth: '600px' }, includeUrl: 'app/template/peopleList.html' },
  { name: 'peopleThumbnail', title: 'people thumbnail', templateUrl: 'app/template/dynamicOptionsContainer.html', size: { width: '1000px', minWidth: '800px' }, includeUrl: 'app/template/peopleThumbnail.html' },
];

export function DynamicOptionsDemo(): JSX.Element {
  const [style, setStyle] = useState<'peopleList' | 'peopleThumbnail'>('peopleList');
  const [dashboardOptions, setDashboardOptions] = useState<DashboardOptions | undefined>(() => ({
    hideToolbar: true,
    widgetDefinitions: definitions,
    defaultWidgets: [{ name: 'peopleList' }],
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: `demo_dynamic-options_${Date.now()}`,
  }));
  const dynamicWidgetInstance = useMemo(() => ({ includeUrl: style === 'peopleList' ? 'app/template/peopleList.html' : 'app/template/peopleThumbnail.html' }), [style]);
  const registry = useMemo(() => ({ ...widgetRegistry, 'app/template/dynamicOptionsContainer.html': (props: WidgetContentProps) => <DynamicOptionsContainer widget={dynamicWidgetInstance} widgetData={props.widgetData} scope={props.scope} /> }), [dynamicWidgetInstance]);
  const toggleWidget = (): void => {
    const nextStyle = style === 'peopleList' ? 'peopleThumbnail' : 'peopleList';
    setStyle(nextStyle);
    setDashboardOptions(undefined);
    window.setTimeout(() => {
      setDashboardOptions({
        hideToolbar: true,
        widgetDefinitions: definitions,
        defaultWidgets: [{ name: nextStyle }],
        storage: window.localStorage as DashboardOptions['storage'],
        storageId: `demo_dynamic-options_${Date.now()}`,
      });
    }, 0);
  };
  return (
    <div className="row">
      <div className="col-md-12">
        <b>Change widget to:</b>
        <div className="btn-group">
          <button ng-class="{ active: style==='peopleList' }" ng-disabled="style==='peopleList'" className={`btn btn-default btn-sm${style === 'peopleList' ? ' active' : ''}`} disabled={style === 'peopleList'} onClick={toggleWidget}>List</button>
          <button ng-class="{ active: style==='peopleThumbnail' }" ng-disabled="style==='peopleThumbnail'" className={`btn btn-default btn-sm${style === 'peopleThumbnail' ? ' active' : ''}`} disabled={style === 'peopleThumbnail'} onClick={toggleWidget}>Thumbnail</button>
        </div>
        <div style={{ paddingBottom: '12px' }}>This methodology will destroy the existing widget and creates a new widget with new scope and data.
            Notice the names change as you toggle between the List and Thumbnail buttons.</div>
        {dashboardOptions && (
          <div {...{ 'ng-if': 'dashboardOptions', dashboard: 'dashboardOptions' }} className="dashboard-container">
            <Dashboard options={dashboardOptions} registry={registry} dataModelRegistry={dataModelRegistry} />
          </div>
        )}
      </div>
    </div>
  );
}
