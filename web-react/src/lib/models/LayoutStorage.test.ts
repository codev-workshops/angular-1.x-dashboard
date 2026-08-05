import { describe, expect, it, vi } from 'vitest';
import { LayoutStorage } from './LayoutStorage';
import type { LayoutDefinition, LayoutStorageOptions } from './types';

function makeStorage(initial: Record<string, unknown> = {}) {
  return {
    values: initial,
    setItem: vi.fn((key: string, value: unknown) => { initial[key] = value; }),
    getItem: vi.fn((key: string) => initial[key]),
    removeItem: vi.fn((key: string) => { delete initial[key]; }),
  };
}
type TestOptions = LayoutStorageOptions & { storage: ReturnType<typeof makeStorage>; storageId: string; defaultLayouts: LayoutDefinition[] };
function makeOptions(overrides: Partial<LayoutStorageOptions> = {}): TestOptions {
  return {
    storageId: 'testingStorage', storage: makeStorage(), storageHash: 'ds5f9d1f', stringifyStorage: true,
    widgetDefinitions: [], defaultLayouts: [{ title: 'something' }, { title: 'something' }, { title: 'something' }],
    widgetButtons: false, explicitSave: false, ...overrides,
  } as TestOptions;
}
function serialized(hash = 'ds5f9d1f') {
  return JSON.stringify({ storageHash: hash, layouts: [
    { id: 0, title: 'title', defaultWidgets: [], active: true },
    { id: 1, title: 'title2', defaultWidgets: [], active: false },
    { id: 2, title: 'title3', defaultWidgets: [], active: false },
    { id: 3, title: 'custom', defaultWidgets: [], active: false },
  ], states: { 0: {}, 1: {}, 2: {} } });
}

