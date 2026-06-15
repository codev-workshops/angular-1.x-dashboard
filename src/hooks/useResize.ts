import React, { useCallback, useRef } from 'react';
import { WidgetModel } from '../models/WidgetModel';

type ResizeRegion = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

export interface ResizeEvent {
  width?: string;
  widthPixels?: number;
  height?: number;
}

export function useResize(
  widget: WidgetModel,
  onResized?: (widget: WidgetModel, event: ResizeEvent) => void,
  onChanged?: (widget: WidgetModel) => void
) {
  const widgetElRef = useRef<HTMLDivElement | null>(null);

  const grabResizer = useCallback(
    (e: React.MouseEvent, region: ResizeRegion) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();

      const widgetEl = widgetElRef.current;
      if (!widgetEl) return;

      const panelEl = widgetEl.querySelector('.widget') as HTMLElement;
      if (!panelEl) return;

      const initX = e.clientX;
      const initY = e.clientY;

      const currentWidthPixel = panelEl.offsetWidth;
      const currentHeightPixel = panelEl.offsetHeight;
      const widthUnits = (widget.containerStyle.width || '0%').match(/%|px/)?.[0] || '%';

      const parentEl = widgetEl.parentElement;
      const parentWidth = parentEl ? parentEl.offsetWidth : currentWidthPixel;

      const header = panelEl.querySelector('.widget-header.panel-heading') as HTMLElement;
      const headerHeight = header ? header.offsetHeight : 0;

      const computedStyle = window.getComputedStyle(panelEl);
      const marginRight = parseInt(computedStyle.marginRight || '0', 10);

      let minWidth: number;
      if (widget.size && widget.size.minWidth) {
        if (widget.size.minWidth.indexOf('%') > -1) {
          minWidth = (parseInt(widget.size.minWidth, 10) * parentWidth) / 100 - marginRight;
        } else {
          minWidth = parseInt(widget.size.minWidth, 10) - marginRight;
        }
      } else {
        minWidth = 40;
      }

      const maxWidth = widthUnits === '%' ? parentWidth - marginRight : Infinity;

      let minHeight: number;
      if (widget.size && widget.size.minHeight) {
        minHeight = parseInt(widget.size.minHeight, 10) + headerHeight + 4;
      } else {
        minHeight = 40 + headerHeight;
      }

      let maxHeight = Infinity;
      const heightToWidthRatioRaw = widget.size?.heightToWidthRatio;
      const hasRatio = heightToWidthRatioRaw !== undefined;
      const ratio = hasRatio ? Number(heightToWidthRatioRaw) : 0;
      if (hasRatio) {
        maxHeight = (maxWidth + marginRight) * ratio + headerHeight + 4;
      }

      const marquee = document.createElement('div');
      marquee.className = 'widget-resizer-marquee ' + region;
      marquee.style.height = currentHeightPixel + 'px';
      marquee.style.width = currentWidthPixel + 'px';
      marquee.style.top = '-1px';
      marquee.style.left = '-1px';
      marquee.style.position = 'absolute';
      marquee.style.border = '2px dashed #999';
      marquee.style.zIndex = '1000';
      marquee.style.pointerEvents = 'none';
      panelEl.style.position = 'relative';
      panelEl.appendChild(marquee);

      const calculateHeight = (width: number, includeMargins: boolean): number | undefined => {
        if (hasRatio) {
          if (includeMargins) {
            return (width + marginRight) * ratio + headerHeight + 4;
          }
          return width * ratio;
        }
        return undefined;
      };

      const calculateWidth = (height: number, includeMargins: boolean): number | undefined => {
        if (hasRatio) {
          if (includeMargins) {
            return (height - headerHeight - 4) / ratio - marginRight;
          }
          return height / ratio;
        }
        return undefined;
      };

      const mousemove = (ev: MouseEvent) => {
        let newWidth: number | undefined;
        let newHeight: number | undefined;
        let top: number | undefined;
        let left: number | undefined;

        switch (region) {
          case 'nw':
            newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + initX - ev.clientX));
            newHeight = calculateHeight(newWidth, true) ?? Math.max(minHeight, currentHeightPixel + initY - ev.clientY);
            left = currentWidthPixel - newWidth - 2;
            top = currentHeightPixel - newHeight - 2;
            break;
          case 'n':
            newHeight = Math.min(maxHeight, Math.max(minHeight, currentHeightPixel + initY - ev.clientY));
            newWidth = calculateWidth(newHeight, true);
            top = currentHeightPixel - newHeight - 2;
            break;
          case 'ne':
            newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + ev.clientX - initX));
            newHeight = calculateHeight(newWidth, true) ?? Math.max(minHeight, currentHeightPixel + initY - ev.clientY);
            top = currentHeightPixel - newHeight - 2;
            break;
          case 'e':
            newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + ev.clientX - initX));
            newHeight = calculateHeight(newWidth, true);
            break;
          case 'se':
            newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + ev.clientX - initX));
            newHeight = calculateHeight(newWidth, true) ?? Math.max(minHeight, currentHeightPixel + ev.clientY - initY);
            break;
          case 's':
            newHeight = Math.min(maxHeight, Math.max(minHeight, currentHeightPixel + ev.clientY - initY));
            newWidth = calculateWidth(newHeight, true);
            break;
          case 'sw':
            newWidth = Math.max(minWidth, currentWidthPixel + initX - ev.clientX);
            newHeight = calculateHeight(newWidth, true) ?? Math.max(minHeight, currentHeightPixel + ev.clientY - initY);
            left = currentWidthPixel - newWidth - 2;
            break;
          case 'w':
            newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + initX - ev.clientX));
            left = currentWidthPixel - newWidth - 2;
            newHeight = calculateHeight(newWidth, true);
            break;
        }

        if (top !== undefined) marquee.style.top = top + 'px';
        if (left !== undefined) marquee.style.left = left + 'px';
        if (newWidth !== undefined) marquee.style.width = newWidth + 'px';
        if (newHeight !== undefined) marquee.style.height = newHeight + 'px';
      };

      const mouseup = () => {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);

        const marqueeWidth = marquee.offsetWidth;
        const marqueeHeight = marquee.offsetHeight;
        marquee.remove();

        let newWidth: number | undefined;
        let newHeight: number | undefined;
        let newWidthPixels: number | undefined;

        if (marqueeWidth !== currentWidthPixel && ['nw', 'w', 'sw', 'ne', 'e', 'se'].indexOf(region) > -1) {
          newWidthPixels = marqueeWidth + marginRight;
          if (widthUnits === '%') {
            newWidth = ((marqueeWidth + marginRight) / parentWidth) * 100;
          } else {
            newWidth = newWidthPixels;
          }
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
            if (widthUnits === '%') {
              newWidth = ((marqueeWidth + marginRight) / parentWidth) * 100;
            } else {
              newWidth = newWidthPixels;
            }
          }
        }

        const resizeEvent: ResizeEvent = {};
        if (newWidth !== undefined) {
          resizeEvent.width = widget.setWidth(newWidth, widthUnits);
          resizeEvent.widthPixels = newWidthPixels;
        }
        if (newHeight !== undefined) {
          resizeEvent.height = parseInt(widget.setHeight(String(newHeight)), 10);
        }

        onChanged?.(widget);
        onResized?.(widget, resizeEvent);
      };

      window.addEventListener('mousemove', mousemove);
      window.addEventListener('mouseup', mouseup);
    },
    [widget, onResized, onChanged]
  );

  return { grabResizer, widgetElRef };
}
