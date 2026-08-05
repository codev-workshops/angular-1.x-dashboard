import { useEffect, useState } from 'react';
import type { WidgetContentProps } from '../../lib/models/types';
import { useDashboardContext } from '../../lib/DashboardContext';

export function Resizable(_props: WidgetContentProps): JSX.Element {
  void _props;
  const { events } = useDashboardContext();
  const [size, setSize] = useState<{ width?: string | number; height?: string | number }>({});
  useEffect(() => events.on('widgetResized', (value) => {
    if (!value || typeof value !== 'object') return;
    const next = value as { width?: string | number; height?: string | number };
    setSize((current) => ({ width: next.width || current.width, height: next.height || current.height }));
  }), [events]);
  return <div><div><div>New width: {size.width ?? ''}</div><div>New height: {size.height ?? ''}</div></div></div>;
}
