import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutStorage } from './models/LayoutStorage';
import { ModalProvider } from './useModal';
import { useDashboardLayouts, type DashboardLayoutsOptions } from './useDashboardLayouts';
import type { DashboardOptions, LayoutDefinition, StorageLike, WidgetDefinition } from './models/types';

const widgetDefinitions: WidgetDefinition[] = [
  { name: 'wt-one', template: '<div class="wt-one-value">{{2 + 2}}</div>' },
  { name: 'wt-two', template: '<span class="wt-two-value">{{value}}</span>' },
];

function makeOptions(overrides: Partial<DashboardLayoutsOptions> = {}): DashboardLayoutsOptions {
  const defaultWidgets = widgetDefinitions.slice();
  return {
    widgetButtons: true,
    widgetDefinitions,
    defaultLayouts: [
      { title: 'first', active: true, defaultWidgets },
      { title: 'second', active: false, defaultWidgets },
    ],
    defaultWidgets,
    storage: { setItem: () => undefined, getItem: () => undefined, removeItem: () => undefined },
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }): JSX.Element {
  return createElement(ModalProvider, null, children);
}

function setup(options: DashboardLayoutsOptions) {
  return renderHook(() => useDashboardLayouts(options), { wrapper });
}

afterEach(() => vi.restoreAllMocks());

