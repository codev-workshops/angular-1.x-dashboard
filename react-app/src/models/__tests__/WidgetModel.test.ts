import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WidgetModel } from '../WidgetModel';

describe('WidgetModel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be a function', () => {
    expect(typeof WidgetModel).toEqual('function');
  });

  describe('the constructor', () => {
    let m: WidgetModel;
    let Class: Record<string, unknown>;
    let Class2: Record<string, unknown>;
    let overrides: Record<string, unknown>;

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
        funkyChicken: {
          cool: false,
          fun: true,
        },
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
        size: {
          height: '100px',
        },
        style: {
          width: '15em',
          minWidth: '10em',
        },
      };
      vi.spyOn(WidgetModel.prototype, 'setWidth').mockImplementation(() => undefined);
      vi.spyOn(WidgetModel.prototype, 'setHeight').mockImplementation(() => '');
      m = new WidgetModel(Class, overrides);
    });

    it('should copy class defaults, so that changes on an instance do not change the Class', () => {
      m.style.width = '20em';
      expect((Class.style as Record<string, string>).width).toEqual('10em');
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
      expect((m as Record<string, unknown>).funkyChicken).toEqual({ cool: false, fun: true });
      expect((m as Record<string, unknown>).funkyChicken === Class.funkyChicken).toEqual(false);
    });

    it('should set templateUrl if and only if it is present on Class', () => {
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.templateUrl).toEqual('my/url.html');
    });

    it('should set template if and only if it is present on Class', () => {
      delete Class2.templateUrl;
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.template).toEqual('<div>some template</div>');
    });

    it('should look for directive if neither templateUrl nor template is found on Class', () => {
      delete Class2.templateUrl;
      delete Class2.template;
      Class2.directive = 'ng-bind';
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.directive).toEqual('ng-bind');
    });

    it('should set the name as directive if templateUrl, template, and directive are not defined', () => {
      delete Class2.templateUrl;
      delete Class2.template;
      const m2 = new WidgetModel(Class2, overrides);
      expect(m2.directive).toEqual('TestWidget2');
    });

    it('should not require overrides', () => {
      const fn = function () {
        new WidgetModel(Class);
      };
      expect(fn).not.toThrow();
    });

    it('should copy references to settingsModalOptions, onSettingsClose, onSettingsDismiss', () => {
      const m3 = new WidgetModel(Class);
      expect(m3.settingsModalOptions).toEqual(Class.settingsModalOptions);
      expect(m3.onSettingsClose).toEqual(Class.onSettingsClose);
      expect(m3.onSettingsDismiss).toEqual(Class.onSettingsDismiss);
    });
  });

  describe('setWidth method', () => {
    let context: WidgetModel;
    let setWidth: typeof WidgetModel.prototype.setWidth;

    beforeEach(() => {
      const overrides = {
        size: {
          minWidth: '10%',
        },
      };
      context = new WidgetModel(overrides);
      setWidth = WidgetModel.prototype.setWidth;
    });

    it('should take one argument as a string with units', () => {
      setWidth.call(context, '100px');
      expect(context.containerStyle.width).toEqual('100px');
    });

    it('should take two args as a number and string as units', () => {
      setWidth.call(context, 100, 'px');
      expect(context.containerStyle.width).toEqual('100px');
    });

    it('should return undefined and not set anything if width is less than 0', () => {
      const result = setWidth.call(context, -100, 'em');
      expect(result).toBeUndefined();
      expect(context.containerStyle.width).not.toEqual('-100em');
    });

    it('should assume % if no unit is given', () => {
      setWidth.call(context, 50);
      expect(context.containerStyle.width).toEqual('50%');
    });

    it('should force greater than 0% and less than or equal 100%', () => {
      setWidth.call(context, '110%');
      expect(context.containerStyle.width).toEqual('100%');
    });

    it('should force min width to be used', () => {
      setWidth.call(context, 1, '%');
      expect(context.containerStyle.width).toEqual('10%');
    });
  });

  describe('setHeight method', () => {
    let context: WidgetModel;
    let setHeight: typeof WidgetModel.prototype.setHeight;

    beforeEach(() => {
      context = new WidgetModel({});
      setHeight = WidgetModel.prototype.setHeight;
    });

    it('should set correct height', () => {
      setHeight.call(context, '200px');
      expect(context.contentStyle.height).toEqual('200px');
    });
  });

  describe('setStyle method', () => {
    let context: WidgetModel;
    let setStyle: typeof WidgetModel.prototype.setStyle;

    beforeEach(() => {
      context = new WidgetModel({});
      setStyle = WidgetModel.prototype.setStyle;
    });

    it('should set correct style', () => {
      const style = {
        width: '70%',
        height: '300px',
      };
      setStyle.call(context, style);
      expect(context.containerStyle).toEqual(style);
    });
  });

  describe('serialize method', () => {
    let context: WidgetModel;
    let serialize: typeof WidgetModel.prototype.serialize;

    beforeEach(() => {
      const overrides = {
        name: 'widget1',
        title: 'test widget',
        style: {
          height: '200px',
        },
        size: {
          width: '50%',
        },
        dataModelOptions: {
          value1: '1',
        },
        attrs: {
          value2: '2',
        },
        storageHash: 'xy',
      };
      context = new WidgetModel(overrides);
      serialize = WidgetModel.prototype.serialize;
    });

    it('should return title, name, style, size, dataModelOptions, attrs and storageHash', () => {
      const result = serialize.call(context);
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
