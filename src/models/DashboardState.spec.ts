import { DashboardState } from './DashboardState';
import { WidgetDefCollection } from './WidgetDefCollection';

describe('DashboardState', () => {
  let model: DashboardState;
  let storage: {
    getItem: (id: string) => any;
    removeItem: (id: string) => void;
    setItem: (id: string, item: any) => void;
  };
  let widgetDefinitions: WidgetDefCollection;
  let obj: Record<string, any>;
  let storageData: Record<string, any>;

  beforeEach(() => {
    storageData = {};

    obj = {
      id1: JSON.stringify({
        widgets: [{ title: 'Widget 1', name: 'random' }],
      }),
      id2: {
        widgets: [{ title: 'Widget 2', name: 'time' }],
      },
      id3: JSON.stringify({
        widgets: [{ title: 'Widget 3', name: 'time_xxxxx' }],
      }),
      id4: 'BAD JSON STRING',
    };

    storage = {
      getItem: (id: string) => obj[id],
      removeItem: (id: string) => {
        delete obj[id];
      },
      setItem: (id: string, item: any) => {
        storageData[id] = item;
      },
    };

    widgetDefinitions = new WidgetDefCollection([
      {
        name: 'random',
        directive: 'wt-scope-watch',
        attrs: { value: 'randomValue' },
      },
      {
        name: 'time',
        directive: 'wt-time',
      },
    ]);

    model = new DashboardState(storage, 'id1', undefined, widgetDefinitions, true);
  });

  it('should be a function (class)', () => {
    expect(typeof DashboardState).toEqual('function');
  });

  describe('the constructor', () => {
    it('should create a dashboard state object', () => {
      expect(typeof model).toEqual('object');
      expect(typeof model.storage).toEqual('object');
      expect(typeof model.widgetDefinitions).toEqual('object');
      expect(model.id).toEqual('id1');
      expect(model.hash).toBeUndefined();
      expect(model.stringify).toBe(true);
    });
  });

  describe('the load function', () => {
    it('should load widget', () => {
      const result = model.load() as Record<string, any>[];
      expect(result.length).toEqual(1);
      expect(result[0].title).toEqual('Widget 1');
      expect(result[0].name).toEqual('random');
    });

    it('should load a non-stringify widget', () => {
      model.stringify = false;
      model.id = 'id2';

      const result = model.load() as Record<string, any>[];
      expect(result.length).toEqual(1);
      expect(result[0].title).toEqual('Widget 2');
      expect(result[0].name).toEqual('time');
    });

    it('should abort when storage is undefined', () => {
      model.storage = undefined;
      const result = model.load();
      expect(result).toEqual(null);
    });

    it('should abort when serialized is undefined', () => {
      expect(model._handleSyncLoad()).toEqual(null);
    });

    it('should not load anything', () => {
      model.id = 'xxx';
      const result = model.load();
      expect(result).toEqual(null);
    });

    it('should return null for bad JSON', () => {
      model.id = 'id4';
      const result = model.load();
      expect(result).toEqual(null);
    });

    it('should return null because of outdated hash', () => {
      model.hash = 'xxxxxx';
      const result = model.load();
      expect(result).toEqual(null);
    });

    it('should load empty array when widget not in definitions', () => {
      model.id = 'id3';
      const result = model.load() as Record<string, any>[];
      expect(result.length).toEqual(0);
    });

    it('should return empty array because of stale storage hash', () => {
      const defs = widgetDefinitions.getAll();
      defs[0].storageHash = 'xxxxx';
      const result = model.load() as Record<string, any>[];
      expect(result.length).toEqual(0);
    });

    describe('async loading', () => {
      beforeEach(() => {
        model.storage = {
          getItem: (id: string) => {
            if (id === 'BAD_ID') {
              return Promise.reject('bad id');
            }
            return Promise.resolve(obj[id]);
          },
          setItem: () => {},
          removeItem: () => {},
        };
      });

      it('should resolve with one widget', async () => {
        const result = model.load() as Promise<Record<string, any>[]>;
        await expect(result).resolves.toEqual([
          { title: 'Widget 1', name: 'random' },
        ]);
      });

      it('should reject with null for bad JSON', async () => {
        model.id = 'id4';
        const result = model.load() as Promise<Record<string, any>[]>;
        await expect(result).rejects.toEqual(null);
      });

      it('should reject by storage.load', async () => {
        model.id = 'BAD_ID';
        const result = model.load() as Promise<Record<string, any>[]>;
        await expect(result).rejects.toEqual('bad id');
      });
    });
  });

  describe('the save function', () => {
    const serializeFn = function (this: any) {
      return { name: this.name, title: this.title };
    };

    const widgets = [
      { name: 'random', title: 'My new widget #1', serialize: serializeFn },
      { name: 'time', title: 'My new widget #2', serialize: serializeFn },
    ];

    beforeEach(() => {
      storageData = {};
    });

    it('should add widgets to storageData', () => {
      expect(model.save(widgets)).toBe(true);
      expect(storageData.id1).toBeDefined();
    });

    it('should add non-stringify widgets', () => {
      model.stringify = false;
      expect(model.save(widgets)).toBe(true);
      expect(storageData.id1).toBeDefined();
    });

    it('should abort when storage is undefined', () => {
      model.storage = undefined;
      expect(model.save(widgets)).toBe(true);
      expect(Object.keys(storageData).length).toBe(0);
    });
  });
});
