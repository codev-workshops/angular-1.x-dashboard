import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
afterEach(cleanup);
import { AltDashboard } from './AltDashboard';
import type { DashboardOptions } from '../models/types';

describe('AltDashboard', () => {
  it('uses alternate widget markup and ng-hide semantics', async () => {
    const options: DashboardOptions = {
      widgetDefinitions: [{ name: 'one', directive: 'one', style: { width: '50%' }, containerStyle: { width: '10%' } }],
      defaultWidgets: [{ name: 'one' }],
      storage: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined },
      storageId: 'alt',
      explicitSave: true,
    };
    render(<AltDashboard options={options} registry={{}} />);
    await waitFor(() => expect(document.querySelector('.widget-container')).toBeInTheDocument());
    expect(document.querySelector('.btn-success')).toHaveTextContent('Alternative - No Changes');
    expect(document.querySelector('.btn-success')).toHaveStyle({ display: 'none' });
    expect(document.querySelector('.widget-container')).toHaveStyle({ width: '50%' });
    expect(document.querySelector('.widget-header .glyphicon-remove')).toBeInTheDocument();
    expect(document.querySelector('.widget-header .glyphicon-cog')).toBeInTheDocument();
    expect(document.querySelector('.widget-header .buttons')).not.toBeInTheDocument();
  });
});
