import { useState } from 'react';
import { Widget } from '../../lib/components/Widget';
import { dataModelRegistry, widgetRegistry } from '../registry';
import { WidgetModel } from '../../lib/models/WidgetModel';

export function ReferenceHarness(): JSX.Element {
  const scope = { watched: 'reference scope value' };
  const initialWidgets = [
    new WidgetModel({ name: 'wt-time', directive: 'wt-time', title: 'Widget 1' }),
    new WidgetModel({ name: 'wt-scope-watch', directive: 'wt-scope-watch', title: 'Widget 2', attrs: { value: 'watched' } }),
    new WidgetModel({
      name: 'datamodel',
      directive: 'wt-scope-watch',
      title: 'Widget 3',
      dataModelType: 'RandomDataModel',
      dataAttrName: 'value',
    }),
  ];
  const [widgets, setWidgets] = useState(initialWidgets);
  return (
    <div className="dashboard-widget-area">
      {widgets.map((widget) => (
        <Widget
          key={widget.uid}
          widget={widget}
          options={{}}
          scope={scope}
          registry={widgetRegistry}
          dataModelRegistry={dataModelRegistry}
          onRemove={(removed) => setWidgets((current) => current.filter((candidate) => candidate !== removed))}
          onOpenSettings={() => undefined}
          onWidgetChanged={() => undefined}
        />
      ))}
    </div>
  );
}
