import React, { useCallback, useRef, useState } from 'react';
import { LayoutStorage, LayoutDefinition, LayoutStorageOptions } from '../../models/LayoutStorage';
import { Dashboard } from '../Dashboard';

export interface DashboardLayoutsProps {
  options: LayoutStorageOptions;
  onUnsavedChangesConfirm?: () => Promise<boolean>;
  children?: (widget: any, index: number) => React.ReactNode;
}

export const DashboardLayouts: React.FC<DashboardLayoutsProps> = ({
  options,
  onUnsavedChangesConfirm,
  children,
}) => {
  const layoutStorageRef = useRef<LayoutStorage>(new LayoutStorage(options));
  const [layouts, setLayouts] = useState<LayoutDefinition[]>(layoutStorageRef.current.layouts);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => {
    setLayouts([...layoutStorageRef.current.layouts]);
    forceUpdate((n) => n + 1);
  }, []);

  const createNewLayout = useCallback(() => {
    const newLayout = {
      title: 'Custom',
      defaultWidgets: options.defaultWidgets || [],
    };
    layoutStorageRef.current.add(newLayout);
    makeLayoutActiveInternal(layoutStorageRef.current.layouts[layoutStorageRef.current.layouts.length - 1]);
    layoutStorageRef.current.save();
    refresh();
  }, [options.defaultWidgets, refresh]);

  const removeLayout = useCallback(
    (layout: LayoutDefinition) => {
      layoutStorageRef.current.remove(layout);
      layoutStorageRef.current.save();
      refresh();
    },
    [refresh]
  );

  const makeLayoutActiveInternal = useCallback(
    (layout: LayoutDefinition) => {
      layoutStorageRef.current.layouts.forEach((l) => {
        l.active = l === layout;
      });
      layoutStorageRef.current.save();
      refresh();
    },
    [refresh]
  );

  const makeLayoutActive = useCallback(
    async (layout: LayoutDefinition) => {
      const current = layoutStorageRef.current.getActiveLayout();

      if (current && current.dashboard.unsavedChangeCount) {
        if (onUnsavedChangesConfirm) {
          const shouldSave = await onUnsavedChangesConfirm();
          if (shouldSave) {
            current.dashboard.saveDashboard?.();
          }
        }
      }

      makeLayoutActiveInternal(layout);
    },
    [onUnsavedChangesConfirm, makeLayoutActiveInternal]
  );

  const handleEditTitle = useCallback(
    (layout: LayoutDefinition) => {
      if (layout.locked) return;
      layout.editingTitle = true;
      refresh();
      setTimeout(() => {
        const input = document.querySelector(
          `input[data-layout="${layout.id}"]`
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.setSelectionRange(0, 9999);
        }
      });
    },
    [refresh]
  );

  const handleSaveTitleEdit = useCallback(
    (layout: LayoutDefinition, e?: React.FormEvent | React.FocusEvent) => {
      if (e) e.preventDefault();
      layout.editingTitle = false;
      layoutStorageRef.current.save();
      refresh();
    },
    [refresh]
  );

  const handleTitleLostFocus = useCallback(
    (layout: LayoutDefinition, e: React.FocusEvent) => {
      if (layout && layout.editingTitle) {
        if (layout.title !== '') {
          handleSaveTitleEdit(layout, e);
        }
      }
    },
    [handleSaveTitleEdit]
  );

  // Expose API on options
  options.saveLayouts = () => layoutStorageRef.current.save();
  options.addWidget = (...args: any[]) => {
    const active = layoutStorageRef.current.getActiveLayout();
    if (active) {
      active.dashboard.addWidget?.(...args);
    }
  };

  const activeLayout = layouts.find((l) => l.active);

  return (
    <div>
      <ul className="nav nav-tabs layout-tabs">
        {layouts.map((layout) => (
          <li
            key={layout.id}
            className={layout.active ? 'active' : ''}
          >
            <a onClick={() => makeLayoutActive(layout)}>
              {!layout.editingTitle ? (
                <span onDoubleClick={() => handleEditTitle(layout)}>
                  {layout.title}
                </span>
              ) : (
                <form
                  className="layout-title"
                  onSubmit={(e) => handleSaveTitleEdit(layout, e)}
                >
                  <input
                    type="text"
                    value={layout.title}
                    onChange={(e) => {
                      layout.title = e.target.value;
                      refresh();
                    }}
                    onBlur={(e) => handleTitleLostFocus(layout, e)}
                    className="form-control"
                    data-layout={layout.id}
                  />
                </form>
              )}
              {!layout.locked && (
                <span
                  className="glyphicon glyphicon-remove remove-layout-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayout(layout);
                  }}
                />
              )}
            </a>
          </li>
        ))}
        <li>
          <a onClick={createNewLayout}>
            <span className="glyphicon glyphicon-plus" />
          </a>
        </li>
      </ul>

      {activeLayout && (
        <Dashboard
          key={String(activeLayout.id)}
          options={activeLayout.dashboard as any}
        >
          {children}
        </Dashboard>
      )}
    </div>
  );
};
