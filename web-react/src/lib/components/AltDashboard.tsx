import { useEffect, useMemo, useState } from 'react';
import type { DashboardTemplateProps } from './Dashboard';
import { DashboardContext } from '../DashboardContext';
import { useDashboard } from '../useDashboard';
import { DashboardToolbar } from './DashboardToolbar';
import { WidgetModel } from '../models/WidgetModel';
import { resolveWidgetContent } from '../registry';
import type { WidgetContentProps } from '../models/types';

function contentProps(widget: WidgetModel, scope: Record<string, unknown>, widgetData: unknown): WidgetContentProps {
  const attrs = widget.attrs ?? {};
  const resolved = Object.fromEntries(Object.entries(attrs).map(([name, value]) => [name, Object.prototype.hasOwnProperty.call(scope, value) ? scope[value] : value]));
  if (widget.dataAttrName) resolved[widget.dataAttrName] = widgetData;
  return { ...resolved, widgetData, scope };
}

function AltWidget({ widget, options, scope, registry, dataModelRegistry, onRemove, onOpenSettings, onWidgetChanged }: {
  widget: WidgetModel;
  options: DashboardTemplateProps['options'];
  scope: Record<string, unknown>;
  registry: DashboardTemplateProps['registry'];
  dataModelRegistry: NonNullable<DashboardTemplateProps['dataModelRegistry']>;
  onRemove: (widget: WidgetModel) => void;
  onOpenSettings: (widget: WidgetModel) => void;
  onWidgetChanged: (widget: WidgetModel) => void;
}): JSX.Element {
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(widget.title);
  const [widgetData, setWidgetData] = useState<unknown>();
  const resolution = useMemo(() => resolveWidgetContent(widget, registry), [registry, widget]);
  useEffect(() => {
    const type = widget.dataModelType;
    if (!type) return undefined;
    const Model = typeof type === 'string' ? dataModelRegistry[type] : type;
    if (!Model) return undefined;
    const model = new Model();
    model.setup(widget, { updateScope: setWidgetData });
    model.init();
    return () => model.destroy();
  }, [dataModelRegistry, widget]);
  const Component = resolution.Component;
  const saveTitle = (): void => { widget.title = draftTitle; setEditingTitle(false); onWidgetChanged(widget); };
  const handles = [
    ['widget-w-resizer', ['nw', 'w', 'sw'], false],
    ['widget-e-resizer', ['ne', 'e', 'se'], false],
    ['widget-n-resizer', ['nw', 'n', 'ne'], true],
    ['widget-s-resizer', ['sw', 's', 'se'], true],
  ] as const;
  return (
    <div className="widget-container" style={widget.style}>
      <div className="widget panel panel-default">
        <div className="widget-header panel-heading">
          <h3 className="panel-title">
            <span className="widget-title" onDoubleClick={() => { setDraftTitle(widget.title); setEditingTitle(true); }} style={{ display: editingTitle ? 'none' : undefined }}>{widget.title}</span>
            <form action="" className="widget-title" onSubmit={(event) => { event.preventDefault(); saveTitle(); }} style={{ display: editingTitle ? undefined : 'none' }}>
              <input type="text" value={draftTitle} onChange={(event) => { widget.title = event.target.value; setDraftTitle(event.target.value); }} onBlur={saveTitle} className="form-control" autoFocus={editingTitle} />
            </form>
            {!options.hideWidgetName && <span className="label label-primary">{widget.name}</span>}
            {!options.hideWidgetClose && <span onClick={() => onRemove(widget)} className="glyphicon glyphicon-remove" />}
            {!options.hideWidgetSettings && <span onClick={() => onOpenSettings(widget)} className="glyphicon glyphicon-cog" />}
          </h3>
        </div>
        <div className="panel-body widget-content">
          {Component && <Component {...contentProps(widget, scope, widgetData)} />}
        </div>
        {handles.map(([group, regions, verticalOnly]) => verticalOnly && !widget.enableVerticalResize ? null : (
          <div className={group} key={group}>{regions.filter((region) => widget.enableVerticalResize || (region === 'w' || region === 'e')).map((region) => <div className={`${region}-resizer`} key={region} />)}</div>
        ))}
      </div>
    </div>
  );
}

export function AltDashboard({ options, scope = {}, registry, dataModelRegistry = {} }: DashboardTemplateProps): JSX.Element {
  const dashboard = useDashboard(options, scope);
  const contextDashboard: Record<string, unknown> = { ...dashboard };
  return (
    <DashboardContext.Provider value={{ options, events: dashboard.events, widgetRegistry: registry, dataModelRegistry, dashboard: contextDashboard }}>
      <div>
        {!options.hideToolbar && <div className="btn-toolbar"><DashboardToolbar options={options} variant="alt" /></div>}
        <div className="dashboard-widget-area">
          {dashboard.widgets.map((widget) => <AltWidget key={widget.uid} widget={widget} options={options} scope={scope} registry={registry} dataModelRegistry={dataModelRegistry} onRemove={dashboard.removeWidget} onOpenSettings={dashboard.openWidgetSettings} onWidgetChanged={(changed) => dashboard.events.emit('widgetChanged', changed)} />)}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
