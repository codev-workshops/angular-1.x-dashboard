import { useRef } from 'react';
import { Dashboard } from './Dashboard';
import { useDashboardLayouts, type DashboardLayoutsOptions } from '../useDashboardLayouts';
import { ModalProvider, type ModalRegistry, type WidgetSettingsPartialRegistry } from '../useModal';
import { useSortable, type SortableOptions } from '../useSortable';
import type { DashboardOptions, DataModelRegistry, WidgetRegistry } from '../models/types';

export type DashboardLayoutsProps = {
  options: DashboardLayoutsOptions;
  scope?: Record<string, unknown>;
  registry: WidgetRegistry;
  dataModelRegistry?: DataModelRegistry;
  modalRegistry?: ModalRegistry;
  modalPartials?: WidgetSettingsPartialRegistry;
};

function DashboardLayoutsContent({
  options,
  scope = {},
  registry,
  dataModelRegistry,
  modalRegistry,
  modalPartials,
}: DashboardLayoutsProps): JSX.Element {
  const tabsRef = useRef<HTMLUListElement>(null);
  const layouts = useDashboardLayouts(options, tabsRef);
  useSortable({
    containerRef: tabsRef,
    items: layouts.layouts,
    itemSelector: 'li',
    options: layouts.sortableOptions as SortableOptions,
    onReorder: layouts.reorderLayouts,
  });

  return (
    <>
      <ul ref={tabsRef} ui-sortable="sortableOptions" ng-model="layouts" className="nav nav-tabs layout-tabs">
        {layouts.layouts.map((layout) => {
          const editing = layouts.isEditingTitle(layout);
          return (
            <li key={layout.id} className={layout.active ? 'active' : undefined}>
              <a onClick={() => layouts.makeLayoutActive(layout)}>
                {' '}
                <span
                  ng-dblclick="editTitle(layout)"
                  onDoubleClick={() => layouts.editTitle(layout)}
                  style={{ display: editing ? 'none' : undefined }}
                >{layout.title}</span>
                {' '}
                <form
                  action=""
                  className="layout-title"
                  style={{ display: editing ? undefined : 'none' }}
                  onSubmit={(event) => layouts.saveTitleEdit(layout, event)}
                >
                  <input
                    type="text"
                    ng-model="layout.title"
                    value={layout.title ?? ''}
                    onChange={(event) => layouts.setTitle(layout, event.target.value)}
                    onBlur={(event) => layouts.titleLostFocus(layout, event)}
                    className="form-control"
                    data-layout={layout.id}
                  />
                </form>
                {' '}
                {!layout.locked && (
                  <span
                    onClick={() => layouts.removeLayout(layout)}
                    className="glyphicon glyphicon-remove remove-layout-icon"
                  ></span>
                )}
                {' '}
              </a>
            </li>
          );
        })}
        <li>
          <a onClick={() => layouts.createNewLayout()}>
            <span className="glyphicon glyphicon-plus"></span>
          </a>
        </li>
      </ul>
      {layouts.layouts.filter(layouts.isActive).map((layout) => (
        <div key={layout.id} {...{ dashboard: 'layout.dashboard', 'template-url': 'components/directives/dashboard/dashboard.html' }}>
          <Dashboard
            options={layout.dashboard as DashboardOptions}
            scope={scope}
            registry={registry}
            dataModelRegistry={dataModelRegistry}
            modalRegistry={modalRegistry}
            modalPartials={modalPartials}
          />
        </div>
      ))}
    </>
  );
}

export function DashboardLayouts(props: DashboardLayoutsProps): JSX.Element {
  return (
    <ModalProvider registry={props.modalRegistry} partials={props.modalPartials}>
      <DashboardLayoutsContent {...props} />
    </ModalProvider>
  );
}
