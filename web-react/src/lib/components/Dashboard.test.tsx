import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
afterEach(cleanup);
import { Dashboard } from './Dashboard';
import type { DashboardOptions, WidgetDefinition } from '../models/types';

const definitions: WidgetDefinition[] = [{ name: 'one', directive: 'one' }];
const options: DashboardOptions = { widgetDefinitions: definitions, defaultWidgets: [{ name: 'one' }] };

describe('Dashboard', () => {
  it('renders default widgets and dispatches templates', async () => {
    const { rerender } = render(<Dashboard options={options} registry={{}} />);
    await waitFor(() => expect(screen.getByText('Widget 1')).toBeInTheDocument());
    expect(document.querySelectorAll('.widget-container')).toHaveLength(1);
    rerender(<Dashboard options={options} registry={{}} templateUrl="components/directives/dashboard/altDashboard.html" />);
    expect(document.querySelector('.widget-header .label-primary')).toHaveTextContent('one');
  });

  it('removes optional toolbar and widget controls', async () => {
    const hidden: DashboardOptions = {
      ...options,
      hideToolbar: true,
      hideWidgetClose: true,
      hideWidgetSettings: true,
      hideWidgetName: true,
    };
    render(<Dashboard options={hidden} registry={{}} />);
    await waitFor(() => expect(screen.getByText('Widget 1')).toBeInTheDocument());
    expect(document.querySelector('.btn-toolbar')).not.toBeInTheDocument();
    expect(document.querySelector('.glyphicon-remove')).not.toBeInTheDocument();
    expect(document.querySelector('.glyphicon-cog')).not.toBeInTheDocument();
    expect(document.querySelector('.label-primary')).not.toBeInTheDocument();
  });

  it('reorders existing widget instances and persists the order', async () => {
    const storage = {
      getItem: () => null,
      removeItem: () => undefined,
      setItem: (_key: string, value: unknown) => { storage.value = value; },
      value: undefined as unknown,
    };
    const reorderOptions: DashboardOptions = {
      widgetDefinitions: [
        { name: 'one', directive: 'one' },
        { name: 'two', directive: 'two' },
      ],
      defaultWidgets: [{ name: 'one', title: 'First' }, { name: 'two', title: 'Second' }],
      storage,
      storageId: 'dashboard-sortable-test',
      storageHash: '',
    };
    const { container } = render(<Dashboard options={reorderOptions} registry={{}} />);
    await waitFor(() => expect(screen.getByText('First')).toBeInTheDocument());
    const area = container.querySelector('.dashboard-widget-area') as HTMLElement;
    const original = Array.from(area.querySelectorAll<HTMLElement>('.widget-container'));
    original.forEach((item, index) => {
      item.getBoundingClientRect = () => ({
        x: 0, y: index * 100, top: index * 100, left: 0, right: 100, bottom: index * 100 + 80,
        width: 100, height: 80, toJSON: () => ({}),
      });
    });
    fireEvent.mouseDown(original[0].querySelector('.widget-header') as HTMLElement, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 20 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 180 });
    fireEvent.mouseUp(window);
    await waitFor(() => expect(Array.from(area.querySelectorAll('.widget-container'))).toEqual([original[1], original[0]]));
    expect(JSON.parse(String(storage.value)).widgets.map((widget: { title: string }) => widget.title)).toEqual(['Second', 'First']);
  });
});
