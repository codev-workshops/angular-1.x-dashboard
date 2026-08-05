import { cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
afterEach(cleanup);
import { AltDashboard } from './AltDashboard';
import type { DashboardOptions, StorageLike } from '../models/types';

describe('AltDashboard', () => {
  it('uses alternate widget markup and ng-hide semantics', async () => {
    const storage: StorageLike = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
    const options: DashboardOptions = {
      widgetDefinitions: [{ name: 'one', directive: 'one', style: { width: '50%' }, containerStyle: { width: '10%' } }],
      defaultWidgets: [{ name: 'one' }],
      storage,
      storageId: 'alt',
      explicitSave: true,
    };
    render(<AltDashboard options={options} registry={{}} />);
    const user = userEvent.setup();
    await waitFor(() => expect(document.querySelector('.widget-container')).toBeInTheDocument());
    expect(document.querySelector('.btn-success')).toHaveTextContent('Alternative - No Changes');
    expect(document.querySelector('.btn-success')).toHaveStyle({ display: 'none' });
    expect(document.querySelector('.widget-container')).toHaveStyle({ width: '50%' });
    expect(document.querySelector('.widget-header .glyphicon-remove')).toBeInTheDocument();
    expect(document.querySelector('.widget-header .glyphicon-cog')).toBeInTheDocument();
    expect(document.querySelector('.widget-header .buttons')).not.toBeInTheDocument();
    await user.click(document.querySelector('.btn-primary.dropdown-toggle') as HTMLButtonElement);
    expect(document.querySelector('.dropdown-menu span.label')).not.toBeInTheDocument();
    const clear = document.querySelector('.btn-info') as HTMLButtonElement;
    await user.click(clear);
    expect(clear).toHaveStyle({ display: 'none' });
    expect(clear).toBeInTheDocument();
    const defaultButton = document.querySelector('.btn-warning') as HTMLButtonElement;
    await user.click(defaultButton);
    await waitFor(() => expect(clear.style.display).toBe(''));
  });
});
