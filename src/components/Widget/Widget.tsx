import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WidgetModel } from '../../models/WidgetModel';
import { WidgetDataModel } from '../../models/WidgetDataModel';
import { useResize, ResizeEvent } from '../../hooks/useResize';

export interface WidgetProps {
  widget: WidgetModel;
  hideClose?: boolean;
  hideSettings?: boolean;
  hideWidgetName?: boolean;
  onRemove?: (widget: WidgetModel) => void;
  onSettingsOpen?: (widget: WidgetModel) => void;
  onChanged?: (widget: WidgetModel) => void;
  onResized?: (widget: WidgetModel, event: ResizeEvent) => void;
  dragListeners?: Record<string, any>;
  children?: React.ReactNode;
}

export const Widget: React.FC<WidgetProps> = ({
  widget,
  hideClose,
  hideSettings,
  hideWidgetName,
  onRemove,
  onSettingsOpen,
  onChanged,
  onResized,
  dragListeners,
  children,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(widget.title);
  const [contentVisible, setContentVisible] = useState(true);
  const [widgetData, setWidgetData] = useState<any>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const dataModelRef = useRef<WidgetDataModel | null>(null);
  const { grabResizer, widgetElRef } = useResize(widget, onResized, onChanged);

  // Initialize data model
  useEffect(() => {
    const dataModelType = widget.dataModelType;
    if (!dataModelType) return;

    let DataModelConstructor: new (...args: any[]) => WidgetDataModel;

    if (typeof dataModelType === 'function') {
      DataModelConstructor = dataModelType as new (...args: any[]) => WidgetDataModel;
    } else {
      throw new Error('widget dataModelType should be a constructor function');
    }

    let ds: WidgetDataModel;
    if (widget.dataModelArgs) {
      ds = new DataModelConstructor(widget.dataModelArgs);
    } else {
      ds = new DataModelConstructor();
    }

    widget.dataModel = ds;
    const scope = { widgetData: undefined };

    ds.updateScope = (data: any) => {
      setWidgetData(data);
    };

    ds.setup(widget, scope);
    ds.init();
    dataModelRef.current = ds;

    return () => {
      ds.destroy();
      dataModelRef.current = null;
    };
  }, [widget]);

  const handleEditTitle = useCallback(() => {
    setEditingTitle(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, 9999);
      }
    });
  }, []);

  const handleSaveTitle = useCallback(
    (e?: React.FormEvent | React.FocusEvent) => {
      if (e) e.preventDefault();
      setEditingTitle(false);
      widget.title = title;
      onChanged?.(widget);
    },
    [widget, title, onChanged]
  );

  const handleTitleLostFocus = useCallback(
    (e: React.FocusEvent) => {
      if (editingTitle) {
        handleSaveTitle(e);
      }
    },
    [editingTitle, handleSaveTitle]
  );

  return (
    <div ref={widgetElRef} style={widget.containerStyle} className="widget-container">
      <div className="widget panel panel-default">
        <div className="widget-header panel-heading" {...(dragListeners || {})}>
          <h3 className="panel-title">
            {!editingTitle ? (
              <span
                className="widget-title"
                onDoubleClick={handleEditTitle}
              >
                {title}
              </span>
            ) : (
              <form
                className="widget-title"
                onSubmit={handleSaveTitle}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleLostFocus}
                  className="form-control"
                />
              </form>
            )}
            {!hideWidgetName && (
              <span className="label label-primary">{widget.name}</span>
            )}
          </h3>
          <div className="buttons">
            {!hideClose && (
              <span
                className="glyphicon glyphicon-remove"
                onClick={() => onRemove?.(widget)}
              />
            )}
            {!hideSettings && (
              <span
                className="glyphicon glyphicon-cog"
                onClick={() => onSettingsOpen?.(widget)}
              />
            )}
            <span
              className={`glyphicon ${contentVisible ? 'glyphicon-minus' : 'glyphicon-plus'}`}
              onClick={() => setContentVisible(!contentVisible)}
            />
          </div>
        </div>
        <div
          className="panel-body widget-content"
          style={{
            ...widget.contentStyle,
            display: contentVisible ? 'block' : 'none',
          }}
          data-widget-data={widgetData}
        >
          {children}
        </div>
        <div className="widget-w-resizer">
          {widget.enableVerticalResize && (
            <div className="nw-resizer" onMouseDown={(e) => grabResizer(e, 'nw')} />
          )}
          <div className="w-resizer" onMouseDown={(e) => grabResizer(e, 'w')} />
          {widget.enableVerticalResize && (
            <div className="sw-resizer" onMouseDown={(e) => grabResizer(e, 'sw')} />
          )}
        </div>
        <div className="widget-e-resizer">
          {widget.enableVerticalResize && (
            <div className="ne-resizer" onMouseDown={(e) => grabResizer(e, 'ne')} />
          )}
          <div className="e-resizer" onMouseDown={(e) => grabResizer(e, 'e')} />
          {widget.enableVerticalResize && (
            <div className="se-resizer" onMouseDown={(e) => grabResizer(e, 'se')} />
          )}
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
};
