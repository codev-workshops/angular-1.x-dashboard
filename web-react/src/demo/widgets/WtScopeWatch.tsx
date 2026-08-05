import type { WidgetContentProps } from '../../lib/models/types';

export function WtScopeWatch({ value }: WidgetContentProps): JSX.Element {
  return <div>Value<div className="alert alert-info">{String(value ?? '')}</div></div>;
}
