import { createElement, type ReactElement } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useResizer } from './useResizer';
import { createDashboardEvents, type DashboardEvents } from './events';
import { WidgetModel } from './models/WidgetModel';

const REGIONS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

type HostProps = {
  widget: WidgetModel;
  events: DashboardEvents;
  onWidgetChanged: (widget: WidgetModel) => void;
};

function Host({ widget, events, onWidgetChanged }: HostProps): ReactElement {
  const resizer = useResizer({ widget, events, onWidgetChanged });
  return createElement(
    'div',
    { className: 'dashboard-widget-area' },
    createElement(
      'div',
      { className: 'widget-container', ref: resizer.containerRef, style: { ...widget.containerStyle } },
      createElement(
        'div',
        { className: 'widget panel panel-default', ref: resizer.widgetRef },
        createElement('div', { className: 'widget-header panel-heading', ref: resizer.headerRef }),
        ...REGIONS.map((region) => createElement('div', {
          key: region,
          className: `${region}-resizer`,
          onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => resizer.grabResizer(event, region),
        })),
        resizer.marquee ? createElement('div', {
          ref: resizer.marqueeRef,
          className: `widget-resizer-marquee ${resizer.marquee.region}`,
          style: { height: `${resizer.marquee.height}px`, width: `${resizer.marquee.width}px`, top: '-1px', left: '-1px' },
        }) : null,
      ),
    ),
  );
}

