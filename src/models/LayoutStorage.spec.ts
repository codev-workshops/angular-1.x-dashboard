import { LayoutStorage, LayoutStorageOptions } from './LayoutStorage';

describe('LayoutStorage', () => {
  describe('the constructor', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: () => {},
          getItem: () => null,
          removeItem: () => {},
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
        onSettingsClose: () => {},
        onSettingsDismiss: () => {},
      };
      storage = new LayoutStorage(options);
    });

    it('should provide an empty implementation of storage if it is not provided', () => {
      delete options.storage;
      const stateless = new LayoutStorage(options);
      const noop = stateless.storage;
      ['setItem', 'getItem', 'removeItem'].forEach((method) => {
        expect(typeof (noop as any)[method]).toEqual('function');
        expect(() => (noop as any)[method]()).not.toThrow();
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
        expect((storage as any)[key]).toEqual((options as any)[val]);
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
      jest.spyOn(LayoutStorage.prototype, 'load');
      storage = new LayoutStorage(options);
      expect(LayoutStorage.prototype.load).toHaveBeenCalled();
      jest.restoreAllMocks();
    });
  });

  describe('the load method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: () => {},
          getItem: () => null,
          removeItem: () => {},
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
      expect(
        storage.layouts.findIndex((l) => l === (options.defaultLayouts![0] as any))
      ).toEqual(-1);
    });

    it('should use the result from getItem for layouts.', () => {
      jest.spyOn(options.storage!, 'getItem').mockReturnValue(
        JSON.stringify({
          storageHash: 'ds5f9d1f',
          layouts: [
            { id: 0, title: 'title', defaultWidgets: [], active: true },
            { id: 1, title: 'title2', defaultWidgets: [], active: false },
            { id: 2, title: 'title3', defaultWidgets: [], active: false },
            { id: 3, title: 'custom', defaultWidgets: [], active: false },
          ],
          states: { 0: {}, 1: {}, 2: {} },
        })
      );
      storage.load();
      expect(storage.layouts.map((l) => l.title)).toEqual([
        'title',
        'title2',
        'title3',
        'custom',
      ]);
      jest.restoreAllMocks();
    });

    it('should use default layouts for mismatched storageHash', () => {
      jest.spyOn(options.storage!, 'getItem').mockReturnValue(
        JSON.stringify({
          storageHash: 'wrong-hash',
          layouts: [{ id: 0, title: 'stale', defaultWidgets: [], active: true }],
          states: {},
        })
      );
      storage.load();
      expect(storage.layouts.length).toEqual(options.defaultLayouts!.length);
      jest.restoreAllMocks();
    });

    it('should use default layouts for invalid JSON', () => {
      jest.spyOn(options.storage!, 'getItem').mockReturnValue('BAD JSON');
      storage.load();
      expect(storage.layouts.length).toEqual(options.defaultLayouts!.length);
      jest.restoreAllMocks();
    });
  });

  describe('the add method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: () => {},
          getItem: () => null,
          removeItem: () => {},
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [],
        defaultLayouts: [],
      };
      storage = new LayoutStorage(options);
    });

    it('should add a layout', () => {
      storage.add({ title: 'test layout' });
      expect(storage.layouts.length).toEqual(1);
      expect(storage.layouts[0].title).toEqual('test layout');
    });

    it('should add multiple layouts from an array', () => {
      storage.add([{ title: 'first' }, { title: 'second' }]);
      expect(storage.layouts.length).toEqual(2);
    });

    it('should set dashboard properties on added layouts', () => {
      storage.add({ title: 'test' });
      const layout = storage.layouts[0];
      expect(layout.dashboard.storage).toBe(storage);
      expect(layout.dashboard.stringifyStorage).toBe(false);
    });
  });

  describe('the remove method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: () => {},
          getItem: () => null,
          removeItem: () => {},
        },
        defaultLayouts: [
          { title: 'first' },
          { title: 'second' },
          { title: 'third' },
        ],
      };
      storage = new LayoutStorage(options);
    });

    it('should remove a layout', () => {
      const toRemove = storage.layouts[1];
      storage.remove(toRemove);
      expect(storage.layouts.length).toEqual(2);
    });

    it('should activate another layout when removing the active one', () => {
      storage.layouts[1].active = true;
      storage.layouts[0].active = false;
      const toRemove = storage.layouts[1];
      storage.remove(toRemove);
      expect(storage.layouts[0].active).toBe(true);
    });
  });

  describe('the save method', () => {
    let savedData: Record<string, any>;
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      savedData = {};
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: (key: string, value: any) => {
            savedData[key] = value;
          },
          getItem: () => null,
          removeItem: () => {},
        },
        storageHash: 'abc123',
        stringifyStorage: true,
        defaultLayouts: [{ title: 'layout1' }],
      };
      storage = new LayoutStorage(options);
    });

    it('should save serialized layouts to storage', () => {
      storage.save();
      expect(savedData['testingStorage']).toBeDefined();
      const parsed = JSON.parse(savedData['testingStorage']);
      expect(parsed.storageHash).toEqual('abc123');
      expect(parsed.layouts.length).toEqual(1);
    });

    it('should reset unsavedChangeCount to 0', () => {
      storage.options.unsavedChangeCount = 5;
      storage.save();
      expect(storage.options.unsavedChangeCount).toEqual(0);
    });
  });

  describe('the getActiveLayout method', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: () => {},
          getItem: () => null,
          removeItem: () => {},
        },
        defaultLayouts: [{ title: 'first' }, { title: 'second' }],
      };
      storage = new LayoutStorage(options);
    });

    it('should return the active layout', () => {
      const active = storage.getActiveLayout();
      expect(active).not.toBe(false);
      if (active) {
        expect(active.active).toBe(true);
      }
    });

    it('should return false if no layout is active', () => {
      storage.layouts.forEach((l) => (l.active = false));
      expect(storage.getActiveLayout()).toBe(false);
    });
  });

  describe('the setItem/getItem/removeItem methods', () => {
    let options: LayoutStorageOptions;
    let storage: LayoutStorage;

    beforeEach(() => {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: () => {},
          getItem: () => null,
          removeItem: () => {},
        },
        defaultLayouts: [],
      };
      storage = new LayoutStorage(options);
    });

    it('should set and get items from states', () => {
      jest.spyOn(storage, 'save').mockImplementation(() => {});
      storage.setItem('key1', { data: 'test' });
      expect(storage.getItem('key1')).toEqual({ data: 'test' });
      jest.restoreAllMocks();
    });

    it('should remove items from states', () => {
      jest.spyOn(storage, 'save').mockImplementation(() => {});
      storage.setItem('key1', { data: 'test' });
      storage.removeItem('key1');
      expect(storage.getItem('key1')).toBeUndefined();
      jest.restoreAllMocks();
    });
  });
});
