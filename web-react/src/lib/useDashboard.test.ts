import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDashboard } from './useDashboard';
import type { DashboardOptions, StorageLike } from './models/types';

const defs = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
function memoryStorage(initial: Record<string, unknown> = {}): StorageLike & { values: Record<string, unknown> } {
  return { values: initial, getItem: (key) => initial[key], setItem: (key, value) => { initial[key] = value; }, removeItem: (key) => { delete initial[key]; } };
}
function baseOptions(storage: StorageLike = memoryStorage()): DashboardOptions {
  return { storage, storageId: 'dashboard', storageHash: '', widgetDefinitions: defs, defaultWidgets: [{ name: 'one' }, { name: 'two' }] };
}

describe('useDashboard', () => {
  it('loads default widgets on empty storage', () => {
    const options = baseOptions();
    const { result } = renderHook(() => useDashboard(options));
    expect(result.current.widgets.map((widget) => widget.name)).toEqual(['one', 'two']);
    expect(options.unsavedChangeCount).toBe(0);
  });
  it('restores widgets from storage', () => {
    const storage = memoryStorage({ dashboard: JSON.stringify({ widgets: [{ name: 'one', title: 'Restored' }], hash: '' }) });
    const { result } = renderHook(() => useDashboard({ ...baseOptions(storage), defaultWidgets: [{ name: 'two' }] }));
    expect(result.current.widgets).toHaveLength(1); expect(result.current.widgets[0].title).toBe('Restored');
  });
  it('falls back to defaults for malformed storage', () => {
    const { result } = renderHook(() => useDashboard({ ...baseOptions(memoryStorage({ dashboard: '{malformed' })) }));
    expect(result.current.widgets.map((widget) => widget.name)).toEqual(['one', 'two']);
  });
  it('falls back to defaults for stale hashes and unknown widget names', () => {
    const stale = memoryStorage({ dashboard: JSON.stringify({ widgets: [{ name: 'one' }], hash: 'old' }) });
    const staleResult = renderHook(() => useDashboard({ ...baseOptions(stale), storageHash: 'new' }));
    expect(staleResult.result.current.widgets.map((widget) => widget.name)).toEqual(['one', 'two']);
    const unknown = memoryStorage({ dashboard: JSON.stringify({ widgets: [{ name: 'missing' }], hash: '' }) });
    const unknownResult = renderHook(() => useDashboard(baseOptions(unknown)));
    expect(unknownResult.result.current.widgets.map((widget) => widget.name)).toEqual(['one', 'two']);
  });
  it('keeps the auto-title counter advancing across clear and loadWidgets', () => {
    const options = { ...baseOptions(), defaultWidgets: [] };
    const { result } = renderHook(() => useDashboard(options));
    act(() => result.current.clear(true));
    const titles: string[] = [];
    act(() => { for (let index = 0; index < 5; index += 1) titles.push(result.current.addWidget('one', true).title); });
    expect(titles).toEqual(['Widget 1', 'Widget 2', 'Widget 3', 'Widget 4', 'Widget 5']);
    act(() => result.current.loadWidgets([{ name: 'one' }]));
    expect(result.current.widgets[0].title).toBe('Widget 6');
    expect(result.current.savedWidgetDefs?.[0].name).toBe('one');
  });
  it('counts explicit-save changes and only writes on forced save', () => {
    const storage = memoryStorage();
    const options = { ...baseOptions(storage), explicitSave: true };
    const { result } = renderHook(() => useDashboard(options));
    const before = storage.values.dashboard;
    act(() => { result.current.addWidget('three'); result.current.removeWidget(result.current.widgets[0]); });
    expect(options.unsavedChangeCount).toBe(2); expect(storage.values.dashboard).toBe(before);
    act(() => result.current.externalSaveDashboard());
    expect(options.unsavedChangeCount).toBe(0); expect(storage.values.dashboard).toBeDefined();
  });
  it('loads defaults through the rejection branch of promise storage', async () => {
    const options = { ...baseOptions({ getItem: () => Promise.reject('storage failed'), setItem: vi.fn(), removeItem: vi.fn() }), defaultWidgets: [{ name: 'three' }] };
    const { result } = renderHook(() => useDashboard(options));
    await waitFor(() => expect(result.current.widgets.map((widget) => widget.name)).toEqual(['three']));
  });
  it('loads restored state through the resolve branch of promise storage', async () => {
    const storage: StorageLike = { getItem: () => Promise.resolve(JSON.stringify({ widgets: [{ name: 'two', title: 'Async' }], hash: '' })), setItem: vi.fn(), removeItem: vi.fn() };
    const { result } = renderHook(() => useDashboard({ ...baseOptions(storage), defaultWidgets: [{ name: 'one' }] }));
    await waitFor(() => expect(result.current.widgets[0]?.title).toBe('Async'));
  });
  it('mutates caller options with defaults and API methods', () => {
    const options = baseOptions();
    const { result } = renderHook(() => useDashboard(options));
    expect(options.stringifyStorage).toBe(true); expect(options.hideWidgetSettings).toBe(false); expect(options.hideWidgetClose).toBe(false);
    expect(options.settingsModalOptions).toEqual({ templateUrl: 'components/directives/dashboard/widget-settings-template.html', controller: 'WidgetSettingsCtrl' });
    expect(options.addWidget).toBeTypeOf('function'); expect(options.saveDashboard).toBeTypeOf('function'); expect(options.currentWidgets).toBe(result.current.widgets);
    const callback = vi.fn(); options.onOpenWidgetSettings = callback;
    act(() => result.current.openWidgetSettings(result.current.widgets[0]));
    expect(callback).toHaveBeenCalledWith(result.current.widgets[0]);
  });
});
