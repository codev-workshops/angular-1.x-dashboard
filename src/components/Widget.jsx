import React, { useState, useEffect, useRef, useCallback } from 'react';
import { widgetRegistry } from '../widgets/registry';

export default function Widget({
  widget,
  onRemove,
  onSettingsOpen,
  onWidgetChanged,
  hideWidgetSettings,
  hideWidgetClose,
  hideWidgetName
}) {
  const [widgetData, setWidgetData] = useState(null);
  const [collapsed, setCollapsed] = useState(widget.contentStyle.display === 'none');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(widget.title);
  const [, forceUpdate] = useState(0);
  const widgetElRef = useRef(null);
  const containerRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    setTitle(widget.title);
  }, [widget.title]);

  useEffect(() => {
    if (widget.dataModelType) {
      const DataModelConstructor = widget.dataModelType;
      const ds = widget.dataModelArgs ? new DataModelConstructor(widget.dataModelArgs) : new DataModelConstructor();
      widget.dataModel = ds;
      ds.setup(widget, setWidgetData);
      ds.init();
      return () => ds.destroy();
    }
  }, [widget]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(0, 9999);
    }
  }, [editingTitle]);

  const handleEditTitle = useCallback(() => {
    setEditingTitle(true);
  }, []);

  const handleSaveTitleEdit = useCallback((e) => {
    if (e) e.preventDefault();
    setEditingTitle(false);
    widget.title = title;
    if (onWidgetChanged) onWidgetChanged(widget);
  }, [title, widget, onWidgetChanged]);

  const handleTitleBlur = useCallback(() => {
    if (editingTitle) {
      handleSaveTitleEdit();
    }
  }, [editingTitle, handleSaveTitleEdit]);

  const handleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      widget.contentStyle.display = next ? 'none' : 'block';
      return next;
    });
  }, [widget]);

  const grabResizer = useCallback((e, region) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    const widgetElm = widgetElRef.current;
    if (!widgetElm) return;

    const initX = e.clientX;
    const initY = e.clientY;
    const rect = widgetElm.getBoundingClientRect();
    const currentWidthPixel = rect.width;
    const currentHeightPixel = rect.height;
    const widthUnits = (widget.containerStyle.width || '0%').match(/%|px/)?.[0] || '%';
    const parentEl = containerRef.current?.parentElement;
    const parentWidth = parentEl ? parentEl.offsetWidth : window.innerWidth;
    const header = widgetElm.querySelector('.widget-header.panel-heading');
    const headerHeight = header ? header.offsetHeight : 0;
    const computedStyle = window.getComputedStyle(widgetElm);
    const marginRight = parseInt(computedStyle.marginRight || '0');

    let minWidth = 40;
    if (widget.size && widget.size.minWidth) {
      if (String(widget.size.minWidth).indexOf('%') > -1) {
        minWidth = parseInt(widget.size.minWidth) * parentWidth / 100 - marginRight;
      } else {
        minWidth = parseInt(widget.size.minWidth) - marginRight;
      }
    }
    const maxWidth = (widthUnits === '%' ? parentWidth - marginRight : Infinity);
    let minHeight = 40 + headerHeight;
    if (widget.size && widget.size.minHeight) {
      minHeight = parseInt(widget.size.minHeight) + headerHeight + 4;
    }

    const marquee = document.createElement('div');
    marquee.className = 'widget-resizer-marquee ' + region;
    marquee.style.height = currentHeightPixel + 'px';
    marquee.style.width = currentWidthPixel + 'px';
    marquee.style.top = '-1px';
    marquee.style.left = '-1px';
    widgetElm.appendChild(marquee);

    const calcHeight = (w, withMargins) => {
      if (widget.size && widget.size.heightToWidthRatio !== undefined) {
        return withMargins
          ? (w + marginRight) * widget.size.heightToWidthRatio + headerHeight + 4
          : w * widget.size.heightToWidthRatio;
      }
      return undefined;
    };

    const mousemove = (ev) => {
      let nw, nh, top, left;
      const dx = ev.clientX - initX;
      const dy = ev.clientY - initY;
      if (region.includes('e')) nw = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + dx));
      if (region.includes('w') && !region.includes('n') || region === 'w' || region === 'nw' || region === 'sw')
        nw = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel - dx));
      if (region.includes('s')) nh = Math.max(minHeight, currentHeightPixel + dy);
      if (region.includes('n') && !region.includes('e') || region === 'n' || region === 'nw' || region === 'ne')
        nh = Math.max(minHeight, currentHeightPixel - dy);

      if (nw !== undefined && calcHeight(nw, true) !== undefined) nh = calcHeight(nw, true);

      if (region.includes('w') && nw !== undefined) left = currentWidthPixel - nw - 2;
      if (region.includes('n') && nh !== undefined) top = currentHeightPixel - nh - 2;

      if (top !== undefined) marquee.style.top = top + 'px';
      if (left !== undefined) marquee.style.left = left + 'px';
      if (nw !== undefined) marquee.style.width = nw + 'px';
      if (nh !== undefined) marquee.style.height = nh + 'px';
    };

    const mouseup = () => {
      window.removeEventListener('mousemove', mousemove);
      window.removeEventListener('mouseup', mouseup);
      const mw = parseInt(marquee.offsetWidth) + 4;
      const mh = parseInt(marquee.offsetHeight) + 4;
      marquee.remove();

      const obj = {};
      if (mw !== Math.round(currentWidthPixel)) {
        const newWidthPixels = mw + marginRight;
        const nw = widthUnits === '%' ? newWidthPixels / parentWidth * 100 : newWidthPixels;
        obj.width = widget.setWidth(nw, widthUnits);
        obj.widthPixels = newWidthPixels;
      }
      if (mh !== Math.round(currentHeightPixel)) {
        const newH = mh - headerHeight - 2;
        obj.height = parseInt(widget.setHeight(newH));
      }

      if (onWidgetChanged) onWidgetChanged(widget);
      forceUpdate(n => n + 1);
      if (containerRef.current) {
        containerRef.current.dispatchEvent(new CustomEvent('widgetResized', { detail: obj, bubbles: true }));
      }
    };

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
  }, [widget, onWidgetChanged]);

  const ContentComponent = widgetRegistry[widget.directive] ||
    widgetRegistry[widget.templateUrl] ||
    widgetRegistry[widget.name] ||
    null;

  const contentStyle = { ...widget.contentStyle };
  if (collapsed) contentStyle.display = 'none';

  return (
    <div ref={containerRef} className="widget-container" style={widget.containerStyle}>
      <div ref={widgetElRef} className="widget panel panel-default">
        <div className="widget-header panel-heading">
          <h3 className="panel-title">
            {!editingTitle && (
              <span className="widget-title" onDoubleClick={handleEditTitle}>{title}</span>
            )}
            {editingTitle && (
              <form className="widget-title" onSubmit={handleSaveTitleEdit} style={{ display: 'inline' }}>
                <input
                  ref={titleInputRef}
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  style={{ width: 'auto', display: 'inline-block' }}
                />
              </form>
            )}
            {!hideWidgetName && <span className="label label-primary">{widget.name}</span>}
          </h3>
          <div className="buttons">
            {!hideWidgetClose && (
              <span className="glyphicon glyphicon-remove" onClick={() => onRemove(widget)} />
            )}
            {!hideWidgetSettings && (
              <span className="glyphicon glyphicon-cog" onClick={() => onSettingsOpen(widget)} />
            )}
            <span
              className={'glyphicon ' + (collapsed ? 'glyphicon-plus' : 'glyphicon-minus')}
              onClick={handleCollapse}
            />
          </div>
        </div>
        <div className="panel-body widget-content" style={contentStyle}>
          {ContentComponent && <ContentComponent widget={widget} widgetData={widgetData} />}
        </div>
        <div className="widget-w-resizer">
          {widget.enableVerticalResize && <div className="nw-resizer" onMouseDown={(e) => grabResizer(e, 'nw')} />}
          <div className="w-resizer" onMouseDown={(e) => grabResizer(e, 'w')} />
          {widget.enableVerticalResize && <div className="sw-resizer" onMouseDown={(e) => grabResizer(e, 'sw')} />}
        </div>
        <div className="widget-e-resizer">
          {widget.enableVerticalResize && <div className="ne-resizer" onMouseDown={(e) => grabResizer(e, 'ne')} />}
          <div className="e-resizer" onMouseDown={(e) => grabResizer(e, 'e')} />
          {widget.enableVerticalResize && <div className="se-resizer" onMouseDown={(e) => grabResizer(e, 'se')} />}
        </div>
        {widget.enableVerticalResize && (
          <div className="widget-n-resizer">
            <div className="nw-resizer" onMouseDown={(e) => grabResizer(e, 'nw')} />
            <div className="n-resizer" onMouseDown={(e) => grabResizer(e, 'n')} />
            <div className="ne-resizer" onMouseDown={(e) => grabResizer(e, 'ne')} />
          </div>
        )}
        {widget.enableVerticalResize && (
          <div className="widget-s-resizer">
            <div className="sw-resizer" onMouseDown={(e) => grabResizer(e, 'sw')} />
            <div className="s-resizer" onMouseDown={(e) => grabResizer(e, 's')} />
            <div className="se-resizer" onMouseDown={(e) => grabResizer(e, 'se')} />
          </div>
        )}
      </div>
    </div>
  );
}
