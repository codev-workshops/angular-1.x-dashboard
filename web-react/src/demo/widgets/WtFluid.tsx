import { useEffect, useState } from 'react';
import type { WidgetContentProps } from '../../lib/models/types';
import { useDashboardContext } from '../../lib/DashboardContext';

export function WtFluid(_props: WidgetContentProps): JSX.Element {
  void _props;
  const { events } = useDashboardContext();
  const [size, setSize] = useState<{ width?: string | number; height?: string | number }>({});
  useEffect(() => events.on('widgetResized', (value) => {
    if (!value || typeof value !== 'object') return;
    const next = value as { width?: string | number; height?: string | number };
    setSize((current) => ({ width: next.width || current.width, height: next.height || current.height }));
  }), [events]);
  return (
    <div className="demo-widget-fluid">
      <div>
        <p>Widget takes 100% height (blue border).</p>
        <p></p>
        <p>Resize the widget vertically to see that this text (red border) stays middle aligned.</p>
        <p>New width: {size.width ?? ''}</p>
        <p>New height: {size.height ?? ''}</p>
      </div>
    </div>
  );
}