describe('Factory: LayoutStorage', () => {
  describe('the constructor', () => {
    it('should provide an empty implementation of storage if it is not provided', () => {
      const opts = makeOptions();
      const noop = new LayoutStorage({ ...opts, storage: undefined }).storage;
      (['setItem', 'getItem', 'removeItem'] as const).forEach((method) => {
        expect(typeof noop[method]).toBe('function');
        expect(() => noop[method]('x', {})).not.toThrow();
      });
    });
    it('should set a subset of the options directly on the LayoutStorage instance itself', () => {
      const opts = makeOptions({ settingsModalOptions: {}, onSettingsClose: () => undefined, onSettingsDismiss: () => undefined });
      const model = new LayoutStorage(opts);
      expect(model.id).toBe(opts.storageId); expect(model.storage).toBe(opts.storage); expect(model.storageHash).toBe(opts.storageHash);
      expect(model.stringifyStorage).toBe(opts.stringifyStorage); expect(model.widgetDefinitions).toBe(opts.widgetDefinitions);
      expect(model.defaultLayouts).toBe(opts.defaultLayouts); expect(model.widgetButtons).toBe(opts.widgetButtons);
      expect(model.explicitSave).toBe(opts.explicitSave); expect(model.settingsModalOptions).toBe(opts.settingsModalOptions);
      expect(model.onSettingsClose).toBe(opts.onSettingsClose); expect(model.onSettingsDismiss).toBe(opts.onSettingsDismiss);
    });
    it('should set stringify as true by default', () => { const opts = makeOptions(); opts.stringifyStorage = undefined; expect(new LayoutStorage(opts).stringifyStorage).toBe(true); });
    it('should allow stringify to be overridden by option', () => expect(new LayoutStorage(makeOptions({ stringifyStorage: false })).stringifyStorage).toBe(false));
    it('should create a layouts array and states object', () => { const model = new LayoutStorage(makeOptions()); expect(Array.isArray(model.layouts)).toBe(true); expect(typeof model.states).toBe('object'); });
    it('should call load', () => { const spy = vi.spyOn(LayoutStorage.prototype, 'load'); new LayoutStorage(makeOptions()); expect(spy).toHaveBeenCalled(); spy.mockRestore(); });
  });
  describe('the load method', () => {
    it('should use the default layouts if no stored info was found', () => { const opts = makeOptions(); expect(new LayoutStorage(opts).layouts.length).toBe(opts.defaultLayouts.length); });
    it('should clone default layouts rather than use them directly', () => { const opts = makeOptions(); const model = new LayoutStorage(opts); expect(model.layouts.indexOf(opts.defaultLayouts[0])).toBe(-1); });
    it('should use the result from getItem for layouts.', () => { const opts = makeOptions(); opts.storage.getItem.mockReturnValue(serialized()); const model = new LayoutStorage(opts); model.load(); expect(model.layouts.map((l) => l.title)).toEqual(['title', 'title2', 'title3', 'custom']); });
    it('should NOT use result from getItem for layouts if the storageHash doesnt match', () => { const opts = makeOptions(); opts.storage.getItem.mockReturnValue(serialized('bad')); const model = new LayoutStorage(opts); model.load(); expect(model.layouts.map((l) => l.title)).toEqual(['something', 'something', 'something']); });
    it('should set locked property to true', () => { const model = new LayoutStorage(makeOptions({ lockDefaultLayouts: true })); expect(model.layouts[0].locked).toBe(true); });
    it('should be able to handle async loading via promise', async () => { const opts = makeOptions(); let resolve!: (value: unknown) => void; opts.storage.getItem.mockReturnValue(new Promise((r) => { resolve = r; })); const model = new LayoutStorage(opts); expect(model.layouts).toEqual([]); resolve(serialized()); await Promise.resolve(); expect(model.layouts.map((l) => l.title)).toEqual(['title', 'title2', 'title3', 'custom']); });
    it('should load defaults if the deferred is rejected', async () => { const opts = makeOptions(); opts.storage.getItem.mockReturnValue(Promise.reject('bad')); const model = new LayoutStorage(opts); await Promise.resolve(); expect(model.layouts.map((l) => l.title)).toEqual(['something', 'something', 'something']); });
    it('should load defaults if the json is malformed', async () => { const opts = makeOptions(); opts.storage.getItem.mockReturnValue(Promise.resolve('{{bad')); const model = new LayoutStorage(opts); await Promise.resolve(); expect(model.layouts.map((l) => l.title)).toEqual(['something', 'something', 'something']); });
    it('should not try to JSON.parse the result if stringifyStorage is false.', () => { const opts = makeOptions({ stringifyStorage: false }); opts.storage.getItem.mockReturnValue({ storageHash: 'ds5f9d1f', layouts: [{ title: 'title' }], states: {} }); const model = new LayoutStorage(opts); model.load(); expect(model.layouts.map((l) => l.title)).toEqual(['title']); });
  });
  describe('the add method', () => {
    it('should add to storage.layouts', () => { const model = new LayoutStorage(makeOptions({ defaultLayouts: [] })); const layout = { title: 'my-layout' }; model.add(layout); expect(model.layouts[0]).toBe(layout); });
    it('should be able to take an array of new layouts', () => { const model = new LayoutStorage(makeOptions({ defaultLayouts: [] })); const layouts = [{ title: 'my-layout' }, { title: 'my-layout-2' }]; model.add(layouts); expect(model.layouts.length).toBe(2); expect(model.layouts.indexOf(layouts[0])).not.toBe(-1); expect(model.layouts.indexOf(layouts[1])).not.toBe(-1); });
    it('should look for defaultWidgets on storage options if not supplied on layout definition', () => { const opts = makeOptions({ defaultLayouts: [], defaultWidgets: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] }); const model = new LayoutStorage(opts); const layouts: LayoutDefinition[] = [{ title: 'my-layout', defaultWidgets: [] }, { title: 'my-layout-2' }]; model.add(layouts); expect(layouts[0].dashboard?.defaultWidgets).toBe(layouts[0].defaultWidgets); expect(layouts[1].dashboard?.defaultWidgets).toBe(opts.defaultWidgets); });
    it('should use defaultWidgets if supplied in the layout definition', () => { const opts = makeOptions({ defaultLayouts: [], defaultWidgets: [{ name: 'a' }] }); const model = new LayoutStorage(opts); const layouts: LayoutDefinition[] = [{ title: 'my-layout', defaultWidgets: [] }, { title: 'my-layout-2' }]; model.add(layouts); expect(layouts[0].dashboard?.defaultWidgets).toEqual([]); expect(layouts[1].dashboard?.defaultWidgets).toBe(opts.defaultWidgets); });
    it('should look for widgetDefinitions on storage options if not supplied on layout definition', () => { const opts = makeOptions({ defaultLayouts: [], widgetDefinitions: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] }); const model = new LayoutStorage(opts); const layouts: LayoutDefinition[] = [{ title: 'my-layout', widgetDefinitions: [] }, { title: 'my-layout-2' }]; model.add(layouts); expect(layouts[0].dashboard?.widgetDefinitions).toBe(layouts[0].widgetDefinitions); expect(layouts[1].dashboard?.widgetDefinitions).toBe(opts.widgetDefinitions); });
    it('should use widgetDefinitions if supplied in the layout definition', () => { const opts = makeOptions({ defaultLayouts: [], widgetDefinitions: [{ name: 'a' }] }); const model = new LayoutStorage(opts); const layouts: LayoutDefinition[] = [{ title: 'my-layout', widgetDefinitions: [] }, { title: 'my-layout-2' }]; model.add(layouts); expect(layouts[0].dashboard?.widgetDefinitions).toEqual([]); expect(layouts[1].dashboard?.widgetDefinitions).toBe(opts.widgetDefinitions); });
  });
  describe('the remove method', () => {
    const create = () => new LayoutStorage(makeOptions({ defaultLayouts: [{ title: '1' }, { title: '2', active: true }, { title: '3' }] }));
    it('should remove the supplied layout', () => { const model = create(); const layout = model.layouts[1]; model.remove(layout); expect(model.layouts.indexOf(layout)).toBe(-1); });
    it('should delete the state', () => { const model = create(); const layout = model.layouts[1]; model.setItem(String(layout.id), {}); model.remove(layout); expect(model.states[String(layout.id)]).toBeUndefined(); });
    it('should do nothing if layout is not in layouts', () => { const model = create(); const before = model.layouts.length; model.remove({}); expect(model.layouts.length).toBe(before); });
    it('should set another dashboard to active if the layout removed was active', () => { const model = create(); model.remove(model.layouts[1]); expect(model.layouts[0].active || model.layouts[1].active).toBe(true); });
    it('should set the layout at index 0 to active if the removed layout was 0', () => { const model = create(); model.layouts[1].active = false; model.layouts[0].active = true; model.remove(model.layouts[0]); expect(model.layouts[0].active).toBe(true); });
    it('should not change the active layout if it was not the one that got removed', () => { const model = create(); const active = model.layouts[1]; model.remove(model.layouts[0]); expect(active.active).toBe(true); });
  });
  describe('the save method', () => {
    it('should call options.storage.setItem with a stringified object', () => { const opts = makeOptions(); const model = new LayoutStorage(opts); model.save(); expect(opts.storage.setItem).toHaveBeenCalled(); expect(opts.storage.setItem.mock.calls[0][0]).toBe(model.id); expect(typeof opts.storage.setItem.mock.calls[0][1]).toBe('string'); expect(() => JSON.parse(opts.storage.setItem.mock.calls[0][1] as string)).not.toThrow(); });
    it('should save an object that has layouts, states, and storageHash', () => { const opts = makeOptions(); const model = new LayoutStorage(opts); model.save(); const value = JSON.parse(opts.storage.setItem.mock.calls[0][1] as string); expect(Object.hasOwn(value, 'layouts')).toBe(true); expect(Array.isArray(value.layouts)).toBe(true); expect(Object.hasOwn(value, 'states')).toBe(true); expect(typeof value.states).toBe('object'); expect(Object.hasOwn(value, 'storageHash')).toBe(true); expect(typeof value.storageHash).toBe('string'); });
    it('should call options.storage.setItem with an object when stringifyStorage is false', () => { const opts = makeOptions({ stringifyStorage: false }); const model = new LayoutStorage(opts); model.save(); expect(opts.storage.setItem).toHaveBeenCalled(); expect(opts.storage.setItem.mock.calls[0][0]).toBe(model.id); expect(typeof opts.storage.setItem.mock.calls[0][1]).toBe('object'); });
  });
  describe('the setItem method', () => {
    it('should set storage.states[id] to the second argument', () => { const model = new LayoutStorage(makeOptions()); const value = { some: 'thing' }; model.setItem('id', value); expect(model.states.id).toBe(value); });
    it('should call save', () => { const model = new LayoutStorage(makeOptions()); const spy = vi.spyOn(model, 'save'); model.setItem('id', {}); expect(spy).toHaveBeenCalled(); });
  });
  describe('the getItem method', () => { it('should return states[id]', () => { const model = new LayoutStorage(makeOptions()); model.states.myId = {}; expect(model.getItem('myId')).toBe(model.states.myId); }); });
  describe('the getActiveLayout method', () => {
    it('should return the layout with active:true', () => { const model = new LayoutStorage(makeOptions({ defaultLayouts: [{ title: 'i am active', active: true }, { title: 'i am not' }, { title: 'me neither' }] })); const active = model.getActiveLayout(); expect(active && active.title).toBe('i am active'); });
    it('should return false if no layout is active', () => { const model = new LayoutStorage(makeOptions({ defaultLayouts: [{ title: 'i am active', active: true }, { title: 'i am not' }, { title: 'me neither' }] })); const active = model.getActiveLayout(); if (active) active.active = false; expect(model.getActiveLayout()).toBe(false); });
  });
  describe('the removeItem', () => {
    it('should remove states[id]', () => { const model = new LayoutStorage(makeOptions()); model.setItem('1', {}); model.removeItem('1'); expect(model.states['1']).toBeUndefined(); });
    it('should call save', () => { const model = new LayoutStorage(makeOptions()); model.setItem('1', {}); const spy = vi.spyOn(model, 'save'); model.removeItem('1'); expect(spy).toHaveBeenCalled(); });
  });
});
