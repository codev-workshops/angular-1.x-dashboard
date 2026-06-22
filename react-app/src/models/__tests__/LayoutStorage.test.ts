import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LayoutStorage } from '../LayoutStorage';
import type { LayoutStorageOptions, LayoutDefinition } from '../LayoutStorage';

describe('LayoutStorage', () => {
  describe('the constructor', () => {
    let storage: LayoutStorage;
    let options: LayoutStorageOptions;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'something' },
          { title: 'something' },
          { title: 'something' },
        ],
        widgetButtons: false,
        explicitSave: false,
        settingsModalOptions: {},
        onSettingsClose: function () {},
        onSettingsDismiss: function () {},
      };
      storage = new LayoutStorage(options);
    });

    it('should provide an empty implementation of storage if it is not provided', () => {
      delete options.storage;
      const stateless = new LayoutStorage(options);
      const noop = stateless.storage;
      ['setItem', 'getItem', 'removeItem'].forEach((method) => {
        const rec = noop as unknown as Record<string, (...args: unknown[]) => void>;
        expect(typeof rec[method]).toEqual('function');
        expect(() => rec[method]()).not.toThrow();
      });
    });

    it('should set a subset of the options directly on the LayoutStorage instance itself', () => {
      const properties: Record<string, string> = {
        id: 'storageId',
        storage: 'storage',
        storageHash: 'storageHash',
        stringifyStorage: 'stringifyStorage',
        widgetDefinitions: 'widgetDefinitions',
        defaultLayouts: 'defaultLayouts',
        widgetButtons: 'widgetButtons',
        explicitSave: 'explicitSave',
        settingsModalOptions: 'settingsModalOptions',
        onSettingsClose: 'onSettingsClose',
        onSettingsDismiss: 'onSettingsDismiss',
      };

      Object.entries(properties).forEach(([key, val]) => {
        expect((storage as unknown as Record<string, unknown>)[key]).toEqual(
          (options as unknown as Record<string, unknown>)[val]
        );
      });
    });

    it('should set stringify as true by default', () => {
      delete options.stringifyStorage;
      storage = new LayoutStorage(options);
      expect(storage.stringifyStorage).toEqual(true);
    });

    it('should allow stringify to be overridden by option', () => {
      options.stringifyStorage = false;
      storage = new LayoutStorage(options);
      expect(storage.stringifyStorage).toEqual(false);
    });

    it('should create a layouts array and states object', () => {
      expect(storage.layouts instanceof Array).toEqual(true);
      expect(typeof storage.states).toEqual('object');
    });

    it('should call load', () => {
      vi.spyOn(LayoutStorage.prototype, 'load').mockImplementation(() => {});
      storage = new LayoutStorage(options);
      expect(LayoutStorage.prototype.load).toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });

  describe('the load method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'something' },
          { title: 'something' },
          { title: 'something' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };
      storage = new LayoutStorage(options);
    });

    it('should use the default layouts if no stored info was found', () => {
      expect(storage.layouts.length).toEqual(options.defaultLayouts!.length);
    });

    it('should clone default layouts rather than use them directly', () => {
      expect(storage.layouts.indexOf(options.defaultLayouts![0])).toEqual(-1);
    });

    it('should use the result from getItem for layouts.', () => {
      vi.spyOn(options.storage!, 'getItem').mockReturnValue(
        JSON.stringify({
          storageHash: 'ds5f9d1f',
          layouts: [
            { id: 0, title: 'title', defaultWidgets: [], active: true },
            { id: 1, title: 'title2', defaultWidgets: [], active: false },
            { id: 2, title: 'title3', defaultWidgets: [], active: false },
            { id: 3, title: 'custom', defaultWidgets: [], active: false },
          ],
          states: {
            0: {},
            1: {},
            2: {},
          },
        })
      );
      storage.load();
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'title',
        'title2',
        'title3',
        'custom',
      ]);
    });

    it('should NOT use result from getItem for layouts if the storageHash doesnt match', () => {
      vi.spyOn(options.storage!, 'getItem').mockReturnValue(
        JSON.stringify({
          storageHash: 'alskdjf02iej',
          layouts: [
            { id: 0, title: 'title', defaultWidgets: [], active: true },
            { id: 1, title: 'title2', defaultWidgets: [], active: false },
            { id: 2, title: 'title3', defaultWidgets: [], active: false },
            { id: 3, title: 'custom', defaultWidgets: [], active: false },
          ],
          states: {
            0: {},
            1: {},
            2: {},
          },
        })
      );
      storage.load();
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'something',
        'something',
        'something',
      ]);
    });

    it('should set locked property to true', () => {
      options.lockDefaultLayouts = true;
      storage = new LayoutStorage(options);
      storage.load();
      expect(storage.layouts[0].locked).toBe(true);
    });

    it('should be able to handle async loading via promise', async () => {
      vi.spyOn(options.storage!, 'getItem').mockReturnValue(
        Promise.resolve(
          JSON.stringify({
            storageHash: 'ds5f9d1f',
            layouts: [
              { id: 0, title: 'title', defaultWidgets: [], active: true },
              { id: 1, title: 'title2', defaultWidgets: [], active: false },
              { id: 2, title: 'title3', defaultWidgets: [], active: false },
              { id: 3, title: 'custom', defaultWidgets: [], active: false },
            ],
            states: {
              0: {},
              1: {},
              2: {},
            },
          })
        )
      );
      storage.load();
      // Wait for promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'title',
        'title2',
        'title3',
        'custom',
      ]);
    });

    it('should load defaults if the deferred is rejected', async () => {
      vi.spyOn(options.storage!, 'getItem').mockReturnValue(
        Promise.reject()
      );
      storage.load();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'something',
        'something',
        'something',
      ]);
    });

    it('should load defaults if the json is malformed', async () => {
      const malformed = JSON.stringify({
        storageHash: 'ds5f9d1f',
        layouts: [
          { id: 0, title: 'title', defaultWidgets: [], active: true },
          { id: 1, title: 'title2', defaultWidgets: [], active: false },
          { id: 2, title: 'title3', defaultWidgets: [], active: false },
          { id: 3, title: 'custom', defaultWidgets: [], active: false },
        ],
        states: {
          0: {},
          1: {},
          2: {},
        },
      }).replace('{', '{{');

      vi.spyOn(options.storage!, 'getItem').mockReturnValue(
        Promise.resolve(malformed)
      );
      storage.load();
      expect(storage.layouts).toEqual([]);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'something',
        'something',
        'something',
      ]);
    });

    it('should not try to JSON.parse the result if stringifyStorage is false.', () => {
      options.stringifyStorage = false;
      storage = new LayoutStorage(options);
      vi.spyOn(options.storage!, 'getItem').mockReturnValue({
        storageHash: 'ds5f9d1f',
        layouts: [
          { id: 0, title: 'title', defaultWidgets: [], active: true },
          { id: 1, title: 'title2', defaultWidgets: [], active: false },
          { id: 2, title: 'title3', defaultWidgets: [], active: false },
          { id: 3, title: 'custom', defaultWidgets: [], active: false },
        ],
        states: {
          0: {},
          1: {},
          2: {},
        },
      });
      storage.load();
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'title',
        'title2',
        'title3',
        'custom',
      ]);
    });
  });

  describe('the add method', () => {
    let storage: LayoutStorage;
    let options: LayoutStorageOptions;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [],
        widgetButtons: false,
        explicitSave: false,
      };

      vi.spyOn(LayoutStorage.prototype, 'load').mockImplementation(() => {});
      storage = new LayoutStorage(options);
      vi.restoreAllMocks();
    });

    it('should add to storage.layouts', () => {
      const newLayout: LayoutDefinition = { title: 'my-layout' };
      storage.add(newLayout);
      expect(storage.layouts[0]).toEqual(newLayout);
    });

    it('should be able to take an array of new layouts', () => {
      const newLayouts: LayoutDefinition[] = [
        { title: 'my-layout' },
        { title: 'my-layout-2' },
      ];
      storage.add(newLayouts);
      expect(storage.layouts.length).toEqual(2);
      expect(storage.layouts.indexOf(newLayouts[0])).not.toEqual(-1);
      expect(storage.layouts.indexOf(newLayouts[1])).not.toEqual(-1);
    });

    it('should look for defaultWidgets on storage options if not supplied on layout definition', () => {
      options.defaultWidgets = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      vi.spyOn(LayoutStorage.prototype, 'load').mockImplementation(() => {});
      storage = new LayoutStorage(options);
      vi.restoreAllMocks();

      const newLayouts: LayoutDefinition[] = [
        { title: 'my-layout', defaultWidgets: [] },
        { title: 'my-layout-2' },
      ];
      storage.add(newLayouts);
      expect(newLayouts[0].dashboard!.defaultWidgets === newLayouts[0].defaultWidgets).toEqual(true);
      expect(newLayouts[1].dashboard!.defaultWidgets === options.defaultWidgets).toEqual(true);
    });

    it('should use defaultWidgets if supplied in the layout definition', () => {
      options.defaultWidgets = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      vi.spyOn(LayoutStorage.prototype, 'load').mockImplementation(() => {});
      storage = new LayoutStorage(options);
      vi.restoreAllMocks();

      const newLayouts: LayoutDefinition[] = [
        { title: 'my-layout', defaultWidgets: [] },
        { title: 'my-layout-2' },
      ];
      storage.add(newLayouts);
      expect(newLayouts[0].dashboard!.defaultWidgets).toEqual([]);
      expect(newLayouts[1].dashboard!.defaultWidgets).toEqual(options.defaultWidgets);
    });

    it('should look for widgetDefinitions on storage options if not supplied on layout definition', () => {
      options.widgetDefinitions = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      vi.spyOn(LayoutStorage.prototype, 'load').mockImplementation(() => {});
      storage = new LayoutStorage(options);
      vi.restoreAllMocks();

      const newLayouts: LayoutDefinition[] = [
        { title: 'my-layout', widgetDefinitions: [] },
        { title: 'my-layout-2' },
      ];
      storage.add(newLayouts);
      expect(newLayouts[0].dashboard!.widgetDefinitions === newLayouts[0].widgetDefinitions).toEqual(true);
      expect(newLayouts[1].dashboard!.widgetDefinitions === options.widgetDefinitions).toEqual(true);
    });

    it('should use widgetDefinitions if supplied in the layout definition', () => {
      options.widgetDefinitions = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      vi.spyOn(LayoutStorage.prototype, 'load').mockImplementation(() => {});
      storage = new LayoutStorage(options);
      vi.restoreAllMocks();

      const newLayouts: LayoutDefinition[] = [
        { title: 'my-layout', widgetDefinitions: [] },
        { title: 'my-layout-2' },
      ];
      storage.add(newLayouts);
      expect(newLayouts[0].dashboard!.widgetDefinitions).toEqual([]);
      expect(newLayouts[1].dashboard!.widgetDefinitions).toEqual(options.widgetDefinitions);
    });
  });

  describe('the remove method', () => {
    let storage: LayoutStorage;
    let options: LayoutStorageOptions;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        defaultLayouts: [
          { title: '1' },
          { title: '2', active: true },
          { title: '3' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };

      storage = new LayoutStorage(options);
    });

    it('should remove the supplied layout', () => {
      const layout = storage.layouts[1];
      storage.remove(layout);
      expect(storage.layouts.indexOf(layout)).toEqual(-1);
    });

    it('should delete the state', () => {
      const layout = storage.layouts[1];
      storage.setItem(layout.id as string, {});
      storage.remove(layout);
      expect(storage.states[layout.id as string]).toBeUndefined();
    });

    it('should do nothing if layout is not in layouts', () => {
      const layout = {} as LayoutDefinition;
      const before = storage.layouts.length;
      storage.remove(layout);
      const after = storage.layouts.length;
      expect(before).toEqual(after);
    });

    it('should set another dashboard to active if the layout removed was active', () => {
      const layout = storage.layouts[1];
      storage.remove(layout);
      expect(storage.layouts[0].active || storage.layouts[1].active).toEqual(true);
    });

    it('should set the layout at index 0 to active if the removed layout was 0', () => {
      storage.layouts[1].active = false;
      storage.layouts[0].active = true;
      storage.remove(storage.layouts[0]);
      expect(storage.layouts[0].active).toEqual(true);
    });

    it('should not change the active layout if it was not the one that got removed', () => {
      const active = storage.layouts[1];
      const layout = storage.layouts[0];
      storage.remove(layout);
      expect(active.active).toEqual(true);
    });
  });

  describe('the save method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'something' },
          { title: 'something' },
          { title: 'something' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };
      storage = new LayoutStorage(options);
    });

    it('should call options.storage.setItem with a stringified object', () => {
      vi.spyOn(options.storage!, 'setItem');
      storage.save();
      expect(options.storage!.setItem).toHaveBeenCalled();
      const calls = vi.mocked(options.storage!.setItem).mock.calls;
      expect(calls[0][0]).toEqual(storage.id);
      expect(typeof calls[0][1]).toEqual('string');
      expect(() => {
        JSON.parse(calls[0][1] as string);
      }).not.toThrow();
    });

    it('should save an object that has layouts, states, and storageHash', () => {
      vi.spyOn(options.storage!, 'setItem');
      storage.save();
      const calls = vi.mocked(options.storage!.setItem).mock.calls;
      const obj = JSON.parse(calls[0][1] as string);
      expect(Object.prototype.hasOwnProperty.call(obj, 'layouts')).toEqual(true);
      expect(obj.layouts instanceof Array).toEqual(true);
      expect(Object.prototype.hasOwnProperty.call(obj, 'states')).toEqual(true);
      expect(typeof obj.states).toEqual('object');
      expect(Object.prototype.hasOwnProperty.call(obj, 'storageHash')).toEqual(true);
      expect(typeof obj.storageHash).toEqual('string');
    });

    it('should call options.storage.setItem with an object when stringifyStorage is false', () => {
      options.stringifyStorage = false;
      storage = new LayoutStorage(options);
      vi.spyOn(options.storage!, 'setItem');
      storage.save();
      expect(options.storage!.setItem).toHaveBeenCalled();
      const calls = vi.mocked(options.storage!.setItem).mock.calls;
      expect(calls[0][0]).toEqual(storage.id);
      expect(typeof calls[0][1]).toEqual('object');
    });
  });

  describe('the setItem method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'something' },
          { title: 'something' },
          { title: 'something' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };
      storage = new LayoutStorage(options);
    });

    it('should set storage.states[id] to the second argument', () => {
      const state = { some: 'thing' };
      storage.setItem('id', state);
      expect(storage.states.id).toEqual(state);
    });

    it('should call save', () => {
      vi.spyOn(storage, 'save');
      const state = { some: 'thing' };
      storage.setItem('id', state);
      expect(storage.save).toHaveBeenCalled();
    });
  });

  describe('the getItem method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'something' },
          { title: 'something' },
          { title: 'something' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };
      storage = new LayoutStorage(options);
    });

    it('should return states[id]', () => {
      storage.states['myId'] = {};
      const result = storage.getItem('myId');
      expect(result === storage.states['myId']).toEqual(true);
    });
  });

  describe('the getActiveLayout method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'i am active', active: true },
          { title: 'i am not' },
          { title: 'me neither' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };
      storage = new LayoutStorage(options);
    });

    it('should return the layout with active:true', () => {
      const layout = storage.getActiveLayout();
      expect(layout && layout.title).toEqual('i am active');
    });

    it('should return false if no layout is active', () => {
      const layout = storage.getActiveLayout();
      if (layout) layout.active = false;
      const result = storage.getActiveLayout();
      expect(result).toEqual(false);
    });
  });

  describe('the removeItem', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function () {},
          getItem: function () {},
          removeItem: function () {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [
          { title: 'i am active', active: true },
          { title: 'i am not' },
          { title: 'me neither' },
        ],
        widgetButtons: false,
        explicitSave: false,
      };
      storage = new LayoutStorage(options);
    });

    it('should remove states[id]', () => {
      const state = {};
      storage.setItem('1', state);
      storage.removeItem('1');
      expect(storage.states['1']).toBeUndefined();
    });

    it('should call save', () => {
      vi.spyOn(storage, 'save');
      const state = {};
      storage.setItem('1', state);
      storage.removeItem('1');
      expect(storage.save).toHaveBeenCalled();
    });
  });
});
