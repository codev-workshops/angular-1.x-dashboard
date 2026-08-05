import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from '../../lib/components/Dashboard';
import { useDashboardContext } from '../../lib/DashboardContext';
import type { DashboardOptions, WidgetContentProps, WidgetDefinition, WidgetModelLike, WidgetRegistry } from '../../lib/models/types';
import { dataModelRegistry, widgetRegistry } from '../registry';
import { Resizable } from '../widgets/Resizable';

const widgetDefinitions: WidgetDefinition[] = [
  { name: 'random', directive: 'wt-scope-watch', attrs: { value: 'randomValue' } },
  { name: 'time', directive: 'wt-time' },
  { name: 'datamodel', directive: 'wt-scope-watch', dataAttrName: 'value', dataModelType: 'RandomDataModel' },
  { name: 'resizable', templateUrl: 'app/template/resizable.html', attrs: { class: 'demo-widget-resizable' } },
  { name: 'fluid', directive: 'wt-fluid', size: { width: '50%', height: '250px' } },
];

const defaultWidgets: WidgetDefinition[] = [
  { name: 'fluid', resizeTimeout: 0 },
  { name: 'resizable', resizeTimeout: 0 },
  { name: 'random', style: { width: '50%' }, resizeTimeout: 0 },
  { name: 'time', style: { width: '50%' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 50%, minWidth: 40%)', size: { width: '50%', minWidth: '40%' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 50%, minWidth: 900px)', size: { width: '50%', minWidth: '900px' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 500px, minWidth: 70%)', size: { width: '500px', minWidth: '70%' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (width: 500px, minWidth: 400px, minHeight: 100px)', size: { width: '200px', height: '50px', minWidth: '400px', minHeight: '100px' }, resizeTimeout: 0 },
  { name: 'resizable', title: 'resizable (height = 25% of width)', size: { width: '50%', height: '50px', minWidth: '400px', minHeight: '100px', heightToWidthRatio: 0.25 }, resizeTimeout: 0 },
];

function ReportingResizable(props: WidgetContentProps): JSX.Element {
  const { events } = useDashboardContext();
  const report = props.scope.reportResized;
  useEffect(() => events.on('widgetResized', (payload) => {
    if (typeof report === 'function') (report as (value: unknown) => void)(payload);
  }), [events, report]);
  return <Resizable {...props} />;
}

const registry: WidgetRegistry = { ...widgetRegistry, 'app/template/resizable.html': ReportingResizable };

export function ResizeHarness(): JSX.Element {
  const [lastResized, setLastResized] = useState<unknown>(null);
  const [randomValue, setRandomValue] = useState(() => Math.random());
  const [, setTick] = useState(0);
  const scope = useMemo(() => ({ randomValue, reportResized: setLastResized }), [randomValue]);
  const options = useMemo<DashboardOptions>(() => ({
    widgetButtons: true,
    widgetDefinitions,
    defaultWidgets,
    storage: window.localStorage as DashboardOptions['storage'],
    storageId: 'demo_resize',
  }), []);

  useEffect(() => {
    const id = setInterval(() => setRandomValue(Math.random()), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setTick((value) => value + 1);
    const id = setInterval(() => setTick((value) => value + 1), 250);
    return () => clearInterval(id);
  }, []);

  const current: WidgetModelLike[] = options.currentWidgets ?? [];

  return (
    <main>
      <h2>Resize harness</h2>
      <Dashboard options={options} scope={scope} registry={registry} dataModelRegistry={dataModelRegistry} />
      <section id="resize-readout">
        <div id="last-widget-resized">last widgetResized: {JSON.stringify(lastResized)}</div>
        <table className="table">
          <thead><tr><th>#</th><th>title</th><th>style</th><th>containerStyle</th><th>contentStyle</th><th>size</th></tr></thead>
          <tbody>
            {current.map((widget, index) => (
              <tr key={widget.uid}>
                <td>{index}</td>
                <td>{widget.title}</td>
                <td>{JSON.stringify(widget.style)}</td>
                <td>{JSON.stringify(widget.containerStyle)}</td>
                <td>{JSON.stringify(widget.contentStyle)}</td>
                <td>{JSON.stringify(widget.size)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
