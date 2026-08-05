import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { DashboardApi } from '../useDashboard';
import { useDashboardContext } from '../DashboardContext';
import type { DashboardOptions, WidgetDefinition } from '../models/types';

export type DashboardToolbarVariant = 'default' | 'alt';

type DashboardToolbarProps = {
  options: DashboardOptions;
  variant?: DashboardToolbarVariant;
};

function definitionsFromDashboard(dashboard: DashboardApi): WidgetDefinition[] {
  return dashboard.widgetDefs.map((definition) => definition);
}

export function DashboardToolbar({ options, variant = 'default' }: DashboardToolbarProps): JSX.Element {
  const { dashboard: dashboardRecord } = useDashboardContext();
  const dashboard = dashboardRecord as DashboardApi;
  const definitions = definitionsFromDashboard(dashboard);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLSpanElement>(null);
  const widgets = dashboard.widgets;
  const unsaved = options.unsavedChangeCount ?? 0;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event: globalThis.MouseEvent): void => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const addWidgetInternal = (event: MouseEvent<HTMLAnchorElement>, definition: WidgetDefinition): void => {
    event.preventDefault();
    dashboard.addWidget(definition);
    setOpen(false);
  };

  return (
    <>
      {!options.widgetButtons && (
        <div className="btn-group">
          <span className={`dropdown${open ? ' open' : ''}`} ref={dropdownRef}>
            <button
              type="button"
              className="btn btn-primary dropdown-toggle"
              {...(variant === 'default' ? { 'data-toggle': 'dropdown' } : {})}
              disabled={variant === 'alt' ? false : undefined}
              onClick={() => setOpen((current) => !current)}
            >
              Button dropdown <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" role="menu">
              {definitions.map((definition, index) => (
                <li key={`${definition.name ?? 'widget'}-${index}`}>
                  <a href="#" onClick={(event) => addWidgetInternal(event, definition)} className="dropdown-toggle">
                    {variant === 'default' ? <span className="label label-primary">{definition.name}</span> : definition.name}
                  </a>
                </li>
              ))}
            </ul>
          </span>
        </div>
      )}
      {options.widgetButtons && (
        <div className="btn-group">
          {definitions.map((definition, index) => (
            <button key={`${definition.name ?? 'widget'}-${index}`} onClick={() => dashboard.addWidget(definition)} type="button" className="btn btn-primary">
              {definition.name}
            </button>
          ))}
        </div>
      )}
      <button className="btn btn-warning" onClick={() => dashboard.resetWidgetsToDefault()}>Default Widgets</button>
      {options.storage && options.explicitSave && variant === 'default' && (
        <button
          onClick={() => options.saveDashboard?.()}
          className="btn btn-success"
          disabled={!unsaved}
        >{unsaved ? `save changes (${unsaved})` : 'all saved'}</button>
      )}
      {options.storage && options.explicitSave && variant === 'alt' && (
        <button
          onClick={() => options.saveDashboard?.()}
          className="btn btn-success"
          {...(unsaved ? {} : { style: { display: 'none' } })}
        >{unsaved ? 'Save' : 'Alternative - No Changes'}</button>
      )}
      <button
        onClick={() => dashboard.clear()}
        {...(variant === 'alt' && widgets.length === 0 ? { style: { display: 'none' } } : {})}
        type="button"
        className="btn btn-info"
      >Clear</button>
    </>
  );
}
