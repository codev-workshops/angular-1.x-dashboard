import { describe, expect, it, vi } from 'vitest';
import { resolveWidgetContent } from './registry';

describe('widget registry resolution', () => {
  it('resolves templateUrl, template, directive, and name in order', () => {
    const Component = () => <div />;
    const registry = { 'url.html': Component, '<div />': Component, directive: Component, name: Component };
    expect(resolveWidgetContent({ name: 'name', directive: 'directive', template: '<div />', templateUrl: 'url.html' }, registry).Component).toBe(Component);
    expect(resolveWidgetContent({ name: 'name', directive: 'directive', template: '<div />' }, registry).Component).toBe(Component);
    expect(resolveWidgetContent({ name: 'name', directive: 'directive' }, registry).Component).toBe(Component);
    expect(resolveWidgetContent({ name: 'name' }, registry).Component).toBe(Component);
  });

  it('warns and renders no component on a miss', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(resolveWidgetContent({ name: 'missing' }, {})).toEqual({ key: 'missing', Component: undefined });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
