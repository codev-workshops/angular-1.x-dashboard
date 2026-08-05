import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import type { DashboardEvents } from './events';
import type { WidgetModel } from './models/WidgetModel';

export type ResizeRegion = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export type ResizedSize = {
  width?: string;
  widthPixels?: number;
  height?: number;
};

export type MarqueeState = {
  region: string;
  width: number;
  height: number;
};

export type ResizerApi = {
  grabResizer: (event: ReactMouseEvent<HTMLElement>, region: string) => void;
  containerRef: RefObject<HTMLDivElement>;
  widgetRef: RefObject<HTMLDivElement>;
  headerRef: RefObject<HTMLDivElement>;
  marqueeRef: RefObject<HTMLDivElement>;
  marquee: MarqueeState | null;
};

export type UseResizerOptions = {
  widget: WidgetModel;
  events?: DashboardEvents | null;
  onWidgetChanged?: (widget: WidgetModel) => void;
};

type DragState = {
  region: string;
  initX: number;
  initY: number;
  currentWidthPixel: number;
  currentHeightPixel: number;
  widthUnits: string;
  parentWidth: number;
  headerHeight: number;
  marginRight: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  width: number;
  height: number;
};

const MARQUEE_BORDER = 4;
const DEFAULT_RESIZE_TIMEOUT = 100;

function toNumber(value: string | null | undefined): number {
  const parsed = parseFloat(value ?? '');
  return Number.isNaN(parsed) ? 0 : parsed;
}

function contentWidth(element: HTMLElement): number {
  const style = getComputedStyle(element);
  return element.clientWidth - toNumber(style.paddingLeft) - toNumber(style.paddingRight);
}

function contentHeight(element: HTMLElement): number {
  const style = getComputedStyle(element);
  return element.clientHeight - toNumber(style.paddingTop) - toNumber(style.paddingBottom);
}

function measured(element: HTMLElement | null, styleValue: number, axis: 'width' | 'height'): number {
  if (element && element.clientWidth > 0 && element.clientHeight > 0) {
    return axis === 'width' ? contentWidth(element) : contentHeight(element);
  }
  return styleValue - MARQUEE_BORDER;
}

function dimension(source: Record<string, unknown> | undefined, key: string): { value: number; unit: string } | null {
  const raw = source?.[key];
  if (raw === undefined || raw === null || raw === '') return null;
  const text = String(raw);
  const value = parseFloat(text);
  const match = text.match(/px$|%$/i);
  return { value, unit: match ? match[0].toLowerCase() : 'px' };
}

