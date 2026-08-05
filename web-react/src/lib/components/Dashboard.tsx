import type { ComponentType } from 'react';
import { DashboardContext } from '../DashboardContext';
import { useDashboard } from '../useDashboard';
import type { DashboardOptions, DataModelRegistry, WidgetRegistry } from '../models/types';
import { Widget } from './Widget';
import { DashboardToolbar } from './DashboardToolbar';
import { AltDashboard } from './AltDashboard';
import { logger } from '../logger';
import { ModalProvider, useWidgetSettings, type ModalRegistry, type WidgetSettingsPartialRegistry } from '../useModal';

export type DashboardTemplateProps = {
  options: DashboardOptions;
  scope?: Record<string, unknown>;
  registry: WidgetRegistry;
  dataModelRegistry?: DataModelRegistry;
  modalRegistry?: ModalRegistry;
  modalPartials?: WidgetSettingsPartialRegistry;
};

export type DashboardTemplate = ComponentType<DashboardTemplateProps>;
export type DashboardProps = DashboardTemplateProps & {
  templateUrl?: string;
  component?: DashboardTemplate;
};

function DefaultDashboardContent({ options, scope = {}, registry, dataModelRegistry = {} }: DashboardTemplateProps): JSX.Element {
  const dashboard = useDashboard(options, scope);
  const openWidgetSettings = useWidgetSettings({ options, scope, events: dashboard.events });
  const handleOpenSettings = options.onOpenWidgetSettings ? dashboard.openWidgetSettings : openWidgetSettings;
  const contextDashboard: Record<string, unknown> = { ...dashboard };
  return (
    <DashboardContext.Provider value={{ options, events: dashboard.events, widgetRegistry: registry, dataModelRegistry, dashboard: contextDashboard }}>
      <div>
        {!options.hideToolbar && <div className="btn-toolbar"><DashboardToolbar options={options} /></div>}
        <div className="dashboard-widget-area" ui-sortable="sortableOptions" ng-model="widgets">
          {dashboard.widgets.map((widget) => (
            <Widget
              key={widget.uid}
              widget={widget}
              options={options}
              scope={scope}
              registry={registry}
              dataModelRegistry={dataModelRegistry}
              onRemove={dashboard.removeWidget}
              onOpenSettings={handleOpenSettings}
              onWidgetChanged={(changed) => dashboard.events.emit('widgetChanged', changed)}
            />
          ))}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

export function DefaultDashboard(props: DashboardTemplateProps): JSX.Element {
  return (
    <ModalProvider registry={props.modalRegistry} partials={props.modalPartials}>
      <DefaultDashboardContent {...props} />
    </ModalProvider>
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
