import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardState } from '../DashboardState';
import { WidgetDefCollection } from '../WidgetDefCollection';
import type { StorageLike, SerializedWidget } from '../DashboardState';
import { isEmpty } from 'lodash-es';

describe('DashboardState', () => {
  let model: DashboardState;
  let storage: StorageLike;
  let widgetDefinitions: WidgetDefCollection;
  let obj: Record<string, unknown>;
  let storageData: Record<string, unknown>;

  beforeEach(() => {
    storageData = {};

    obj = {
      id1: JSON.stringify({
        widgets: [
          {
            title: 'Widget 1',
            name: 'random',
          },
        ],
      }),
      id2: {
        widgets: [
          {
            title: 'Widget 2',
            name: 'time',
          },
        ],
      },
      id3: JSON.stringify({
        widgets: [
          {
            title: 'Widget 3',
            name: 'time_xxxxx',
          },
        ],
      }),
      id4: 'BAD JSON STRING',
    };

    storage = {
      getItem: function (id: string) {
        return obj[id];
      },
      removeItem: function (id: string) {
        delete obj[id];
      },
      setItem: function (id: string, item: unknown) {
        storageData[id] = item;
      },
    };

    widgetDefinitions = new WidgetDefCollection([
      {
        name: 'random',
        directive: 'wt-scope-watch',
        attrs: {
          value: 'randomValue',
        },
      },
      {
        name: 'time',
        directive: 'wt-time',
      },
    ]);

    model = new DashboardState(storage, 'id1', undefined, widgetDefinitions, true);
  });

  it('should be a function', () => {
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
      const result = model.load() as SerializedWidget[];
      expect(result.length).toEqual(1);
      expect(result[0].title).toEqual('Widget 1');
      expect(result[0].name).toEqual('random');
    });

    it('should load a non-stringify widget', () => {
      model.stringify = false;
      model.id = 'id2';

      const result = model.load() as SerializedWidget[];
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

    it('should return null', () => {
      model.id = 'id4';
      const result = model.load();
      expect(result).toEqual(null);
    });

    it('should return null because of outdated hash', () => {
      model.hash = 'xxxxxx';
      const result = model.load();
      expect(result).toEqual(null);
    });

    it('should load empty array', () => {
      model.id = 'id3';
      const result = model.load() as SerializedWidget[];
      expect(result.length).toEqual(0);
    });

    it('should return null because of stale storage hash', () => {
      widgetDefinitions[0].storageHash = 'xxxxx';
      const result = model.load() as SerializedWidget[];
      expect(result.length).toEqual(0);
    });

    describe('the async functions', () => {
      beforeEach(() => {
        model.storage = {
          getItem: function (id: string) {
            return new Promise((resolve, reject) => {
              if (id === 'BAD_ID') {
                reject('bad id');
              } else {
                resolve(obj[id]);
              }
            });
          },
          removeItem: function () {},
          setItem: function () {},
        };
      });

      it('should resolve with one widget', async () => {
        const result = (await model.load()) as SerializedWidget[];
        expect(result[0].name).toEqual('random');
        expect(result[0].title).toEqual('Widget 1');
      });

      it('should reject with null', async () => {
        model.id = 'id4';
        try {
          await model.load();
          throw new Error('Expected error but received result');
        } catch (error) {
          expect(error).toEqual(null);
        }
      });

      it('should reject by storage.load', async () => {
        model.id = 'BAD_ID';
        try {
          await model.load();
          throw new Error('Expected error but received result');
        } catch (error) {
          expect(error).toEqual('bad id');
        }
      });
    });
  });

  describe('the save function', () => {
    let widgets: Array<{ name: string; title: string; serialize: () => SerializedWidget }>;

    beforeEach(() => {
      const func = function (this: { name: string; title: string }) {
        return {
          name: this.name,
          title: this.title,
        };
      };

      widgets = [
        {
          name: 'random',
          title: 'My new widget #1',
          serialize: func,
        },
        {
          name: 'time',
          title: 'My new widget #2',
          serialize: func,
        },
      ];

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

    it('should abort', () => {
      model.storage = undefined;
      expect(model.save(widgets)).toBe(true);
      expect(isEmpty(storageData)).toBe(true);
    });
  });
});
