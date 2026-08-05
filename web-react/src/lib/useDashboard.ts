import { useEffect, useMemo, useRef, useState } from 'react';
import { defaults, merge } from 'lodash-es';
import { DashboardState } from './models/DashboardState';
import { WidgetDefCollection } from './models/WidgetDefCollection';
import { WidgetModel } from './models/WidgetModel';
import type { DashboardOptions, WidgetDefinition, WidgetModelLike, WidgetRegistry, DataModelRegistry } from './models/types';
import { createDashboardEvents, type DashboardEvents } from './events';
import { logger } from './logger';

export type DashboardHookOptions = DashboardOptions & {
  widgetRegistry?: WidgetRegistry;
  dataModelRegistry?: DataModelRegistry;
};

export type DashboardApi = {
  widgets: WidgetModel[];
  widgetDefs: WidgetDefCollection;
  dashboardState: DashboardState;
  events: DashboardEvents;
  sortableOptions: Record<string, unknown>;
  version: number;
  notifyChanged: () => void;
  addWidget: (spec: WidgetDefinition | string, doNotSave?: boolean) => WidgetModel;
  prependWidget: (spec: WidgetDefinition | string, doNotSave?: boolean) => WidgetModel;
  removeWidget: (widget: WidgetModel) => void;
  clear: (doNotSave?: boolean) => void;
  loadWidgets: (defs: WidgetDefinition[]) => void;
  resetWidgetsToDefault: () => unknown;
  saveDashboard: (force?: boolean) => unknown;
  externalSaveDashboard: (force?: boolean) => unknown;
  openWidgetSettings: (widget: WidgetModel) => void;
  savedWidgetDefs?: WidgetDefinition[];
};

