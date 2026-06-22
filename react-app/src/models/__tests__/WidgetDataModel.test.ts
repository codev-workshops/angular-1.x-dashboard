import { describe, it, expect } from 'vitest';
import { WidgetDataModel } from '../WidgetDataModel';

describe('WidgetDataModel', () => {
  it('should be a function', () => {
    expect(typeof WidgetDataModel).toEqual('function');
  });

  describe('the constructor', () => {
    it('should have functions', () => {
      const model = new WidgetDataModel();
      expect(typeof model.setup).toEqual('function');
      expect(typeof model.updateScope).toEqual('function');
      expect(typeof model.init).toEqual('function');
      expect(typeof model.destroy).toEqual('function');
    });
  });

  describe('the setup function', () => {
    it('should set widget and scope', () => {
      const model = new WidgetDataModel();
      const widget = {
        dataAttrName: 'test attribute name',
        dataModelOptions: { some: 'options' },
      };
      const scope = { widgetData: undefined };

      model.setup(widget, scope);

      expect(model.dataAttrName).toEqual('test attribute name');
      expect(model.dataModelOptions).toEqual({ some: 'options' });
      expect(model.widgetScope).toEqual(scope);
    });
  });

  describe('the updateScope function', () => {
    it('should update widgetData', () => {
      const model = new WidgetDataModel();
      model.widgetScope = {};
      model.updateScope('new data');
      expect(model.widgetScope.widgetData).toEqual('new data');
    });
  });

  describe('the init function', () => {
    it('should execute without error', () => {
      const model = new WidgetDataModel();
      let result: unknown = 'some text';

      expect(() => {
        result = model.init();
      }).not.toThrow();

      expect(result).toBeUndefined();
    });
  });

  describe('the destroy function', () => {
    it('should execute without error', () => {
      const model = new WidgetDataModel();
      let result: unknown = 'some text';

      expect(() => {
        result = model.destroy();
      }).not.toThrow();

      expect(result).toBeUndefined();
    });
  });
});
