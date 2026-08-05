import { describe, expect, it, vi } from 'vitest';
import { WidgetModel } from './WidgetModel';

describe('WidgetModel', () => {
  it('deep copies definitions and gives overrides precedence', () => {
    const definition = { name: 'TestWidget', style: { width: '10em' }, funkyChicken: { cool: false } };
    const model = new WidgetModel(definition, { style: { width: '15em' } });
    model.style.width = '20em';
    expect(definition.style.width).toBe('10em');
    expect(model.style.width).toBe('20em');
    expect(model.directive).toBe('TestWidget');
  });

  it('selects templateUrl, template, directive, then name', () => {
    expect(new WidgetModel({ name: 'one', templateUrl: 'one.html' }).templateUrl).toBe('one.html');
    expect(new WidgetModel({ name: 'two', template: '<div />' }).template).toBe('<div />');
    expect(new WidgetModel({ name: 'three', directive: 'ng-bind' }).directive).toBe('ng-bind');
    expect(new WidgetModel({ name: 'four' }).directive).toBe('four');
  });

  it('clamps widths and warns for invalid values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const model = new WidgetModel({ size: { minWidth: '10%' } });
    expect(model.setWidth(1, '%')).toBe('10%');
    expect(model.setWidth('110%')).toBe('100%');
    expect(model.setWidth(-1, 'px')).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('updates size and serializes only persisted fields', () => {
    const model = new WidgetModel({
      name: 'widget1',
      title: 'test widget',
      style: { height: '200px' },
      size: { width: '50%' },
      dataModelOptions: { value: '1' },
      attrs: { value: '2' },
      storageHash: 'xy',
    });
    model.setHeight('200px');
    expect(model.contentStyle.height).toBe('200px');
    expect(model.serialize()).toEqual(expect.objectContaining({
      name: 'widget1',
      title: 'test widget',
      style: { height: '200px' },
      dataModelOptions: { value: '1' },
      attrs: { value: '2' },
      storageHash: 'xy',
    }));
    expect(model.serialize()).not.toHaveProperty('containerStyle');
  });

  it('assigns a unique non-enumerable uid outside the serialized shape', () => {
    const first = new WidgetModel({ name: 'one' });
    const second = new WidgetModel({ name: 'two' });
    expect(first.uid).not.toBe(second.uid);
    expect(Object.keys(first)).not.toContain('uid');
    expect(first.serialize()).not.toHaveProperty('uid');
  });
});
