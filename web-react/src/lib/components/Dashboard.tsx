import type { ComponentType } from 'react';
import { DashboardContext } from '../DashboardContext';
import { useDashboard } from '../useDashboard';
import type { DashboardOptions, DataModelRegistry, WidgetRegistry } from '../models/types';
import { Widget } from './Widget';
import { DashboardToolbar } from './DashboardToolbar';
import { AltDashboard } from './AltDashboard';
import { logger } from '../logger';

export type DashboardTemplateProps = {
  options: DashboardOptions;
  scope?: Record<string, unknown>;
  registry: WidgetRegistry;
  dataModelRegistry?: DataModelRegistry;
};

export type DashboardTemplate = ComponentType<DashboardTemplateProps>;
export type DashboardProps = DashboardTemplateProps & {
  templateUrl?: string;
  component?: DashboardTemplate;
};

export function DefaultDashboard({ options, scope = {}, registry, dataModelRegistry = {} }: DashboardTemplateProps): JSX.Element {
  const dashboard = useDashboard(options, scope);
  const contextDashboard: Record<string, unknown> = { ...dashboard };
  return (
    <DashboardContext.Provider value={{ options, events: dashboard.events, widgetRegistry: registry, dataModelRegistry, dashboard: contextDashboard }}>
      <div>
        {!options.hideToolbar && <div className="btn-toolbar"><DashboardToolbar options={options} /></div>}
        <div className="dashboard-widget-area">
          {dashboard.widgets.map((widget) => (
            <Widget
              key={widget.uid}
              widget={widget}
              options={options}
              scope={scope}
              registry={registry}
              dataModelRegistry={dataModelRegistry}
              onRemove={dashboard.removeWidget}
              onOpenSettings={dashboard.openWidgetSettings}
              onWidgetChanged={(changed) => dashboard.events.emit('widgetChanged', changed)}
            />
          ))}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

export const dashboardTemplates: Record<string, DashboardTemplate> = {
  'components/directives/dashboard/dashboard.html': DefaultDashboard,
  'components/directives/dashboard/altDashboard.html': AltDashboard,
};

export function Dashboard({ templateUrl = 'components/directives/dashboard/dashboard.html', component, ...props }: DashboardProps): JSX.Element {
  if (component) {
    const Component = component;
    return <Component {...props} />;
  }
  const Template = dashboardTemplates[templateUrl];
  if (!Template) {
    logger.warn(`Unknown dashboard template: ${templateUrl}`);
    return <DefaultDashboard {...props} />;
  }
  return <Template {...props} />;
}
