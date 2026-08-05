import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { FormEvent, RefObject } from 'react';
import { LayoutStorage } from './models/LayoutStorage';
import { SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL, useModal } from './useModal';
import type { DashboardOptions, LayoutDefinition, LayoutStorageOptions, WidgetDefinition, WidgetModelLike } from './models/types';

export type DashboardLayoutsOptions = LayoutStorageOptions & {
  sortableOptions?: Record<string, unknown>;
  saveLayouts?: () => void;
  addWidget?: (spec: WidgetDefinition | string, doNotSave?: boolean) => WidgetModelLike | undefined;
  prependWidget?: (spec: WidgetDefinition | string, doNotSave?: boolean) => WidgetModelLike | undefined;
  loadWidgets?: (widgets: WidgetDefinition[]) => void;
  saveDashboard?: (force?: boolean) => unknown;
};

export type DashboardLayoutsApi = {
  layoutStorage: LayoutStorage;
  layouts: LayoutDefinition[];
  sortableOptions: Record<string, unknown>;
  createNewLayout: () => LayoutDefinition;
  removeLayout: (layout: LayoutDefinition) => void;
  makeLayoutActive: (layout: LayoutDefinition) => void;
  _makeLayoutActive: (layout: LayoutDefinition) => void;
  isActive: (layout: LayoutDefinition) => boolean;
  isEditingTitle: (layout: LayoutDefinition) => boolean;
  editTitle: (layout: LayoutDefinition) => void;
  setTitle: (layout: LayoutDefinition, title: string) => void;
  saveTitleEdit: (layout: LayoutDefinition, event?: FormEvent | { preventDefault: () => void }) => void;
  titleLostFocus: (layout: LayoutDefinition, event?: FormEvent | { preventDefault: () => void }) => void;
  reorderLayouts: (from: number, to: number) => void;
};

type LayoutsState = { revision: number; editingId: string | number | null };

function dashboardOf(layout: LayoutDefinition | false | undefined): DashboardOptions | undefined {
  return layout && layout.dashboard ? layout.dashboard as DashboardOptions : undefined;
}

function activeDashboard(layoutStorage: LayoutStorage): DashboardOptions | undefined {
  return dashboardOf(layoutStorage.getActiveLayout());
}

export function useDashboardLayouts(
  options: DashboardLayoutsOptions,
  containerRef?: RefObject<HTMLElement>,
): DashboardLayoutsApi {
  const layoutStorage = useMemo(() => new LayoutStorage(options), [options]);
  const store = useMemo<StoreApi<LayoutsState>>(() => createStore<LayoutsState>(() => ({ revision: 0, editingId: null })), []);
  const { editingId } = useSyncExternalStore(store.subscribe, store.getState);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const notify = useCallback((): void => {
    store.setState((state) => ({ revision: state.revision + 1 }));
  }, [store]);

  const _makeLayoutActive = useCallback((layout: LayoutDefinition): void => {
    layoutStorage.layouts.forEach((entry) => {
      entry.active = entry === layout;
    });
    layoutStorage.save();
    notify();
  }, [layoutStorage, notify]);

  const { open } = useModal();

  const makeLayoutActive = useCallback((layout: LayoutDefinition): void => {
    const current = layoutStorage.getActiveLayout();
    const currentDashboard = dashboardOf(current);
    if (current && currentDashboard && currentDashboard.unsavedChangeCount) {
      const modalInstance = open({
        templateUrl: SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL,
        resolve: { layout },
        controller: 'SaveChangesModalCtrl',
      });
      modalInstance.result.then(
        () => {
          currentDashboard.saveDashboard?.();
          _makeLayoutActive(layout);
        },
        () => {
          _makeLayoutActive(layout);
        },
      );
      return;
    }
    _makeLayoutActive(layout);
  }, [_makeLayoutActive, layoutStorage, open]);

  const createNewLayout = useCallback((): LayoutDefinition => {
    const newLayout: LayoutDefinition = {
      title: 'Custom',
      defaultWidgets: optionsRef.current.defaultWidgets || [],
    };
    layoutStorage.add(newLayout);
    makeLayoutActive(newLayout);
    layoutStorage.save();
    notify();
    return newLayout;
  }, [layoutStorage, makeLayoutActive, notify]);

  const removeLayout = useCallback((layout: LayoutDefinition): void => {
    layoutStorage.remove(layout);
    layoutStorage.save();
    notify();
  }, [layoutStorage, notify]);

  const isActive = useCallback((layout: LayoutDefinition): boolean => !!layout.active, []);
  const isEditingTitle = useCallback(
    (layout: LayoutDefinition): boolean => editingId !== null && editingId === layout.id,
    [editingId],
  );

  const editTitle = useCallback((layout: LayoutDefinition): void => {
    if (layout.locked) return;
    store.setState({ editingId: layout.id ?? null });
    setTimeout(() => {
      const input = containerRef?.current?.querySelector<HTMLInputElement>(`input[data-layout="${layout.id}"]`);
      if (!input) return;
      input.focus();
      input.setSelectionRange(0, 9999);
    }, 0);
  }, [containerRef, store]);

  const setTitle = useCallback((layout: LayoutDefinition, title: string): void => {
    layout.title = title;
    notify();
  }, [notify]);

  const saveTitleEdit = useCallback((
    layout: LayoutDefinition,
    event?: FormEvent | { preventDefault: () => void },
  ): void => {
    store.setState({ editingId: null });
    layoutStorage.save();
    notify();
    if (event) event.preventDefault();
  }, [layoutStorage, notify, store]);

  const titleLostFocus = useCallback((
    layout: LayoutDefinition,
    event?: FormEvent | { preventDefault: () => void },
  ): void => {
    if (!layout || store.getState().editingId !== layout.id) return;
    if (layout.title !== '') {
      saveTitleEdit(layout, event);
      return;
    }
    setTimeout(() => {
      containerRef?.current?.querySelector<HTMLInputElement>(`input[data-layout="${layout.id}"]`)?.focus();
    }, 0);
  }, [containerRef, saveTitleEdit, store]);

  const reorderLayouts = useCallback((from: number, to: number): void => {
    const [layout] = layoutStorage.layouts.splice(from, 1);
    layoutStorage.layouts.splice(to, 0, layout);
    notify();
  }, [layoutStorage, notify]);

  const sortableOptions = useMemo(() => ({
    stop: () => optionsRef.current.saveLayouts?.(),
    distance: 5,
    ...(options.sortableOptions ?? {}),
  }), [options.sortableOptions]);

  options.saveLayouts = () => {
    layoutStorage.save();
    notify();
  };
  options.addWidget = (spec, doNotSave) => activeDashboard(layoutStorage)?.addWidget?.(spec, doNotSave);
  options.prependWidget = (spec, doNotSave) => activeDashboard(layoutStorage)?.prependWidget?.(spec, doNotSave);
  options.loadWidgets = (widgets) => activeDashboard(layoutStorage)?.loadWidgets?.(widgets);
  options.saveDashboard = (force) => activeDashboard(layoutStorage)?.saveDashboard?.(force);

  return {
    layoutStorage,
    layouts: layoutStorage.layouts,
    sortableOptions,
    createNewLayout,
    removeLayout,
    makeLayoutActive,
    _makeLayoutActive,
    isActive,
    isEditingTitle,
    editTitle,
    setTitle,
    saveTitleEdit,
    titleLostFocus,
    reorderLayouts,
  };
}
