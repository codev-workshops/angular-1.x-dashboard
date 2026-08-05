import { describe, expect, it } from 'vitest';
import { WidgetDefCollection } from './WidgetDefCollection';

const widgetDefs = [
  { name: 'random', directive: 'wt-scope-watch', attrs: { value: 'randomValue' } },
  { name: 'time', directive: 'wt-time' },
];

describe('Factory: WidgetDefCollection', () => {
  it('should be a function', () => expect(typeof WidgetDefCollection).toBe('function'));
  describe('the constructor', () => {
    it('should create widget definitions object', () => {
      const model = new WidgetDefCollection(widgetDefs);
      expect(typeof model).toBe('object');
      expect(model[0].name).toBe('random');
      expect(model[0].directive).toBe('wt-scope-watch');
      expect(model[0].attrs).toEqual({ value: 'randomValue' });
      expect(model[1].name).toBe('time');
      expect(model[1].directive).toBe('wt-time');
    });
  });
  describe('the constructor with definition function', () => {
    it('should create the definition using function', () => {
      class Definition {
        [key: string]: unknown;
        name = 'random';
        directive = 'wt-scope-watch';
        attrs = { value: 'randomValue' };
      }
      const model = new WidgetDefCollection([Definition]);
      expect(typeof model).toBe('object');
      expect(model[0].name).toBe('random');
      expect(model[0].directive).toBe('wt-scope-watch');
      expect(model[0].attrs).toEqual({ value: 'randomValue' });
    });
  });
  describe('the getByName function', () => {
    it('should return a widget definition', () => {
      const result = new WidgetDefCollection(widgetDefs).getByName('random');
      expect(result?.name).toBe('random');
      expect(result?.directive).toBe('wt-scope-watch');
      expect(result?.attrs).toEqual({ value: 'randomValue' });
    });
    it('should not find anything', () => {
      const result = new WidgetDefCollection(widgetDefs).getByName('random');
      expect(result?.name).toBe('random');
      expect(result?.directive).toBe('wt-scope-watch');
      expect(result?.attrs).toEqual({ value: 'randomValue' });
    });
  });
  describe('the add function', () => {
    it('should add a widget definition to the collection', () => {
      const model = new WidgetDefCollection(widgetDefs);
      model.add({ name: 'new-wt' });
      expect(model[0].name).toBe('random');
      expect(model[1].name).toBe('time');
      expect(model[2].name).toBe('new-wt');
    });
  });
});
