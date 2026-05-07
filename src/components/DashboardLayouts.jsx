import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import Dashboard from './Dashboard';
import SaveChangesModal from './SaveChangesModal';
import LayoutStorage from '../models/LayoutStorage';

function SortableTab({ layout, isActive, onActivate, onRemove, onEditTitle, onSaveTitleEdit, onTitleBlur }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: layout.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const inputRef = useRef(null);

  useEffect(() => {
    if (layout.editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, 9999);
    }
  }, [layout.editingTitle]);

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className={isActive ? 'active' : ''}>
      <a onClick={() => onActivate(layout)}>
        {!layout.editingTitle && (
          <span onDoubleClick={() => onEditTitle(layout)}>{layout.title}</span>
        )}
        {layout.editingTitle && (
          <form className="layout-title" onSubmit={(e) => onSaveTitleEdit(layout, e)} style={{ display: 'inline-block' }}>
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              value={layout.title}
              onChange={(e) => { layout.title = e.target.value; onSaveTitleEdit(layout); }}
              onBlur={(e) => onTitleBlur(layout, e)}
              data-layout={layout.id}
            />
          </form>
        )}
        {!layout.locked && (
          <span className="glyphicon glyphicon-remove remove-layout-icon" onClick={(e) => { e.stopPropagation(); onRemove(layout); }} />
        )}
      </a>
    </li>
  );
}

export default function DashboardLayouts({ options }) {
  const [, forceUpdate] = useState(0);
  const layoutStorageRef = useRef(null);
  const [saveModalLayout, setSaveModalLayout] = useState(null);
  const pendingLayoutRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  if (!layoutStorageRef.current && options) {
    layoutStorageRef.current = new LayoutStorage(options);
  }
  const layoutStorage = layoutStorageRef.current;
  const layouts = layoutStorage ? layoutStorage.layouts : [];

  const rerender = useCallback(() => forceUpdate(n => n + 1), []);

  const createNewLayout = useCallback(() => {
    const newLayout = { title: 'Custom', defaultWidgets: options.defaultWidgets || [] };
    layoutStorage.add(newLayout);
    layouts.forEach(l => { l.active = l === newLayout; });
    layoutStorage.save();
    rerender();
    return newLayout;
  }, [layoutStorage, layouts, options, rerender]);

  const removeLayout = useCallback((layout) => {
    layoutStorage.remove(layout);
    layoutStorage.save();
    rerender();
  }, [layoutStorage, rerender]);

  const _makeLayoutActive = useCallback((layout) => {
    layouts.forEach(l => { l.active = l === layout; });
    layoutStorage.save();
    rerender();
  }, [layouts, layoutStorage, rerender]);

  const makeLayoutActive = useCallback((layout) => {
    const current = layoutStorage.getActiveLayout();
    if (current && current.dashboard && current.dashboard.unsavedChangeCount) {
      pendingLayoutRef.current = layout;
      setSaveModalLayout(current);
    } else {
      _makeLayoutActive(layout);
    }
  }, [layoutStorage, _makeLayoutActive]);

  const handleSaveAndSwitch = useCallback(() => {
    const current = saveModalLayout;
    if (current && current.dashboard && current.dashboard.saveDashboard) {
      current.dashboard.saveDashboard();
    }
    _makeLayoutActive(pendingLayoutRef.current);
    setSaveModalLayout(null);
  }, [saveModalLayout, _makeLayoutActive]);

  const handleDiscardAndSwitch = useCallback(() => {
    _makeLayoutActive(pendingLayoutRef.current);
    setSaveModalLayout(null);
  }, [_makeLayoutActive]);

  const editTitle = useCallback((layout) => {
    if (layout.locked) return;
    layout.editingTitle = true;
    rerender();
  }, [rerender]);

  const saveTitleEdit = useCallback((layout, event) => {
    layout.editingTitle = false;
    layoutStorage.save();
    if (event) event.preventDefault();
    rerender();
  }, [layoutStorage, rerender]);

  const titleLostFocus = useCallback((layout, event) => {
    if (layout && layout.editingTitle) {
      if (layout.title !== '') {
        saveTitleEdit(layout, event);
      }
    }
  }, [saveTitleEdit]);

  useEffect(() => {
    if (options) {
      options.saveLayouts = () => { layoutStorage.save(true); };
      options.addWidget = function() {
        const layout = layoutStorage.getActiveLayout();
        if (layout && layout.dashboard && layout.dashboard.addWidget) layout.dashboard.addWidget.apply(null, arguments);
      };
      options.prependWidget = function() {
        const layout = layoutStorage.getActiveLayout();
        if (layout && layout.dashboard && layout.dashboard.prependWidget) layout.dashboard.prependWidget.apply(null, arguments);
      };
      options.loadWidgets = function() {
        const layout = layoutStorage.getActiveLayout();
        if (layout && layout.dashboard && layout.dashboard.loadWidgets) layout.dashboard.loadWidgets.apply(null, arguments);
      };
      options.saveDashboard = function() {
        const layout = layoutStorage.getActiveLayout();
        if (layout && layout.dashboard && layout.dashboard.saveDashboard) layout.dashboard.saveDashboard.apply(null, arguments);
      };
    }
  }, [options, layoutStorage]);

  const handleTabDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = layouts.findIndex(l => l.id === active.id);
      const newIndex = layouts.findIndex(l => l.id === over.id);
      const [removed] = layouts.splice(oldIndex, 1);
      layouts.splice(newIndex, 0, removed);
      layoutStorage.save();
      rerender();
    }
  }, [layouts, layoutStorage, rerender]);

  const activeLayout = layouts.find(l => l.active);

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
        <SortableContext items={layouts.map(l => l.id)} strategy={horizontalListSortingStrategy}>
          <ul className="nav nav-tabs layout-tabs">
            {layouts.map(layout => (
              <SortableTab
                key={layout.id}
                layout={layout}
                isActive={layout.active}
                onActivate={makeLayoutActive}
                onRemove={removeLayout}
                onEditTitle={editTitle}
                onSaveTitleEdit={saveTitleEdit}
                onTitleBlur={titleLostFocus}
              />
            ))}
            <li>
              <a onClick={createNewLayout}>
                <span className="glyphicon glyphicon-plus"></span>
              </a>
            </li>
          </ul>
        </SortableContext>
      </DndContext>

      {activeLayout && (
        <Dashboard key={activeLayout.id} options={activeLayout.dashboard} />
      )}

      <SaveChangesModal
        show={!!saveModalLayout}
        layout={saveModalLayout}
        onSave={handleSaveAndSwitch}
        onDiscard={handleDiscardAndSwitch}
      />
    </div>
  );
}
