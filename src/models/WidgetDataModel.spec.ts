import { WidgetDataModel } from './WidgetDataModel';

describe('WidgetDataModel', () => {
  let model: WidgetDataModel;

  beforeEach(() => {
    model = new WidgetDataModel();
  });

  it('should be a function (class)', () => {
    expect(typeof WidgetDataModel).toEqual('function');
  });

  describe('the constructor', () => {
    it('should have functions', () => {
      expect(typeof model.setup).toEqual('function');
      expect(typeof model.updateScope).toEqual('function');
      expect(typeof model.init).toEqual('function');
      expect(typeof model.destroy).toEqual('function');
    });
  });

  describe('the setup function', () => {
    it('should set widget and scope', () => {
      const widget = {
        dataAttrName: 'test attribute name',
        dataModelOptions: { some: 'options' },
      };
      const scope = { widgetData: undefined } as { widgetData?: any };

      model.setup(widget, scope);

      expect(model.dataAttrName).toEqual('test attribute name');
      expect(model.dataModelOptions).toEqual({ some: 'options' });
    });
  });

  describe('the updateScope function', () => {
    it('should update widgetData', () => {
      const scope = { widgetData: undefined } as { widgetData?: any };
      model.setup({ dataAttrName: 'x' }, scope);
      model.updateScope('new data');
      expect(scope.widgetData).toEqual('new data');
    });
  });

  describe('the init function', () => {
    it('should execute without error', () => {
      let result: any = 'some text';
      expect(() => {
        result = model.init();
      }).not.toThrow();
      expect(result).toBeUndefined();
    });
  });

  describe('the destroy function', () => {
    it('should execute without error', () => {
      let result: any = 'some text';
      expect(() => {
        result = model.destroy();
      }).not.toThrow();
      expect(result).toBeUndefined();
    });
  });
});
