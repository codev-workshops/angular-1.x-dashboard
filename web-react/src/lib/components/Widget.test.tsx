import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Widget } from './Widget';
import { WidgetModel } from '../models/WidgetModel';

function renderWidget(overrides: Record<string, unknown> = {}) {
  const widget = new WidgetModel({ name: 'reference', directive: 'reference', title: 'Widget 1', ...overrides });
  const Component = () => <div>Reference content</div>;
  const onRemove = vi.fn();
  const onOpenSettings = vi.fn();
  const onWidgetChanged = vi.fn();
  return {
    widget,
    onWidgetChanged,
    ...render(
      <Widget
        widget={widget}
        options={{}}
        scope={{}}
        registry={{ reference: Component }}
        onRemove={onRemove}
        onOpenSettings={onOpenSettings}
        onWidgetChanged={onWidgetChanged}
      />,
    ),
    onRemove,
    onOpenSettings,
  };
}

afterEach(() => cleanup());

describe('Widget', () => {
  it('renders the shell and content', () => {
    renderWidget();
    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Reference content')).toBeInTheDocument();
    expect(document.querySelector('.widget-container')).toBeInTheDocument();
  });

  it('edits a title and toggles content', () => {
    renderWidget();
    fireEvent.doubleClick(screen.getAllByText('Widget 1')[0]);
    const input = screen.getByDisplayValue('Widget 1');
    fireEvent.change(input, { target: { value: 'Renamed' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText('Renamed')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.glyphicon-minus')!);
    expect(document.querySelector('.widget-content')).toHaveStyle({ display: 'none' });
  });

  it('fires remove and settings controls', () => {
    const { onRemove, onOpenSettings } = renderWidget();
    fireEvent.click(document.querySelector('.glyphicon-remove')!);
    fireEvent.click(document.querySelector('.glyphicon-cog')!);
    expect(onRemove).toHaveBeenCalled();
    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('renders the eight resize handles and hides the vertical ones when disabled', () => {
    renderWidget();
    expect(document.querySelectorAll('.widget-w-resizer .nw-resizer')).toHaveLength(1);
    expect(document.querySelectorAll('.widget-n-resizer')).toHaveLength(1);
    expect(document.querySelectorAll('.widget-s-resizer .se-resizer')).toHaveLength(1);
    cleanup();
    renderWidget({ enableVerticalResize: false });
    expect(document.querySelectorAll('.widget-n-resizer')).toHaveLength(0);
    expect(document.querySelectorAll('.widget-s-resizer')).toHaveLength(0);
    expect(document.querySelectorAll('.nw-resizer')).toHaveLength(0);
    expect(document.querySelectorAll('.w-resizer')).toHaveLength(1);
    expect(document.querySelectorAll('.e-resizer')).toHaveLength(1);
  });

  it('drags a marquee inside the widget element and writes the new width', () => {
    const { widget, onWidgetChanged } = renderWidget();
    Object.defineProperty(document.querySelector('.widget-container')!.parentElement!, 'clientWidth', { value: 400, configurable: true });
    fireEvent.mouseDown(document.querySelector('.e-resizer')!, { clientX: 0, clientY: 0 });
    const marquee = document.querySelector<HTMLElement>('.widget > .widget-resizer-marquee')!;
    expect(marquee.className).toBe('widget-resizer-marquee e');
    fireEvent.mouseMove(window, { clientX: 100 });
    expect(marquee.style.width).toBe('102px');
    fireEvent.mouseUp(window, { clientX: 100 });
    expect(document.querySelector('.widget-resizer-marquee')).toBeNull();
    expect(widget.containerStyle.width).toBe('25.5%');
    expect(document.querySelector<HTMLElement>('.widget-container')!.style.width).toBe('25.5%');
    expect(onWidgetChanged).toHaveBeenCalledWith(widget);
  });

  it('grabs from every region', () => {
    for (const region of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
      renderWidget();
      fireEvent.mouseDown(document.querySelectorAll(`.${region}-resizer`)[0], { clientX: 0, clientY: 0 });
      expect(document.querySelector('.widget-resizer-marquee')!.className).toBe(`widget-resizer-marquee ${region}`);
      fireEvent.mouseUp(window, {});
      cleanup();
    }
  });
});