export function useDashboard(options: DashboardHookOptions, scope: Record<string, unknown> = {}): DashboardApi {
  void scope;
  const [version, setVersion] = useState(0);
  const [widgets, setWidgets] = useState<WidgetModel[]>([]);
  const events = useMemo(() => createDashboardEvents(), []);
  const defsInput = options.widgetDefinitions ?? [];
  const widgetDefs = useMemo(() => new WidgetDefCollection(defsInput), [defsInput]);
  const defaultWidgets = options.defaultWidgets;
  const counter = useRef(1);
  const loaded = useRef(false);
  const apiRef = useRef<DashboardApi | undefined>(undefined);
  const savedWidgetDefsRef = useRef<WidgetDefinition[] | undefined>(undefined);
  const widgetsRef = useRef(widgets);
  widgetsRef.current = widgets;

  options.settingsModalOptions ??= {};
  defaults(options.settingsModalOptions, { templateUrl: 'components/directives/dashboard/widget-settings-template.html', controller: 'WidgetSettingsCtrl' });
  defaults(options, {
    stringifyStorage: true,
    hideWidgetSettings: false,
    hideWidgetClose: false,
    onSettingsClose: (result: unknown, widget: WidgetModelLike) => merge(widget, result),
    onSettingsDismiss: (reason: unknown) => logger.info('widget settings were dismissed. Reason: ', reason),
  });

  const saveDashboard = (force?: boolean): unknown => {
    if (!options.explicitSave) return dashboardState.save(widgetsRef.current);
    if (typeof options.unsavedChangeCount !== 'number') options.unsavedChangeCount = 0;
    if (force) {
      options.unsavedChangeCount = 0;
      const result = dashboardState.save(widgetsRef.current);
      setVersion((value) => value + 1);
      return result;
    }
    options.unsavedChangeCount += 1;
    setVersion((value) => value + 1);
    return undefined;
  };

  const dashboardState = useMemo(() => new DashboardState(
    options.storage,
    options.storageId,
    options.storageHash,
    widgetDefs,
    options.stringifyStorage ?? true,
  ), [options.storage, options.storageId, options.storageHash, options.stringifyStorage, widgetDefs]);

  const notifyChanged = (): void => setVersion((value) => value + 1);
  const getWidget = (spec: WidgetDefinition | string): WidgetModel => {
    const widgetSpec: WidgetDefinition = typeof spec === 'string' ? { name: spec } : spec;
    const definition = widgetDefs.getByName(widgetSpec.name ?? '');
    if (!definition) throw 'Widget ' + widgetSpec.name + ' is not found.';
    if (!widgetSpec.title && !definition.title) widgetSpec.title = 'Widget ' + counter.current++;
    return new WidgetModel(definition, widgetSpec);
  };
  const addWidget = (spec: WidgetDefinition | string, doNotSave?: boolean): WidgetModel => {
    const widget = getWidget(spec);
    widgetsRef.current.push(widget);
    setWidgets([...widgetsRef.current]);
    events.emit('widgetAdded', widget);
    if (!doNotSave) saveDashboard();
    return widget;
  };
  const prependWidget = (spec: WidgetDefinition | string, doNotSave?: boolean): WidgetModel => {
    const widget = getWidget(spec);
    widgetsRef.current.unshift(widget);
    setWidgets([...widgetsRef.current]);
    events.emit('widgetAdded', widget);
    if (!doNotSave) saveDashboard();
    return widget;
  };
  const removeWidget = (widget: WidgetModelLike): void => {
    const index = widgetsRef.current.findIndex((entry) => entry.uid === widget.uid);
    if (index >= 0) widgetsRef.current.splice(index, 1);
    setWidgets([...widgetsRef.current]);
    saveDashboard();
  };
  const clear = (doNotSave?: boolean): void => {
    widgetsRef.current = [];
    setWidgets([]);
    if (doNotSave === true) return;
    saveDashboard();
  };
  const loadWidgets = (defs: WidgetDefinition[]): void => {
    savedWidgetDefsRef.current = defs;
    if (apiRef.current) apiRef.current.savedWidgetDefs = defs;
    clear(true);
    defs.forEach((definition) => addWidget(definition, true));
  };
  const resetWidgetsToDefault = (): unknown => {
    loadWidgets(defaultWidgets ?? []);
    return saveDashboard();
  };
  const externalSaveDashboard = (force?: boolean): unknown => saveDashboard(force === undefined ? true : force);
  const openWidgetSettings = (widget: WidgetModelLike): void => {
    const callback = options.onOpenWidgetSettings;
    if (typeof callback === 'function') callback(widget);
  };

  const api: DashboardApi = {
    widgets, widgetDefs, dashboardState, events, sortableOptions: {
      stop: saveDashboard, handle: '.widget-header', distance: 5, ...(options.sortableOptions ?? {}),
    },
    version, savedWidgetDefs: savedWidgetDefsRef.current, notifyChanged, addWidget, prependWidget, removeWidget, clear, loadWidgets,
    resetWidgetsToDefault, saveDashboard, externalSaveDashboard, openWidgetSettings,
  };
  apiRef.current = api;

  options.addWidget = addWidget;
  options.prependWidget = prependWidget;
  options.loadWidgets = loadWidgets;
  options.saveDashboard = externalSaveDashboard;
  options.removeWidget = removeWidget;
  options.openWidgetSettings = openWidgetSettings;
  options.clear = clear;
  options.resetWidgetsToDefault = resetWidgetsToDefault;
  options.currentWidgets = widgets as WidgetModel[];

  useEffect(() => {
    options.currentWidgets = widgets;
  }, [options, widgets]);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const handleStateLoad = (saved?: unknown): void => {
      options.unsavedChangeCount = 0;
      if (Array.isArray(saved) && saved.length) loadWidgets(saved as WidgetDefinition[]);
      else if (defaultWidgets) loadWidgets(defaultWidgets);
      else clear(true);
      setVersion((value) => value + 1);
    };
    const saved = dashboardState.load();
    if (Array.isArray(saved)) handleStateLoad(saved);
    else if (saved && typeof saved === 'object' && 'then' in saved && typeof saved.then === 'function') {
      (saved as Promise<unknown>).then(handleStateLoad, handleStateLoad);
    } else handleStateLoad();
  }, [dashboardState, defaultWidgets, options, loadWidgets, clear]);

  useEffect(() => events.on('widgetChanged', () => { saveDashboard(); notifyChanged(); }), [events, saveDashboard]);

  return { ...api, widgets, version };
}