describe('useDashboardLayouts', () => {
  it('does not require storage', () => {
    const options = makeOptions();
    delete options.storage;
    expect(() => setup(options)).not.toThrow();
  });

  it('renders the default layouts and sets the first one active when none is', () => {
    const options = makeOptions({
      defaultLayouts: [
        { title: 'first', active: false },
        { title: 'second', active: false },
      ],
    });
    const { result } = setup(options);
    expect(result.current.layouts.map((layout) => layout.title)).toEqual(['first', 'second']);
    expect(result.current.layouts.filter((layout) => layout.active)).toHaveLength(1);
    expect(result.current.layouts[0].active).toBe(true);
  });

  describe('createNewLayout', () => {
    it('calls the add and save methods of LayoutStorage', () => {
      const add = vi.spyOn(LayoutStorage.prototype, 'add');
      const save = vi.spyOn(LayoutStorage.prototype, 'save');
      const { result } = setup(makeOptions());
      act(() => { result.current.createNewLayout(); });
      expect(add).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
    });

    it('returns the newly created layout object, active, and appended to the tabs', () => {
      const { result } = setup(makeOptions());
      let created: LayoutDefinition | undefined;
      act(() => { created = result.current.createNewLayout(); });
      expect(typeof created).toBe('object');
      expect(created?.title).toBe('Custom');
      expect(created?.active).toBe(true);
      expect(result.current.layouts).toHaveLength(3);
    });

    it('sets defaultWidgets to options.defaultWidgets when present', () => {
      const options = makeOptions();
      const { result } = setup(options);
      let created: LayoutDefinition | undefined;
      act(() => { created = result.current.createNewLayout(); });
      expect(created?.defaultWidgets).toBe(options.defaultWidgets);
    });

    it('sets defaultWidgets to an empty array when options.defaultWidgets is absent', () => {
      const options = makeOptions();
      delete options.defaultWidgets;
      const { result } = setup(options);
      let created: LayoutDefinition | undefined;
      act(() => { created = result.current.createNewLayout(); });
      expect(created?.defaultWidgets).toEqual([]);
    });
  });

  describe('removeLayout', () => {
    it('calls the remove and save methods of LayoutStorage with the layout it was passed', () => {
      const remove = vi.spyOn(LayoutStorage.prototype, 'remove');
      const save = vi.spyOn(LayoutStorage.prototype, 'save');
      const { result } = setup(makeOptions());
      const layout = result.current.layouts[0];
      act(() => { result.current.removeLayout(layout); });
      expect(remove).toHaveBeenCalledWith(layout);
      expect(save).toHaveBeenCalled();
      expect(result.current.layouts).toHaveLength(1);
    });
  });

  describe('makeLayoutActive', () => {
    it('switches immediately when the active dashboard has no unsaved changes', () => {
      const { result } = setup(makeOptions());
      act(() => { result.current.makeLayoutActive(result.current.layouts[1]); });
      expect(result.current.layouts[0].active).toBe(false);
      expect(result.current.layouts[1].active).toBe(true);
    });

    it('opens the save-changes modal and defers the switch when there are unsaved changes', async () => {
      const { result } = setup(makeOptions());
      const current = result.current.layouts[0];
      const dashboard = current.dashboard as DashboardOptions;
      dashboard.unsavedChangeCount = 1;
      const saveDashboard = vi.fn();
      dashboard.saveDashboard = saveDashboard;
      const target = result.current.layouts[1];
      act(() => { result.current.makeLayoutActive(target); });
      expect(target.active).toBe(false);
      await act(async () => { await Promise.resolve(); });
      expect(saveDashboard).not.toHaveBeenCalled();
      expect(target.active).toBe(true);
    });

    it('_makeLayoutActive marks exactly one layout active and saves', () => {
      const save = vi.spyOn(LayoutStorage.prototype, 'save');
      const { result } = setup(makeOptions());
      act(() => { result.current._makeLayoutActive(result.current.layouts[1]); });
      expect(result.current.layouts.filter((layout) => layout.active)).toEqual([result.current.layouts[1]]);
      expect(save).toHaveBeenCalled();
      expect(result.current.isActive(result.current.layouts[1])).toBe(true);
      expect(result.current.isActive(result.current.layouts[0])).toBe(false);
    });
  });

  describe('editTitle', () => {
    it('marks the layout as editing its title', () => {
      const { result } = setup(makeOptions());
      const layout = result.current.layouts[0];
      act(() => { result.current.editTitle(layout); });
      expect(result.current.isEditingTitle(layout)).toBe(true);
    });

    it('exits when the layout is locked', () => {
      const { result } = setup(makeOptions({ lockDefaultLayouts: true }));
      const layout = result.current.layouts[0];
      expect(layout.locked).toBe(true);
      act(() => { result.current.editTitle(layout); });
      expect(result.current.isEditingTitle(layout)).toBe(false);
    });
  });

  describe('saveTitleEdit', () => {
    it('stops editing, saves and prevents the default event', () => {
      const save = vi.spyOn(LayoutStorage.prototype, 'save');
      const { result } = setup(makeOptions());
      const layout = result.current.layouts[0];
      const preventDefault = vi.fn();
      act(() => { result.current.editTitle(layout); });
      act(() => { result.current.setTitle(layout, 'renamed'); });
      act(() => { result.current.saveTitleEdit(layout, { preventDefault }); });
      expect(result.current.isEditingTitle(layout)).toBe(false);
      expect(layout.title).toBe('renamed');
      expect(save).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('titleLostFocus', () => {
    it('saves a non-empty title and keeps editing a blank one', () => {
      const { result } = setup(makeOptions());
      const layout = result.current.layouts[0];
      act(() => { result.current.editTitle(layout); });
      act(() => { result.current.setTitle(layout, ''); });
      act(() => { result.current.titleLostFocus(layout); });
      expect(result.current.isEditingTitle(layout)).toBe(true);
      act(() => { result.current.setTitle(layout, 'kept'); });
      act(() => { result.current.titleLostFocus(layout); });
      expect(result.current.isEditingTitle(layout)).toBe(false);
    });
  });

  describe('the options public API', () => {
    let mockDashboard: DashboardOptions;
    let mockLayout: LayoutDefinition;

    beforeEach(() => {
      mockDashboard = {
        addWidget: vi.fn(),
        prependWidget: vi.fn(),
        loadWidgets: vi.fn(),
        saveDashboard: vi.fn(),
      } as unknown as DashboardOptions;
      mockLayout = { active: true, dashboard: mockDashboard };
    });

    it('saveLayouts calls LayoutStorage.save', () => {
      const save = vi.spyOn(LayoutStorage.prototype, 'save');
      const options = makeOptions();
      setup(options);
      act(() => { options.saveLayouts?.(); });
      expect(save).toHaveBeenCalled();
    });

    it('proxies addWidget, prependWidget, loadWidgets and saveDashboard to the active layout', () => {
      vi.spyOn(LayoutStorage.prototype, 'getActiveLayout').mockReturnValue(mockLayout);
      const options = makeOptions();
      setup(options);
      options.addWidget?.({ name: 'wt-one' });
      options.prependWidget?.({ name: 'wt-two' });
      options.loadWidgets?.([{ name: 'wt-one' }]);
      options.saveDashboard?.(true);
      expect(mockDashboard.addWidget).toHaveBeenCalledWith({ name: 'wt-one' }, undefined);
      expect(mockDashboard.prependWidget).toHaveBeenCalledWith({ name: 'wt-two' }, undefined);
      expect(mockDashboard.loadWidgets).toHaveBeenCalledWith([{ name: 'wt-one' }]);
      expect(mockDashboard.saveDashboard).toHaveBeenCalledWith(true);
    });

    it('does nothing when there is no active layout', () => {
      vi.spyOn(LayoutStorage.prototype, 'getActiveLayout').mockReturnValue(false);
      const options = makeOptions();
      setup(options);
      expect(() => {
        options.addWidget?.({ name: 'wt-one' });
        options.prependWidget?.({ name: 'wt-one' });
        options.loadWidgets?.([]);
        options.saveDashboard?.();
      }).not.toThrow();
    });

    it('sortableOptions.stop calls saveLayouts', () => {
      const options = makeOptions();
      const { result } = setup(options);
      const saveLayouts = vi.fn();
      options.saveLayouts = saveLayouts;
      const stop = result.current.sortableOptions.stop as () => void;
      stop();
      expect(saveLayouts).toHaveBeenCalled();
      expect(result.current.sortableOptions.distance).toBe(5);
    });

    it('reorders the layouts array', () => {
      const options = makeOptions();
      const { result } = setup(options);
      act(() => { result.current.reorderLayouts(0, 1); });
      expect(result.current.layouts.map((layout) => layout.title)).toEqual(['second', 'first']);
    });
  });

  describe('per-layout dashboard options', () => {
    it('uses the LayoutStorage instance as each dashboard storage with stringifyStorage false', () => {
      const storage: StorageLike = { setItem: vi.fn(), getItem: () => undefined, removeItem: vi.fn() };
      const options = makeOptions({ storage, storageId: 'demo-layouts' });
      const { result } = setup(options);
      result.current.layouts.forEach((layout) => {
        const dashboard = layout.dashboard as DashboardOptions;
        expect(dashboard.storage).toBe(result.current.layoutStorage);
        expect(dashboard.stringifyStorage).toBe(false);
        expect(dashboard.storageId).toBe(layout.id);
      });
    });
  });
});
