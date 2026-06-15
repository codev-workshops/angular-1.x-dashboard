import React, { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { WidgetModel } from '../../models/WidgetModel';
import { WidgetDefCollection } from '../../models/WidgetDefCollection';
import { DashboardState } from '../../models/DashboardState';
import { Widget } from '../Widget';
import { DashboardOptions, WidgetDefinition } from '../../types';

export interface DashboardProps {
  options: DashboardOptions;
  children?: (widget: WidgetModel, index: number) => React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ options, children }) => {
  const [widgets, setWidgets] = useState<WidgetModel[]>([]);
  const widgetDefsRef = useRef<WidgetDefCollection | null>(null);
  const dashboardStateRef = useRef<DashboardState | null>(null);
  const countRef = useRef(1);

  const defaults = {
    stringifyStorage: true,
    hideWidgetSettings: false,
    hideWidgetClose: false,
    onSettingsClose: (result: any, widget: WidgetModel) => {
      Object.assign(widget, result);
    },
    onSettingsDismiss: (reason: any) => {
      console.info('widget settings were dismissed. Reason: ', reason);
    },
  };

  const mergedOptions = { ...defaults, ...options };

  // Initialize widget defs and dashboard state
  useEffect(() => {
    const widgetDefs = new WidgetDefCollection(mergedOptions.widgetDefinitions);
    widgetDefsRef.current = widgetDefs;

    const state = new DashboardState(
      mergedOptions.storage,
      mergedOptions.storageId || 'default',
      mergedOptions.storageHash,
      widgetDefs,
      mergedOptions.stringifyStorage !== false
    );
    dashboardStateRef.current = state;

    const saved = state.load();

    function handleStateLoad(saved: Record<string, any>[] | null) {
      if (saved && saved.length) {
        loadWidgets(saved as Array<{ name: string; [key: string]: any }>);
      } else if (mergedOptions.defaultWidgets) {
        loadWidgets(mergedOptions.defaultWidgets);
      } else {
        setWidgets([]);
      }
    }

    if (Array.isArray(saved)) {
      handleStateLoad(saved);
    } else if (saved && typeof saved === 'object' && 'then' in saved) {
      (saved as Promise<Record<string, any>[]>).then(handleStateLoad, () => handleStateLoad(null));
    } else {
      handleStateLoad(null);
    }
  }, []);

  const getWidget = useCallback(
    (widgetToInstantiate: string | { name: string; title?: string; [key: string]: any }) => {
      if (typeof widgetToInstantiate === 'string') {
        widgetToInstantiate = { name: widgetToInstantiate };
      }

      const defaultWidgetDef = widgetDefsRef.current?.getByName(widgetToInstantiate.name);
      if (!defaultWidgetDef) {
        throw new Error('Widget ' + widgetToInstantiate.name + ' is not found.');
      }

      if (!widgetToInstantiate.title && !defaultWidgetDef.title) {
        widgetToInstantiate.title = 'Widget ' + countRef.current++;
      }

      return new WidgetModel(defaultWidgetDef, widgetToInstantiate);
    },
    []
  );

  const saveDashboard = useCallback(
    (force?: boolean) => {
      if (!mergedOptions.explicitSave) {
        dashboardStateRef.current?.save(widgets);
      } else {
        if (force) {
          mergedOptions.unsavedChangeCount = 0;
          dashboardStateRef.current?.save(widgets);
        } else {
          mergedOptions.unsavedChangeCount = (mergedOptions.unsavedChangeCount || 0) + 1;
        }
      }
    },
    [widgets, mergedOptions]
  );

  const addWidget = useCallback(
    (widgetToInstantiate: string | { name: string; [key: string]: any }, doNotSave?: boolean) => {
      const widget = getWidget(widgetToInstantiate);
      setWidgets((prev) => {
        const next = [...prev, widget];
        if (!doNotSave) {
          setTimeout(() => dashboardStateRef.current?.save(next));
        }
        return next;
      });
      return widget;
    },
    [getWidget]
  );

  const prependWidget = useCallback(
    (widgetToInstantiate: string | { name: string; [key: string]: any }, doNotSave?: boolean) => {
      const widget = getWidget(widgetToInstantiate);
      setWidgets((prev) => {
        const next = [widget, ...prev];
        if (!doNotSave) {
          setTimeout(() => dashboardStateRef.current?.save(next));
        }
        return next;
      });
      return widget;
    },
    [getWidget]
  );

  const removeWidget = useCallback(
    (widget: WidgetModel) => {
      setWidgets((prev) => {
        const next = prev.filter((w) => w !== widget);
        setTimeout(() => dashboardStateRef.current?.save(next));
        return next;
      });
    },
    []
  );

  const loadWidgets = useCallback(
    (widgetDefs: Array<{ name: string; [key: string]: any }>) => {
      const newWidgets: WidgetModel[] = [];
      widgetDefs.forEach((def) => {
        const widgetToInstantiate = typeof def === 'string' ? { name: def } : def;
        const defaultWidgetDef = widgetDefsRef.current?.getByName(widgetToInstantiate.name);
        if (defaultWidgetDef) {
          if (!widgetToInstantiate.title && !defaultWidgetDef.title) {
            widgetToInstantiate.title = 'Widget ' + countRef.current++;
          }
          newWidgets.push(new WidgetModel(defaultWidgetDef, widgetToInstantiate));
        }
      });
      setWidgets(newWidgets);
    },
    []
  );

  const clearWidgets = useCallback(
    (doNotSave?: boolean) => {
      setWidgets([]);
      if (doNotSave !== true) {
        setTimeout(() => dashboardStateRef.current?.save([]));
      }
    },
    []
  );

  const resetWidgetsToDefault = useCallback(() => {
    if (mergedOptions.defaultWidgets) {
      loadWidgets(mergedOptions.defaultWidgets);
    }
    setTimeout(() => saveDashboard());
  }, [mergedOptions.defaultWidgets, loadWidgets, saveDashboard]);

  const handleWidgetChanged = useCallback(
    (_widget: WidgetModel) => {
      saveDashboard();
    },
    [saveDashboard]
  );

  // Expose API on options object for external use
  useEffect(() => {
    (options as any).addWidget = addWidget;
    (options as any).prependWidget = prependWidget;
    (options as any).loadWidgets = loadWidgets;
    (options as any).saveDashboard = (force?: boolean) =>
      saveDashboard(force !== undefined ? force : true);
    (options as any).removeWidget = removeWidget;
    (options as any).clear = clearWidgets;
    (options as any).resetWidgetsToDefault = resetWidgetsToDefault;
    (options as any).currentWidgets = widgets;
  }, [options, addWidget, prependWidget, loadWidgets, saveDashboard, removeWidget, clearWidgets, resetWidgetsToDefault, widgets]);

  return (
    <div>
      {!mergedOptions.hideToolbar && (
        <div className="btn-toolbar">
          {mergedOptions.widgetButtons ? (
            <div className="btn-group">
              {widgetDefsRef.current?.getAll().map((def: WidgetDefinition) => (
                <button
                  key={def.name}
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addWidget(def)}
                >
                  {def.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="btn-group">
              <div className="dropdown">
                <button
                  type="button"
                  className="btn btn-primary dropdown-toggle"
                  data-toggle="dropdown"
                >
                  Add Widget <span className="caret" />
                </button>
                <ul className="dropdown-menu" role="menu">
                  {widgetDefsRef.current?.getAll().map((def: WidgetDefinition) => (
                    <li key={def.name}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          addWidget(def);
                        }}
                      >
                        <span className="label label-primary">{def.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button className="btn btn-warning" onClick={resetWidgetsToDefault}>
            Default Widgets
          </button>

          {mergedOptions.storage && mergedOptions.explicitSave && (
            <button
              className="btn btn-success"
              onClick={() => saveDashboard(true)}
              disabled={!mergedOptions.unsavedChangeCount}
            >
              {!mergedOptions.unsavedChangeCount
                ? 'all saved'
                : `save changes (${mergedOptions.unsavedChangeCount})`}
            </button>
          )}

          <button className="btn btn-info" onClick={() => clearWidgets()}>
            Clear
          </button>
        </div>
      )}

      <div className="dashboard-widget-area">
        {widgets.map((widget, index) => (
          <Widget
            key={widget.name + '-' + index}
            widget={widget}
            hideClose={mergedOptions.hideWidgetClose}
            hideSettings={mergedOptions.hideWidgetSettings}
            onRemove={removeWidget}
            onChanged={handleWidgetChanged}
          >
            {children?.(widget, index)}
          </Widget>
        ))}
      </div>
    </div>
  );
};