export function useResizer({ widget, events, onWidgetChanged }: UseResizerOptions): ResizerApi {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const enforcedWidthRef = useRef<string | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [, setVersion] = useState(0);
  const forceRender = useCallback(() => setVersion((value) => value + 1), []);

  const parentWidthOf = (container: HTMLDivElement): number => {
    const parent = container.parentElement;
    return parent ? contentWidth(parent) : 0;
  };

  const applyMinWidth = useCallback((): boolean => {
    const container = containerRef.current;
    if (!container) return false;
    const min = dimension(widget.size, 'minWidth') ?? dimension(widget.style, 'minWidth');
    if (!min || !min.value || Number.isNaN(min.value)) return false;
    const current = dimension(widget.size, 'width') ?? dimension(widget.style, 'width');
    if (!current || !current.value || Number.isNaN(current.value)) return false;
    if (current.unit === min.unit) return false;

    const parentWidth = parentWidthOf(container);
    const width = current.unit === '%' ? parentWidth * current.value / 100 : current.value;
    const minWidth = min.unit === '%' ? parentWidth * min.value / 100 : min.value;

    if (width < minWidth) {
      enforcedWidthRef.current = `${minWidth}px`;
      container.style.width = enforcedWidthRef.current;
      return true;
    }
    enforcedWidthRef.current = `${current.value}${current.unit}`;
    container.style.width = enforcedWidthRef.current;
    return false;
  }, [widget]);

  const applyMinHeight = useCallback((): void => {
    const container = containerRef.current;
    if (!container) return;
    const minHeight = widget.size && typeof widget.size.minHeight === 'string' ? parseInt(widget.size.minHeight, 10) : NaN;
    if (Number.isNaN(minHeight)) return;
    if (contentHeight(container) < minHeight) widget.setHeight(minHeight);
  }, [widget]);

  const applyHeightRatio = useCallback((): void => {
    const container = containerRef.current;
    if (!container) return;
    const ratio = widget.size?.heightToWidthRatio;
    if (ratio === undefined) return;
    widget.setHeight(contentWidth(container) * ratio);
  }, [widget]);

  const grabResizer = useCallback((event: ReactMouseEvent<HTMLElement>, region: string): void => {
    const widgetElement = widgetRef.current;
    const container = containerRef.current;
    if (!widgetElement || !container) return;

    if (event.button !== 0) return;

    event.stopPropagation();
    event.preventDefault();

    const initX = event.clientX;
    const initY = event.clientY;

    const currentWidthPixel = contentWidth(widgetElement) + 2;
    const currentHeightPixel = contentHeight(widgetElement) + 2;
    const widthUnits = (String(widget.containerStyle.width ?? '') || '0%').match(/%|px/)?.[0] ?? '%';

    const parentWidth = parentWidthOf(container);
    const header = headerRef.current;
    const headerHeight = header ? header.offsetHeight : 0;
    const marginRight = Math.trunc(toNumber(getComputedStyle(widgetElement).marginRight));

    let minWidth: number;
    if (widget.size && widget.size.minWidth) {
      if (widget.size.minWidth.indexOf('%') > -1) {
        minWidth = parseInt(widget.size.minWidth, 10) * parentWidth / 100 - marginRight;
      } else {
        minWidth = parseInt(widget.size.minWidth, 10) - marginRight;
      }
    } else {
      minWidth = 40;
    }

    const maxWidth = widthUnits === '%' ? parentWidth - marginRight : Infinity;

    const minHeight = widget.size && widget.size.minHeight
      ? parseInt(widget.size.minHeight, 10) + headerHeight + 4
      : 40 + headerHeight;

    const ratio = widget.size?.heightToWidthRatio;
    const maxHeight = ratio === undefined ? Infinity : (maxWidth + marginRight) * ratio + headerHeight + 4;

    const state: DragState = {
      region, initX, initY, currentWidthPixel, currentHeightPixel, widthUnits, parentWidth,
      headerHeight, marginRight, minWidth, maxWidth, minHeight, maxHeight,
      width: currentWidthPixel, height: currentHeightPixel,
    };
    dragRef.current = state;
    setMarquee({ region, width: currentWidthPixel, height: currentHeightPixel });

    const calculateHeight = (width: number, includeMargins: boolean): number | undefined => {
      const currentRatio = widget.size?.heightToWidthRatio;
      if (currentRatio === undefined) return undefined;
      return includeMargins
        ? (width + marginRight) * currentRatio + headerHeight + 4
        : width * currentRatio;
    };

    const calculateWidth = (height: number, includeMargins: boolean): number | undefined => {
      const currentRatio = widget.size?.heightToWidthRatio;
      if (currentRatio === undefined) return undefined;
      return includeMargins
        ? (height - headerHeight - 4) / currentRatio - marginRight
        : height / currentRatio;
    };

    const mousemove = (moveEvent: MouseEvent): void => {
      let newWidth: number | undefined;
      let newHeight: number | undefined;
      let top: number | undefined;
      let left: number | undefined;
      switch (region) {
        case 'nw':
          newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + initX - moveEvent.clientX));
          newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + initY - moveEvent.clientY);
          left = currentWidthPixel - newWidth - 2;
          top = currentHeightPixel - newHeight - 2;
          break;
        case 'n':
          newHeight = Math.min(maxHeight, Math.max(minHeight, currentHeightPixel + initY - moveEvent.clientY));
          newWidth = calculateWidth(newHeight, true);
          top = currentHeightPixel - newHeight - 2;
          break;
        case 'ne':
          newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + moveEvent.clientX - initX));
          newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + initY - moveEvent.clientY);
          top = currentHeightPixel - newHeight - 2;
          break;
        case 'e':
          newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + moveEvent.clientX - initX));
          newHeight = calculateHeight(newWidth, true);
          break;
        case 'se':
          newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + moveEvent.clientX - initX));
          newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + moveEvent.clientY - initY);
          break;
        case 's':
          newHeight = Math.min(maxHeight, Math.max(minHeight, currentHeightPixel + moveEvent.clientY - initY));
          newWidth = calculateWidth(newHeight, true);
          break;
        case 'sw':
          newWidth = Math.max(minWidth, currentWidthPixel + initX - moveEvent.clientX);
          newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + moveEvent.clientY - initY);
          left = currentWidthPixel - newWidth - 2;
          break;
        case 'w':
          newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + initX - moveEvent.clientX));
          left = currentWidthPixel - newWidth - 2;
          newHeight = calculateHeight(newWidth, true);
          break;
      }
      const element = marqueeRef.current;
      if (top !== undefined && element) element.style.top = `${top}px`;
      if (left !== undefined && element) element.style.left = `${left}px`;
      if (newWidth !== undefined) {
        state.width = newWidth;
        if (element) element.style.width = `${newWidth}px`;
      }
      if (newHeight !== undefined) {
        state.height = newHeight;
        if (element) element.style.height = `${newHeight}px`;
      }
    };

    const mouseup = (): void => {
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
      dragRef.current = null;

      const marqueeWidth = Math.trunc(measured(marqueeRef.current, state.width, 'width')) + 4;
      const marqueeHeight = Math.trunc(measured(marqueeRef.current, state.height, 'height')) + 4;

      setMarquee(null);

      let newWidth: number | undefined;
      let newHeight: number | undefined;
      let newWidthPixels: number | undefined;

      if (marqueeWidth !== currentWidthPixel && ['nw', 'w', 'sw', 'ne', 'e', 'se'].indexOf(region) > -1) {
        newWidthPixels = marqueeWidth + marginRight;
        newWidth = widthUnits === '%' ? (marqueeWidth + marginRight) / parentWidth * 100 : newWidthPixels;
      }
      if (marqueeHeight !== currentHeightPixel && ['nw', 'n', 'ne', 'sw', 's', 'se'].indexOf(region) > -1) {
        newHeight = marqueeHeight - headerHeight - 2;
      }
      if (newWidthPixels !== undefined && ['w', 'e'].indexOf(region) > -1) {
        newHeight = calculateHeight(newWidthPixels, false);
      }
      if (newHeight !== undefined && ['n', 's'].indexOf(region) > -1) {
        newWidthPixels = calculateWidth(newHeight, false);
        if (newWidthPixels !== undefined) {
          newWidth = widthUnits === '%' ? (marqueeWidth + marginRight) / parentWidth * 100 : newWidthPixels;
        }
      }

      const size: ResizedSize = {};
      if (newWidth !== undefined) {
        enforcedWidthRef.current = null;
        size.width = widget.setWidth(newWidth, widthUnits);
        size.widthPixels = newWidthPixels;
      }
      if (newHeight !== undefined) {
        size.height = parseInt(widget.setHeight(newHeight), 10);
      }
      onWidgetChanged?.(widget);
      forceRender();
      events?.emit('widgetResized', size);
    };

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  }, [events, forceRender, onWidgetChanged, widget]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container && enforcedWidthRef.current) container.style.width = enforcedWidthRef.current;
  });

  useEffect(() => {
    applyMinWidth();
    applyMinHeight();
    applyHeightRatio();
    forceRender();
  }, [applyHeightRatio, applyMinHeight, applyMinWidth, forceRender]);

  useEffect(() => {
    const onWindowResize = (): void => {
      const container = containerRef.current;
      if (!container) return;
      if (contentWidth(container) <= 0 || contentHeight(container) <= 0) return;
      clearTimeout(resizeTimeoutRef.current);
      const time = typeof widget.resizeTimeout === 'number' ? widget.resizeTimeout : DEFAULT_RESIZE_TIMEOUT;
      resizeTimeoutRef.current = setTimeout(() => {
        applyMinWidth();
        applyMinHeight();
        applyHeightRatio();
        forceRender();
        events?.emit('widgetResized', { widthPixels: contentWidth(container), height: contentHeight(container) });
      }, time);
    };
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
      clearTimeout(resizeTimeoutRef.current);
    };
  }, [applyHeightRatio, applyMinHeight, applyMinWidth, events, forceRender, widget]);

  return { grabResizer, containerRef, widgetRef, headerRef, marqueeRef, marquee };
}
