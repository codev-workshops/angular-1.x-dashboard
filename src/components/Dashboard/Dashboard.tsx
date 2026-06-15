import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import _ from 'lodash';
import { WidgetModel } from '../../models/WidgetModel';
import { WidgetDefCollection } from '../../models/WidgetDefCollection';
import { DashboardState } from '../../models/DashboardState';
import { Widget } from '../Widget';
import { WidgetSettingsModal } from '../WidgetSettingsModal';
import { DashboardOptions, WidgetDefinition } from '../../types';

export interface DashboardProps {
  options: DashboardOptions;
  children?: (widget: WidgetModel, index: number) => React.ReactNode;
}

interface SortableWidgetProps {
  widget: WidgetModel;
  index: number;
  hideClose?: boolean;
  hideSettings?: boolean;
  hideWidgetName?: boolean;
  onRemove: (widget: WidgetModel) => void;
  onSettingsOpen: (widget: WidgetModel) => void;
  onChanged: (widget: WidgetModel) => void;
  children?: React.ReactNode;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({
  widget,
  index: _index,
  hideClose,
  hideSettings,
  hideWidgetName,
  onRemove,
  onSettingsOpen,
  onChanged,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(widget._id),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Widget
        widget={widget}
        hideClose={hideClose}
        hideSettings={hideSettings}
        hideWidgetName={hideWidgetName}
        onRemove={onRemove}
        onSettingsOpen={onSettingsOpen}
        onChanged={onChanged}
        dragListeners={listeners}
      >
        {children}
      </Widget>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ options, children }) => {
  const [widgets, setWidgets] = useState<WidgetModel[]>([]);
  const [unsavedChangeCount, setUnsavedChangeCount] = useState(0);
  const [settingsWidget, setSettingsWidget] = useState<WidgetModel | null>(null);
  const widgetDefsRef = useRef<WidgetDefCollection | null>(null);
  const dashboardStateRef = useRef<DashboardState | null>(null);
  const countRef = useRef(1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

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
    (force?: boolean, widgetsToSave?: WidgetModel[]) => {
      const target = widgetsToSave ?? widgets;
      if (!mergedOptions.explicitSave) {
        dashboardStateRef.current?.save(target);
      } else {
        if (force) {
          setUnsavedChangeCount(0);
          dashboardStateRef.current?.save(target);
        } else {
          setUnsavedChangeCount((prev) => prev + 1);
        }
      }
    },
    [widgets, mergedOptions.explicitSave]
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
      return newWidgets;
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
    let newWidgets: WidgetModel[] = [];
    if (mergedOptions.defaultWidgets) {
      newWidgets = loadWidgets(mergedOptions.defaultWidgets);
    }
    setTimeout(() => dashboardStateRef.current?.save(newWidgets));
  }, [mergedOptions.defaultWidgets, loadWidgets]);

  const handleWidgetChanged = useCallback(
    (_widget: WidgetModel) => {
      saveDashboard();
    },
    [saveDashboard]
  );

  const openWidgetSettings = useCallback((widget: WidgetModel) => {
    setSettingsWidget(widget);
  }, []);

  const handleSettingsClose = useCallback(
    (result: Record<string, any>) => {
      if (settingsWidget) {
        const onClose = settingsWidget.onSettingsClose || mergedOptions.onSettingsClose;
        onClose(result, settingsWidget);
        saveDashboard();
      }
      setSettingsWidget(null);
    },
    [settingsWidget, mergedOptions.onSettingsClose, saveDashboard]
  );

  const handleSettingsDismiss = useCallback(
    (reason: string) => {
      const onDismiss = settingsWidget?.onSettingsDismiss || mergedOptions.onSettingsDismiss;
      onDismiss(reason);
      setSettingsWidget(null);
    },
    [settingsWidget, mergedOptions.onSettingsDismiss]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setWidgets((prev) => {
        const oldIndex = prev.findIndex((w) => String(w._id) === String(active.id));
        const newIndex = prev.findIndex((w) => String(w._id) === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        setTimeout(() => dashboardStateRef.current?.save(next));
        return next;
      });
    },
    []
  );

  // Expose API on options object for external use
  useEffect(() => {
    (options as any).addWidget = addWidget;
    (options as any).prependWidget = prependWidget;
    (options as any).loadWidgets = loadWidgets;
    (options as any).saveDashboard = (force?: boolean) =>
      saveDashboard(force !== undefined ? force : true);
    (options as any).removeWidget = removeWidget;
    (options as any).openWidgetSettings = openWidgetSettings;
    (options as any).clear = clearWidgets;
    (options as any).resetWidgetsToDefault = resetWidgetsToDefault;
    (options as any).currentWidgets = widgets;
    (options as any).unsavedChangeCount = unsavedChangeCount;
  }, [options, addWidget, prependWidget, loadWidgets, saveDashboard, removeWidget, openWidgetSettings, clearWidgets, resetWidgetsToDefault, widgets, unsavedChangeCount]);

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
              disabled={!unsavedChangeCount}
            >
              {!unsavedChangeCount
                ? 'all saved'
                : `save changes (${unsavedChangeCount})`}
            </button>
          )}

          <button className="btn btn-info" onClick={() => clearWidgets()}>
            Clear
          </button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => String(w._id))} strategy={verticalListSortingStrategy}>
          <div className="dashboard-widget-area">
            {widgets.map((widget, index) => (
              <SortableWidget
                key={widget._id}
                widget={widget}
                index={index}
                hideClose={mergedOptions.hideWidgetClose}
                hideSettings={mergedOptions.hideWidgetSettings}
                hideWidgetName={mergedOptions.hideWidgetName}
                onRemove={removeWidget}
                onSettingsOpen={openWidgetSettings}
                onChanged={handleWidgetChanged}
              >
                {children?.(widget, index)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {settingsWidget && (
        <WidgetSettingsModal
          widget={settingsWidget}
          onClose={handleSettingsClose}
          onDismiss={handleSettingsDismiss}
        />
      )}
    </div>
  );
};