function box(element: Element | null, width: number, height: number): void {
  Object.defineProperty(element, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(element, 'clientHeight', { value: height, configurable: true });
}

function setup(definition: Record<string, unknown> = {}, sizes?: { parent?: number; widget?: [number, number]; header?: number; marginRight?: string }) {
  const widget = new WidgetModel({ name: 'resizable', directive: 'resizable', ...definition });
  const events = createDashboardEvents();
  const onWidgetChanged = vi.fn();
  const resized = vi.fn();
  events.on('widgetResized', resized);
  const view = render(createElement(Host, { widget, events, onWidgetChanged }));
  const area = document.querySelector('.dashboard-widget-area');
  const container = document.querySelector('.widget-container');
  const widgetElement = document.querySelector<HTMLElement>('.widget');
  const header = document.querySelector<HTMLElement>('.widget-header');
  box(area, sizes?.parent ?? 400, 1000);
  box(container, sizes?.widget?.[0] ?? 0, sizes?.widget?.[1] ?? 0);
  box(widgetElement, sizes?.widget?.[0] ?? 0, sizes?.widget?.[1] ?? 0);
  Object.defineProperty(header, 'offsetHeight', { value: sizes?.header ?? 0, configurable: true });
  if (widgetElement) widgetElement.style.marginRight = sizes?.marginRight ?? '0px';
  return { widget, events, onWidgetChanged, resized, view };
}

function marquee(): HTMLElement | null {
  return document.querySelector('.widget-resizer-marquee');
}

function grab(region: string, init: { clientX?: number; clientY?: number; button?: number } = {}): void {
  fireEvent.mouseDown(document.querySelector(`.${region}-resizer`)!, { clientX: 0, clientY: 0, ...init });
}

afterEach(() => cleanup());

describe('useResizer', () => {
  it('does nothing when the button is not primary', () => {
    setup({ style: { width: '30%' } });
    grab('e', { button: 1 });
    expect(marquee()).toBeNull();
  });

  it('stops propagation and prevents the default action', () => {
    setup({ style: { width: '30%' } });
    const handle = document.querySelector('.e-resizer')!;
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });
    const stopPropagation = vi.spyOn(event, 'stopPropagation');
    fireEvent(handle, event);
    expect(stopPropagation).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('adds a marquee to the widget element', () => {
    setup({ style: { width: '30%' } });
    grab('e');
    expect(document.querySelector('.widget > .widget-resizer-marquee')).not.toBeNull();
    expect(marquee()!.className).toBe('widget-resizer-marquee e');
  });

  it('updates the marquee width on horizontal mousemove', () => {
    setup({ style: { width: '30%' } });
    grab('e', { clientX: 50 });
    fireEvent.mouseMove(window, { clientX: 300 });
    expect(marquee()!.style.width).toBe('252px');
  });

  it('updates the marquee height on vertical mousemove', () => {
    setup({ style: { width: '30%' } });
    grab('s', { clientY: 50 });
    fireEvent.mouseMove(window, { clientY: 300 });
    expect(marquee()!.style.height).toBe('252px');
  });

  it('removes the marquee on mouseup', () => {
    setup({ style: { width: '30%' } });
    grab('e');
    fireEvent.mouseUp(window, { clientX: 300 });
    expect(marquee()).toBeNull();
  });

  it('drives every region with the widget arithmetic', () => {
    const cases: Record<string, { move: { clientX: number; clientY: number }; width?: string; height?: string; top?: string; left?: string }> = {
      nw: { move: { clientX: -100, clientY: -60 }, width: '102px', height: '62px', left: '-102px', top: '-62px' },
      n: { move: { clientX: 0, clientY: -60 }, height: '62px', top: '-62px' },
      ne: { move: { clientX: 100, clientY: -60 }, width: '102px', height: '62px', top: '-62px' },
      e: { move: { clientX: 100, clientY: 0 }, width: '102px' },
      se: { move: { clientX: 100, clientY: 60 }, width: '102px', height: '62px' },
      s: { move: { clientX: 0, clientY: 60 }, height: '62px' },
      sw: { move: { clientX: -100, clientY: 60 }, width: '102px', height: '62px', left: '-102px' },
      w: { move: { clientX: -100, clientY: 0 }, width: '102px', left: '-102px' },
    };
    for (const [region, expectation] of Object.entries(cases)) {
      setup({ style: { width: '30%' } });
      grab(region);
      fireEvent.mouseMove(window, expectation.move);
      const element = marquee()!;
      if (expectation.width) expect(element.style.width, region).toBe(expectation.width);
      if (expectation.height) expect(element.style.height, region).toBe(expectation.height);
      if (expectation.top) expect(element.style.top, region).toBe(expectation.top);
      if (expectation.left) expect(element.style.left, region).toBe(expectation.left);
      fireEvent.mouseUp(window, {});
      cleanup();
    }
  });

  it('clamps the marquee at the configured minimum width and height', () => {
    setup({ size: { width: '50%', minWidth: '200px', minHeight: '100px' } }, { header: 40 });
    grab('se');
    fireEvent.mouseMove(window, { clientX: -1000, clientY: -1000 });
    expect(marquee()!.style.width).toBe('200px');
    expect(marquee()!.style.height).toBe('144px');
  });

  it('clamps a percentage minimum width against the parent width', () => {
    setup({ size: { width: '50%', minWidth: '40%' } }, { parent: 400 });
    grab('w');
    fireEvent.mouseMove(window, { clientX: 1000 });
    expect(marquee()!.style.width).toBe('160px');
  });

  it('never draws wider than the parent when the width is a percentage', () => {
    setup({ size: { width: '50%' } }, { parent: 400, marginRight: '14px' });
    grab('e');
    fireEvent.mouseMove(window, { clientX: 5000 });
    expect(marquee()!.style.width).toBe('386px');
  });

  it('writes the new width onto the model and emits both events on mouseup', () => {
    const { widget, onWidgetChanged, resized } = setup({ size: { width: '50%' } }, { parent: 400, marginRight: '14px' });
    grab('e');
    fireEvent.mouseMove(window, { clientX: 100 });
    fireEvent.mouseUp(window, { clientX: 100 });
    expect(widget.containerStyle.width).toBe('28.999999999999996%');
    expect(onWidgetChanged).toHaveBeenCalledWith(widget);
    expect(resized).toHaveBeenCalledWith({ width: '28.999999999999996%', widthPixels: 116 });
  });

  it('keeps pixel widths in pixels', () => {
    const { widget, resized } = setup({ size: { width: '200px' } }, { parent: 400 });
    grab('e');
    fireEvent.mouseMove(window, { clientX: 100 });
    fireEvent.mouseUp(window, {});
    expect(widget.containerStyle.width).toBe('102px');
    expect(resized).toHaveBeenCalledWith({ width: '102px', widthPixels: 102 });
  });

  it('derives the height from the width for a ratio widget dragged east', () => {
    const { widget, resized } = setup({ size: { width: '50%', heightToWidthRatio: 0.25 } }, { parent: 400, header: 40 });
    grab('e');
    fireEvent.mouseMove(window, { clientX: 100 });
    expect(marquee()!.style.height).toBe('69.5px');
    fireEvent.mouseUp(window, {});
    expect(widget.contentStyle.height).toBe(25.5);
    expect(resized).toHaveBeenCalledWith({ width: '25.5%', widthPixels: 102, height: 25 });
  });

  it('derives the width from the height for a ratio widget dragged south', () => {
    const { widget, resized } = setup({ size: { width: '50%', heightToWidthRatio: 0.25 } }, { parent: 400, header: 40 });
    grab('s');
    fireEvent.mouseMove(window, { clientY: 200 });
    fireEvent.mouseUp(window, {});
    expect(widget.contentStyle.height).toBe(102);
    expect(resized).toHaveBeenCalledWith({ width: '100%', widthPixels: 408, height: 102 });
  });

  it('applies the minimum width, minimum height and height ratio on a window resize', () => {
    vi.useFakeTimers();
    const { widget } = setup({ resizeTimeout: 0, size: { width: '50%', minWidth: '900px', minHeight: '100px', heightToWidthRatio: 0.25 } }, { parent: 1280, widget: [640, 40] });
    act(() => {
      fireEvent(window, new Event('resize'));
      vi.runAllTimers();
    });
    expect(document.querySelector<HTMLElement>('.widget-container')!.style.width).toBe('900px');
    expect(widget.contentStyle.height).toBe(160);
    vi.useRealTimers();
  });
});
