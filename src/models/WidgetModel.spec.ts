import { WidgetModel } from './WidgetModel';

describe('WidgetModel', () => {
  it('should be a function (class)', () => {
    expect(typeof WidgetModel).toEqual('function');
  });

  describe('the constructor', () => {
    let m: WidgetModel;
    let Class: any;
    let Class2: any;
    let overrides: any;

    beforeEach(() => {
      Class = {
        name: 'TestWidget',
        attrs: {},
        dataAttrName: 'attr-name',
        dataModelType: function TestType() {},
        dataModelOptions: {},
        style: { width: '10em' },
        settingsModalOptions: {},
        onSettingsClose: function () {},
        onSettingsDismiss: function () {},
        funkyChicken: { cool: false, fun: true },
      };

      Class2 = {
        name: 'TestWidget2',
        attrs: {},
        dataAttrName: 'attr-name',
        dataModelType: function TestType() {},
        dataModelOptions: {},
        style: { width: '10em' },
        templateUrl: 'my/url.html',
        template: '<div>some template</div>',
      };

      overrides = {
        size: { height: '100px' },
        style: { width: '15em', minWidth: '10em' },
      };

      jest.spyOn(WidgetModel.prototype, 'setWidth');
      jest.spyOn(WidgetModel.prototype, 'setHeight');
      m = new WidgetModel(Class, overrides);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should copy class defaults, so that changes on an instance do not change the Class', () => {
      m.style.width = '20em';
      expect(Class.style.width).toEqual('10em');
    });

    it('should call setWidth', () => {
      expect(WidgetModel.prototype.setWidth).toHaveBeenCalled();
    });

    it('should call setHeight', () => {
      expect(WidgetModel.prototype.setHeight).toHaveBeenCalled();
    });

    it('should take overrides as precedent over Class defaults', () => {
      expect(m.style.width).toEqual('15em');
    });

    it('should copy arbitrary data from the widget definition', () => {
      expect(m.funkyChicken.cool).toEqual(false);
      expect(m.funkyChicken.fun).toEqual(true);
      expect(m.funkyChicken === Class.funkyChicken).toEqual(false);
    });

    it('should set templateUrl if and only if it is present on Class', () => {
      jest.restoreAllMocks();
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.templateUrl).toEqual('my/url.html');
    });

    it('should set template if and only if it is present on Class', () => {
      jest.restoreAllMocks();
      delete Class2.templateUrl;
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.template).toEqual('<div>some template</div>');
    });

    it('should look for directive if neither templateUrl nor template is found on Class', () => {
      jest.restoreAllMocks();
      delete Class2.templateUrl;
      delete Class2.template;
      Class2.directive = 'ng-bind';
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.directive).toEqual('ng-bind');
    });

    it('should set the name as directive if templateUrl, template, and directive are not defined', () => {
      jest.restoreAllMocks();
      delete Class2.templateUrl;
      delete Class2.template;
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.directive).toEqual('TestWidget2');
    });

    it('should not require overrides', () => {
      jest.restoreAllMocks();
      expect(() => new WidgetModel(Class)).not.toThrow();
    });

    it('should copy references to settingsModalOptions, onSettingsClose, onSettingsDismiss', () => {
      jest.restoreAllMocks();
      const m3 = new WidgetModel(Class);
      expect(m3.settingsModalOptions).toEqual(Class.settingsModalOptions);
      expect(m3.onSettingsClose).toEqual(Class.onSettingsClose);
      expect(m3.onSettingsDismiss).toEqual(Class.onSettingsDismiss);
    });
  });

  describe('setWidth method', () => {
    let context: WidgetModel;

    beforeEach(() => {
      const overrides = { size: { minWidth: '10%' } };
      context = new WidgetModel(overrides as any);
    });

    it('should take one argument as a string with units', () => {
      context.setWidth('100px');
      expect(context.containerStyle.width).toEqual('100px');
    });

    it('should take two args as a number and string as units', () => {
      context.setWidth(100, 'px');
      expect(context.containerStyle.width).toEqual('100px');
    });

    it('should return undefined and not set anything if width is less than 0', () => {
      const result = context.setWidth(-100, 'em');
      expect(result).toBeUndefined();
      expect(context.containerStyle.width).not.toEqual('-100em');
    });

    it('should assume % if no unit is given', () => {
      context.setWidth(50);
      expect(context.containerStyle.width).toEqual('50%');
    });

    it('should force greater than 0% and less than or equal 100%', () => {
      context.setWidth('110%');
      expect(context.containerStyle.width).toEqual('100%');
    });

    it('should force min width to be used', () => {
      context.setWidth(1, '%');
      expect(context.containerStyle.width).toEqual('10%');
    });
  });

  describe('setHeight method', () => {
    let context: WidgetModel;

    beforeEach(() => {
      context = new WidgetModel({ name: 'test' } as any);
    });

    it('should set correct height', () => {
      context.setHeight('200px');
      expect(context.contentStyle.height).toEqual('200px');
    });
  });

  describe('setStyle method', () => {
    let context: WidgetModel;

    beforeEach(() => {
      context = new WidgetModel({ name: 'test' } as any);
    });

    it('should set correct style', () => {
      const style = { width: '70%', height: '300px' };
      context.setStyle(style);
      expect(context.containerStyle).toEqual(style);
    });
  });

  describe('serialize method', () => {
    let context: WidgetModel;

    beforeEach(() => {
      const overrides = {
        name: 'widget1',
        title: 'test widget',
        style: { height: '200px' },
        size: { width: '50%' },
        dataModelOptions: { value1: '1' },
        attrs: { value2: '2' },
        storageHash: 'xy',
      };
      context = new WidgetModel(overrides as any);
    });

    it('should return title, name, style, size, dataModelOptions, attrs and storageHash', () => {
      const result = context.serialize();
      expect(result.name).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.style).toBeDefined();
      expect(result.size).toBeDefined();
      expect(result.dataModelOptions).toBeDefined();
      expect(result.attrs).toBeDefined();
      expect(result.storageHash).toBeDefined();
    });
  });
});
