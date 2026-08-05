import { cleanup, render, screen, waitFor } from '@testing-library/react';
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
});
