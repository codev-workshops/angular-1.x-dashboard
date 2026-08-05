import { useContext, useEffect, useMemo, useState, type CSSProperties } from 'react';
import classNames from 'classnames';
import type { DashboardOptions, DataModelRegistry, WidgetContentProps, WidgetRegistry } from '../models/types';
import { WidgetModel } from '../models/WidgetModel';
import { resolveWidgetContent } from '../registry';
import { DashboardContext } from '../DashboardContext';
import { useResizer } from '../useResizer';

type WidgetProps = {
  widget: WidgetModel;
  options: DashboardOptions;
  scope: Record<string, unknown>;
  registry: WidgetRegistry;
  dataModelRegistry?: DataModelRegistry;
  onRemove: (widget: WidgetModel) => void;
  onOpenSettings: (widget: WidgetModel) => void;
  onWidgetChanged: (widget: WidgetModel) => void;
  grabResizer?: (event: React.MouseEvent<HTMLDivElement>, region: string) => void;
};

function contentProps(widget: WidgetModel, scope: Record<string, unknown>, widgetData: unknown): WidgetContentProps {
  const attrs: Record<string, string> = widget.attrs ?? {};
  const resolved: Record<string, unknown> = Object.fromEntries(Object.entries(attrs).map(([name, value]) => [
    name,
    Object.prototype.hasOwnProperty.call(scope, value) ? scope[value] : value,
  ]));
  const dataAttrName = widget.dataAttrName;
  if (dataAttrName) {
    resolved[dataAttrName] = widgetData;
  }
  return { ...resolved, widgetData, scope };
}

export function Widget({
  widget,
  options,
  scope,
  registry,
  dataModelRegistry = {},
  onRemove,
  onOpenSettings,
  onWidgetChanged,
  grabResizer,
}: WidgetProps): JSX.Element {
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(widget.title);
  const [widgetData, setWidgetData] = useState<unknown>();
  const [contentDisplay, setContentDisplay] = useState<string>((widget.contentStyle.display as string | undefined) ?? '');
  const resolution = useMemo(() => resolveWidgetContent(widget, registry), [registry, widget]);
  const context = useContext(DashboardContext);
  const resizer = useResizer({ widget, events: context?.events, onWidgetChanged });
  const onGrabResizer = grabResizer ?? resizer.grabResizer;

  useEffect(() => {
    const dataModelType = widget.dataModelType;
    if (!dataModelType) return undefined;
    const Model = typeof dataModelType === 'string' ? dataModelRegistry[dataModelType] : dataModelType;
    if (!Model) return undefined;
    const model = new Model();
    model.setup(widget, { updateScope: setWidgetData });
    model.init();
    return () => model.destroy();
  }, [dataModelRegistry, widget]);

  const Component = resolution.Component;
  const props = contentProps(widget, scope, widgetData);
  const saveTitle = (event?: React.FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();
    widget.title = draftTitle;
    setEditingTitle(false);
    onWidgetChanged(widget);
  };
  const toggleContent = (): void => {
    const display = contentDisplay === 'none' ? 'block' : 'none';
    try {
      widget.contentStyle.display = display;
    } catch {
      // React development mode may freeze props; local state still mirrors the model.
    }
    setContentDisplay(display);
  };
  const handles: Array<{ group: string; regions: string[]; verticalOnly: boolean }> = [
    { group: 'widget-w-resizer', regions: ['nw', 'w', 'sw'], verticalOnly: false },
    { group: 'widget-e-resizer', regions: ['ne', 'e', 'se'], verticalOnly: false },
    { group: 'widget-n-resizer', regions: ['nw', 'n', 'ne'], verticalOnly: true },
    { group: 'widget-s-resizer', regions: ['sw', 's', 'se'], verticalOnly: true },
  ];

  return (
    <div className="widget-container" {...{ widget: '' }} style={{ ...(widget.containerStyle as CSSProperties) }} ref={resizer.containerRef}>
      <div className="widget panel panel-default" ref={resizer.widgetRef}>
        <div className="widget-header panel-heading" ref={resizer.headerRef}>
          <h3 className="panel-title">
            <span
              className="widget-title"
              onDoubleClick={() => { setDraftTitle(widget.title); setEditingTitle(true); }}
              style={{ display: editingTitle ? 'none' : undefined }}
            >{widget.title}</span>
            <form action="" className="widget-title" onSubmit={saveTitle} style={{ display: editingTitle ? undefined : 'none' }}>
              <input
                type="text"
                value={draftTitle}
                onChange={(event) => { widget.title = event.target.value; setDraftTitle(event.target.value); }}
                onBlur={() => saveTitle()}
                className="form-control"
                autoFocus={editingTitle}
              />
            </form>
            {!options.hideWidgetName && <span className="label label-primary">{widget.name}</span>}
          </h3>
          <div className="buttons">
            {!options.hideWidgetClose && <span onClick={() => onRemove(widget)} className="glyphicon glyphicon-remove" />}
            {!options.hideWidgetSettings && <span onClick={() => onOpenSettings(widget)} className="glyphicon glyphicon-cog" />}
            <span onClick={toggleContent} className={classNames('glyphicon', {
              'glyphicon-plus': contentDisplay === 'none',
              'glyphicon-minus': contentDisplay !== 'none',
            })} />
          </div>
        </div>
        <div className="panel-body widget-content" style={{ ...(widget.contentStyle as CSSProperties), display: contentDisplay }}>
          {Component && <Component {...props} />}
        </div>
        {handles.map(({ group, regions, verticalOnly }) => verticalOnly && !widget.enableVerticalResize ? null : (
          <div className={group} key={group}>
            {regions.filter((region) => widget.enableVerticalResize || (region === 'w' || region === 'e')).map((region) => (
              <div className={`${region}-resizer`} onMouseDown={(event) => onGrabResizer(event, region)} key={region} />
            ))}
          </div>
        ))}
        {resizer.marquee && (
          <div
            ref={resizer.marqueeRef}
            className={`widget-resizer-marquee ${resizer.marquee.region}`}
            style={{ height: `${resizer.marquee.height}px`, width: `${resizer.marquee.width}px`, top: '-1px', left: '-1px' }}
          />
        )}
      </div>
    </div>
  );
}
