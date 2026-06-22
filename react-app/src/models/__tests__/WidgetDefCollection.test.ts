import { describe, it, expect } from 'vitest';
import { WidgetDefCollection } from '../WidgetDefCollection';
import type { WidgetDefinition } from '../WidgetDefCollection';

const widgetDefs: WidgetDefinition[] = [
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
];

describe('WidgetDefCollection', () => {
  it('should be a function', () => {
    expect(typeof WidgetDefCollection).toEqual('function');
  });

  describe('the constructor', () => {
    it('should create widget definitions object', () => {
      const model = new WidgetDefCollection(widgetDefs);

      expect(typeof model === 'object').toBe(true);
      expect(model[0].name).toEqual('random');
      expect(model[0].directive).toEqual('wt-scope-watch');
      expect(model[0].attrs).toEqual({ value: 'randomValue' });
      expect(model[1].name).toEqual('time');
      expect(model[1].directive).toEqual('wt-time');
    });
  });

  describe('the constructor with definition function', () => {
    it('should create the definition using function', () => {
      const func = function (this: WidgetDefinition) {
        this.name = widgetDefs[0].name;
        this.directive = widgetDefs[0].directive;
        this.attrs = widgetDefs[0].attrs;
      } as unknown as new () => WidgetDefinition;
      const model = new WidgetDefCollection([func]);

      expect(typeof model === 'object').toBe(true);
      expect(model[0].name).toEqual('random');
      expect(model[0].directive).toEqual('wt-scope-watch');
      expect(model[0].attrs).toEqual({ value: 'randomValue' });
    });
  });

  describe('the getByName function', () => {
    it('should return a widget definition', () => {
      const model = new WidgetDefCollection(widgetDefs);
      const result = model.getByName('random')!;

      expect(result.name).toEqual('random');
      expect(result.directive).toEqual('wt-scope-watch');
      expect(result.attrs).toEqual({ value: 'randomValue' });
    });

    it('should not find anything', () => {
      const model = new WidgetDefCollection(widgetDefs);
      const result = model.getByName('random')!;

      expect(result.name).toEqual('random');
      expect(result.directive).toEqual('wt-scope-watch');
      expect(result.attrs).toEqual({ value: 'randomValue' });
    });
  });

  describe('the add function', () => {
    it('should add a widget definition to the collection', () => {
      const model = new WidgetDefCollection(widgetDefs);
      model.add({
        name: 'new-wt',
      });

      expect(model[0].name).toEqual('random');
      expect(model[1].name).toEqual('time');
      expect(model[2].name).toEqual('new-wt');
    });
  });
});
