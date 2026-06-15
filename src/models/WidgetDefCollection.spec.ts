import { WidgetDefCollection } from './WidgetDefCollection';

describe('WidgetDefCollection', () => {
  const widgetDefs = [
    {
      name: 'random',
      directive: 'wt-scope-watch',
      attrs: { value: 'randomValue' },
    },
    {
      name: 'time',
      directive: 'wt-time',
    },
  ];

  it('should be a function (class)', () => {
    expect(typeof WidgetDefCollection).toEqual('function');
  });

  describe('the constructor', () => {
    it('should create widget definitions object', () => {
      const model = new WidgetDefCollection(widgetDefs);

      expect(model.getAt(0)!.name).toEqual('random');
      expect(model.getAt(0)!.directive).toEqual('wt-scope-watch');
      expect(model.getAt(0)!.attrs).toEqual({ value: 'randomValue' });
      expect(model.getAt(1)!.name).toEqual('time');
      expect(model.getAt(1)!.directive).toEqual('wt-time');
    });
  });

  describe('the constructor with definition function', () => {
    it('should create the definition using function', () => {
      const func = () => widgetDefs[0];
      const model = new WidgetDefCollection([func]);

      expect(model.getAt(0)!.name).toEqual('random');
      expect(model.getAt(0)!.directive).toEqual('wt-scope-watch');
      expect(model.getAt(0)!.attrs).toEqual({ value: 'randomValue' });
    });
  });

  describe('the getByName function', () => {
    it('should return a widget definition', () => {
      const model = new WidgetDefCollection(widgetDefs);
      const result = model.getByName('random');

      expect(result!.name).toEqual('random');
      expect(result!.directive).toEqual('wt-scope-watch');
      expect(result!.attrs).toEqual({ value: 'randomValue' });
    });

    it('should return undefined for non-existent name', () => {
      const model = new WidgetDefCollection(widgetDefs);
      const result = model.getByName('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('the add function', () => {
    it('should add a widget definition to the collection', () => {
      const model = new WidgetDefCollection(widgetDefs);
      model.add({ name: 'new-wt' });

      expect(model.getAt(0)!.name).toEqual('random');
      expect(model.getAt(1)!.name).toEqual('time');
      expect(model.getAt(2)!.name).toEqual('new-wt');
      expect(model.length).toEqual(3);
    });
  });
});
