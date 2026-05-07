import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import _ from 'lodash';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Widget from './Widget';
import WidgetSettingsModal from './WidgetSettingsModal';
import WidgetModel from '../models/WidgetModel';
import WidgetDefCollection from '../models/WidgetDefCollection';
import DashboardState from '../models/DashboardState';

function SortableWidget({ widget, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: widget.wid });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Widget widget={widget} {...props} />
    </div>
  );
}

export default function Dashboard({ options, dashboardRef }) {
  const [widgets, setWidgets] = useState([]);
  const [settingsWidget, setSettingsWidget] = useState(null);
  const [unsavedChangeCount, setUnsavedChangeCount] = useState(0);
  const stateRef = useRef(null);
  const widgetDefsRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const widgetDefinitions = useMemo(() => {
    if (!options || !options.widgetDefinitions) return new WidgetDefCollection([]);
    return new WidgetDefCollection(options.widgetDefinitions);
  }, [options && options.widgetDefinitions]);

  useEffect(() => { widgetDefsRef.current = widgetDefinitions; }, [widgetDefinitions]);

  const dashboardState = useMemo(() => {
    if (!options) return null;
    const storage = options.storage || (options.useLocalStorage ? localStorage : null);
    return new DashboardState(storage, options.storageId, options.storageHash || '', widgetDefinitions, options.stringifyStorage !== false);
  }, [options, widgetDefinitions]);

  useEffect(() => { stateRef.current = dashboardState; }, [dashboardState]);

  const saveDashboard = useCallback(() => {
    if (stateRef.current) {
      stateRef.current.save(widgets);
      setUnsavedChangeCount(0);
    }
  }, [widgets]);

  const addWidget = useCallback((widgetToAdd, doNotSave) => {
    if (typeof widgetToAdd === 'string') widgetToAdd = widgetDefsRef.current?.getByName(widgetToAdd);
    if (!widgetToAdd) return;
    const wdg = new WidgetModel(widgetToAdd, {});
    setWidgets(prev => {
      const next = [...prev, wdg];
      if (!doNotSave && !optionsRef.current?.explicitSave && stateRef.current) setTimeout(() => stateRef.current.save(next), 0);
      if (optionsRef.current?.explicitSave && !doNotSave) setUnsavedChangeCount(c => c + 1);
      return next;
    });
    return wdg;
  }, []);

  const prependWidget = useCallback((widgetToAdd, doNotSave) => {
    if (typeof widgetToAdd === 'string') widgetToAdd = widgetDefsRef.current?.getByName(widgetToAdd);
    if (!widgetToAdd) return;
    const wdg = new WidgetModel(widgetToAdd, {});
    setWidgets(prev => {
      const next = [wdg, ...prev];
      if (!doNotSave && !optionsRef.current?.explicitSave && stateRef.current) setTimeout(() => stateRef.current.save(next), 0);
      if (optionsRef.current?.explicitSave && !doNotSave) setUnsavedChangeCount(c => c + 1);
      return next;
    });
  }, []);

  const removeWidget = useCallback((widget) => {
    setWidgets(prev => {
      const next = prev.filter(w => w.wid !== widget.wid);
      if (!optionsRef.current?.explicitSave && stateRef.current) setTimeout(() => stateRef.current.save(next), 0);
      if (optionsRef.current?.explicitSave) setUnsavedChangeCount(c => c + 1);
      return next;
    });
  }, []);

  const loadDefaults = useCallback(() => {
    const dw = optionsRef.current?.defaultWidgets || [];
    const wdgs = dw.map(def => {
      const defObj = typeof def === 'string' ? widgetDefsRef.current?.getByName(def) : (widgetDefsRef.current?.getByName(def.name) || def);
      if (!defObj) return null;
      return new WidgetModel(defObj, typeof def === 'object' ? def : {});
    }).filter(Boolean);
    setWidgets(wdgs);
    if (stateRef.current && !optionsRef.current?.explicitSave) stateRef.current.save(wdgs);
  }, []);

  const loadWidgets = useCallback((overrideWidgets) => {
    let loaded;
    if (overrideWidgets) { loaded = overrideWidgets; }
    else if (stateRef.current) { loaded = stateRef.current.load(); }

    if (loaded && typeof loaded.then === 'function') {
      loaded.then((result) => {
        const wdgs = result.map(def => new WidgetModel(widgetDefsRef.current?.getByName(def.name) || def, def));
        setWidgets(wdgs);
      }).catch(() => loadDefaults());
    } else if (loaded) {
      const wdgs = loaded.map(def => new WidgetModel(widgetDefsRef.current?.getByName(def.name) || def, def));
      setWidgets(wdgs);
    } else {
      loadDefaults();
    }
  }, [loadDefaults]);

  const resetWidgetsToDefault = useCallback(() => { loadDefaults(); setUnsavedChangeCount(0); }, [loadDefaults]);

  const clearWidgets = useCallback(() => {
    setWidgets([]);
    if (stateRef.current && !optionsRef.current?.explicitSave) stateRef.current.save([]);
    if (optionsRef.current?.explicitSave) setUnsavedChangeCount(c => c + 1);
  }, []);

  const onWidgetChanged = useCallback((widget) => {
    if (!optionsRef.current?.explicitSave && stateRef.current) {
      setWidgets(prev => { setTimeout(() => stateRef.current.save(prev), 0); return [...prev]; });
    }
    if (optionsRef.current?.explicitSave) setUnsavedChangeCount(c => c + 1);
  }, []);

  const openWidgetSettings = useCallback((widget) => { setSettingsWidget(widget); }, []);

  const handleSettingsClose = useCallback((result) => {
    if (settingsWidget && result) {
      Object.assign(settingsWidget, { title: result.title, dataModelOptions: result.dataModelOptions });
      if (settingsWidget.dataModel && result.dataModelOptions) {
        settingsWidget.dataModel.dataModelOptions = result.dataModelOptions;
        if (settingsWidget.dataModel.updateLimit && result.dataModelOptions.limit !== undefined) {
          settingsWidget.dataModel.updateLimit(result.dataModelOptions.limit);
        }
      }
      onWidgetChanged(settingsWidget);
      if (optionsRef.current?.onSettingsClose) optionsRef.current.onSettingsClose(result, settingsWidget, dashboardState);
    }
    setSettingsWidget(null);
  }, [settingsWidget, onWidgetChanged, dashboardState]);

  const handleSettingsDismiss = useCallback(() => {
    if (optionsRef.current?.onSettingsDismiss) optionsRef.current.onSettingsDismiss(settingsWidget, dashboardState);
    setSettingsWidget(null);
  }, [settingsWidget, dashboardState]);

  useEffect(() => { loadWidgets(); }, []);

  useEffect(() => {
    if (options) {
      options.addWidget = addWidget;
      options.prependWidget = prependWidget;
      options.loadWidgets = loadWidgets;
      options.saveDashboard = saveDashboard;
      options.unsavedChangeCount = unsavedChangeCount;
    }
  }, [options, addWidget, prependWidget, loadWidgets, saveDashboard, unsavedChangeCount]);

  useEffect(() => { if (options) options.unsavedChangeCount = unsavedChangeCount; }, [unsavedChangeCount, options]);

  useEffect(() => {
    if (dashboardRef) {
      dashboardRef.current = { addWidget, prependWidget, removeWidget, loadWidgets, saveDashboard, clearWidgets, resetWidgetsToDefault, unsavedChangeCount };
    }
  }, [dashboardRef, addWidget, prependWidget, removeWidget, loadWidgets, saveDashboard, clearWidgets, resetWidgetsToDefault, unsavedChangeCount]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setWidgets(prev => {
        const oldIndex = prev.findIndex(w => w.wid === active.id);
        const newIndex = prev.findIndex(w => w.wid === over.id);
        const result = [...prev];
        const [removed] = result.splice(oldIndex, 1);
        result.splice(newIndex, 0, removed);
        if (!optionsRef.current?.explicitSave && stateRef.current) setTimeout(() => stateRef.current.save(result), 0);
        if (optionsRef.current?.explicitSave) setUnsavedChangeCount(c => c + 1);
        return result;
      });
    }
  }, []);

  const widgetButtons = options?.widgetButtons !== undefined ? options.widgetButtons : true;

  return (
    <div className="dashboard-container">
      <div className="btn-toolbar" style={{ marginBottom: 10 }}>
        {widgetButtons && widgetDefinitions.map((wd) => (
          <button key={wd.name} className="btn btn-default btn-sm" onClick={() => addWidget(wd)} style={{ marginRight: 4 }}>
            {wd.title || wd.name}
          </button>
        ))}
        {!widgetButtons && widgetDefinitions.length > 0 && (
          <div className="dropdown" style={{ display: 'inline-block', marginRight: 5 }}>
            <button className="btn btn-default btn-sm dropdown-toggle" onClick={(e) => {
              const dd = e.currentTarget.nextElementSibling;
              dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
            }}>
              Add Widget <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" style={{ display: 'none' }}>
              {widgetDefinitions.map((wd) => (
                <li key={wd.name}><a onClick={() => addWidget(wd)}>{wd.title || wd.name}</a></li>
              ))}
            </ul>
          </div>
        )}
        <button className="btn btn-warning btn-sm" onClick={resetWidgetsToDefault} style={{ marginRight: 4 }}>Default Widgets</button>
        <button className="btn btn-info btn-sm" onClick={clearWidgets} style={{ marginRight: 4 }}>Clear</button>
        {options?.explicitSave && (
          <button className="btn btn-success btn-sm" onClick={saveDashboard}>
            Save ({unsavedChangeCount} unsaved)
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.wid)} strategy={horizontalListSortingStrategy}>
          <div className="dashboard-widget-area">
            {widgets.map(widget => (
              <SortableWidget
                key={widget.wid}
                widget={widget}
                onRemove={removeWidget}
                onSettingsOpen={openWidgetSettings}
                onWidgetChanged={onWidgetChanged}
                hideWidgetSettings={options?.hideWidgetSettings}
                hideWidgetClose={options?.hideWidgetClose}
                hideWidgetName={options?.hideWidgetName}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {settingsWidget && (
        <WidgetSettingsModal
          show={true}
          widget={settingsWidget}
          onClose={handleSettingsClose}
          onDismiss={handleSettingsDismiss}
          partialContent={options?.settingsModalOptions?.partialTemplateContent}
          customTemplate={options?.settingsModalOptions?.customTemplate || settingsWidget.settingsModalOptions?.customTemplate}
        />
      )}
    </div>
  );
}
