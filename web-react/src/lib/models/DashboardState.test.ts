import { describe, expect, it, vi } from 'vitest';
import { DashboardState } from './DashboardState';
import { WidgetDefCollection } from './WidgetDefCollection';
import { logger } from '../logger';

const definitions = new WidgetDefCollection([
  { name: 'random', directive: 'wt-scope-watch', attrs: { value: 'randomValue' } },
  { name: 'time', directive: 'wt-time' },
]);
function makeStorage(values: Record<string, unknown> = {}) {
  return {
    values,
    getItem: (id: string) => values[id],
    removeItem: vi.fn((id: string) => { delete values[id]; }),
    setItem: vi.fn((id: string, value: unknown) => { values[id] = value; }),
  };
}

describe('Factory: DashboardState', () => {
  it('should be a function', () => expect(typeof DashboardState).toBe('function'));
  describe('the constructor', () => {
    it('should create a dashboard state object', () => {
      const model = new DashboardState(makeStorage(), 'id1', undefined, definitions, true);
      expect(typeof model).toBe('object');
      expect(typeof model.storage).toBe('object');
      expect(typeof model.widgetDefinitions).toBe('object');
      expect(model.id).toBe('id1');
      expect(model.hash).toBeUndefined();
      expect(model.stringify).toBe(true);
    });
  });
  describe('the load function', () => {
    const obj: Record<string, unknown> = {
      id1: JSON.stringify({ widgets: [{ title: 'Widget 1', name: 'random' }], hash: undefined }),
      id2: { widgets: [{ title: 'Widget 2', name: 'time' }], hash: undefined },
      id3: JSON.stringify({ widgets: [{ title: 'Widget 3', name: 'time_xxxxx' }], hash: undefined }),
      id4: 'BAD JSON STRING',
    };
    it('should load widget', () => {
      const result = new DashboardState(makeStorage(obj), 'id1', undefined, definitions, true).load() as Array<Record<string, unknown>>;
      expect(result.length).toBe(1); expect(result[0].title).toBe('Widget 1'); expect(result[0].name).toBe('random');
    });
    it('should load a non-stringify widget', () => {
      const result = new DashboardState(makeStorage(obj), 'id2', undefined, definitions, false).load() as Array<Record<string, unknown>>;
      expect(result.length).toBe(1); expect(result[0].title).toBe('Widget 2'); expect(result[0].name).toBe('time');
    });
    it('should abort when storage is undefined', () => {
      const model = new DashboardState(makeStorage(), 'id1', undefined, definitions, true); model.storage = undefined; expect(model.load()).toBeNull();
    });
    it('should abort when serialized is undefined', () => expect(new DashboardState(makeStorage(), 'id1', undefined, definitions, true)._handleSyncLoad(undefined)).toBeNull());
    it('should not load anything', () => expect(new DashboardState(makeStorage(obj), 'xxx', undefined, definitions, true).load()).toBeNull());
    it('should return null', () => expect(new DashboardState(makeStorage(obj), 'id4', undefined, definitions, true).load()).toBeNull());
    it('should return null because of outdated hash', () => expect(new DashboardState(makeStorage(obj), 'id1', 'xxxxxx', definitions, true).load()).toBeNull());
    it('should load empty array', () => expect((new DashboardState(makeStorage(obj), 'id3', undefined, definitions, true).load() as unknown[]).length).toBe(0));
    it('should return null because of stale storage hash', () => {
      const stale = new WidgetDefCollection([{ name: 'random', storageHash: 'xxxxx' }]);
      const values = { id1: JSON.stringify({ widgets: [{ title: 'Widget 1', name: 'random' }] }) };
      expect((new DashboardState(makeStorage(values), 'id1', undefined, stale, true).load() as unknown[]).length).toBe(0);
    });
    describe('the async functions', () => {
      it('should resolve with one widget', async () => {
        const model = new DashboardState({ ...makeStorage(), getItem: () => Promise.resolve(JSON.stringify({ widgets: [{ title: 'Widget 1', name: 'random' }] })) }, 'id1', undefined, definitions, true);
        const result = await model.load() as Array<Record<string, unknown>>;
        expect(result[0].name).toBe('random'); expect(result[0].title).toBe('Widget 1');
      });
      it('should reject with null', async () => {
        const model = new DashboardState({ ...makeStorage(obj), getItem: () => Promise.resolve(obj.id4) }, 'id4', undefined, definitions, true);
        await expect(model.load()).rejects.toBeNull();
      });
      it('should reject by storage.load', async () => {
        const model = new DashboardState({ ...makeStorage(), getItem: () => Promise.reject('bad id') }, 'BAD_ID', undefined, definitions, true);
        await expect(model.load()).rejects.toBe('bad id');
      });
    });
  });
  describe('the save function', () => {
    const widgets = [
      { name: 'random', title: 'My new widget #1', serialize: function () { return { name: this.name, title: this.title }; } },
      { name: 'time', title: 'My new widget #2', serialize: function () { return { name: this.name, title: this.title }; } },
    ];
    it('should add widgets to storageData', () => {
      const storage = makeStorage(); expect(new DashboardState(storage, 'id1', undefined, definitions, true).save(widgets)).toBe(true); expect(storage.values.id1).toBeDefined();
    });
    it('should add non-stringify wdigets', () => {
      const storage = makeStorage(); expect(new DashboardState(storage, 'id1', undefined, definitions, false).save(widgets)).toBe(true); expect(storage.values.id1).toBeDefined();
    });
    it('should abort', () => {
      const storage = makeStorage(); const model = new DashboardState(storage, 'id1', undefined, definitions, true); model.storage = undefined;
      expect(model.save(widgets)).toBe(true); expect(Object.keys(storage.values)).toHaveLength(0);
    });
    it('logs malformed JSON using the oracle warning', () => {
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
      new DashboardState(makeStorage({ id: '{bad' }), 'id', undefined, definitions, true).load();
      expect(warn).toHaveBeenCalledWith('Serialized dashboard state was malformed and could not be parsed: ', '{bad'); warn.mockRestore();
    });
  });
});
