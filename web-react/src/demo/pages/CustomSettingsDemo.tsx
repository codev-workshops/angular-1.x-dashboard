import { useEffect, useMemo, useState } from 'react';
import { merge } from 'lodash-es';
import { Dashboard } from '../../lib/components/Dashboard';
import type { DashboardOptions, WidgetDefinition } from '../../lib/models/types';
import type { WidgetSettingsPartialProps } from '../../lib/components/WidgetSettingsModal';
import { ConfigurableWidgetModalOptions, type ConfigurableResult } from '../widgets/ConfigurableWidgetModalOptions';
import { dataModelRegistry, widgetRegistry } from '../registry';
import { RandomDataModel } from '../dataModels/RandomDataModel';

type SettingsResult = Record<string, unknown> & {
  dataModelOptions?: {
    limit?: unknown;
  };
};

type SettingsWidget = Record<string, unknown> & {
  dataModel?: {
    updateLimit?: (limit: unknown) => void;
  };
};

function getSettingsArgs(args: unknown[]): { result: SettingsResult; widget: SettingsWidget } | undefined {
  const result = args[0];
  const widget = args[1];
  if (!result || typeof result !== 'object' || !widget || typeof widget !== 'object') return undefined;
  return { result: result as SettingsResult, widget: widget as SettingsWidget };
}

const definitions: WidgetDefinition[] = [
  {
    name: 'congfigurable widget',
    directive: 'wt-scope-watch',
    dataAttrName: 'value',
    dataModelType: RandomDataModel,
    dataModelOptions: { limit: 10 },
    settingsModalOptions: { partialTemplateUrl: 'app/template/configurableWidgetModalOptions.html' },
    onSettingsClose: (...args: unknown[]) => {
      const settings = getSettingsArgs(args);
      if (!settings) return;
      const { result, widget } = settings;
      if (widget.dataModel && widget.dataModel.updateLimit) {
        widget.dataModel.updateLimit(result.dataModelOptions?.limit);
      }
    },
  },
  {
    name: 'override modal widget',
    directive: 'wt-scope-watch',
    dataAttrName: 'value',
    dataModelType: RandomDataModel,
    settingsModalOptions: {
      templateUrl: 'app/template/WidgetSpecificSettings.html',
      controller: 'WidgetSpecificSettingsCtrl',
      backdrop: false,
    },
    onSettingsClose: (...args: unknown[]) => {
      const settings = getSettingsArgs(args);
      if (settings) merge(settings.widget, settings.result);
    },
    onSettingsDismiss: (...args: unknown[]) => { void args; },
  },
];

const defaultWidgets: WidgetDefinition[] = [
  { name: 'congfigurable widget' },
  { name: 'override modal widget' },
];

function ConfigurablePartial({ result, updateResult }: WidgetSettingsPartialProps): JSX.Element {
  const partialResult: ConfigurableResult = { dataModelOptions: { limit: result.dataModelOptions?.limit ?? '' } };
  return <ConfigurableWidgetModalOptions result={partialResult} onChange={(next) => updateResult((draft) => { draft.dataModelOptions = next.dataModelOptions; })} />;
}

export function CustomSettingsDemo(): JSX.Element {
  const [randomValue, setRandomValue] = useState(() => Math.random());
  const options = useMemo<DashboardOptions>(() => ({
    widgetButtons: true,
    widgetDefinitions: definitions,
    defaultWidgets,
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: 'custom-settings',
    onSettingsClose: (...args: unknown[]) => {
      const settings = getSettingsArgs(args);
      if (settings) merge(settings.widget, settings.result);
    },
    onSettingsDismiss: (...args: unknown[]) => { void args; },
  }), []);
  useEffect(() => {
    const interval = window.setInterval(() => setRandomValue(Math.random()), 500);
    return () => window.clearInterval(interval);
  }, []);
  const modalPartials = useMemo(() => ({ 'app/template/configurableWidgetModalOptions.html': ConfigurablePartial }), []);
  return (
    <>
      <p>
        <a ng-click="prependWidget()" onClick={() => options.prependWidget?.({ name: 'congfigurable widget', title: 'Prepend Widget' })}>Click here</a> to add new widget to beginning of dashboard.  This demonstrates the prependWidget function.	See <a href="https://github.com/DataTorrent/malhar-angular-dashboard/issues/141" target="_blank">issue #141</a>.
      </p>
      <div className="row">
        <div className="col-md-12">
          <div {...{ dashboard: 'dashboardOptions' }} className="dashboard-container">
            <Dashboard
              options={options}
              scope={{ randomValue }}
              registry={widgetRegistry}
              dataModelRegistry={dataModelRegistry}
              modalPartials={modalPartials}
            />
          </div>
        </div>
      </div>
    </>
  );
}
