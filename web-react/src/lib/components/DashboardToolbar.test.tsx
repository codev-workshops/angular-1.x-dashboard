import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
afterEach(cleanup);
import { Dashboard } from './Dashboard';
import type { DashboardOptions, WidgetDefinition } from '../models/types';

const definitions: WidgetDefinition[] = [{ name: 'one' }, { name: 'two' }];
const options = (overrides: DashboardOptions = {}): DashboardOptions => ({
  widgetDefinitions: definitions,
  defaultWidgets: [{ name: 'one' }],
  ...overrides,
});

function renderDashboard(overrides: DashboardOptions = {}): void {
  render(<Dashboard options={options(overrides)} registry={{}} />);
}

describe('DashboardToolbar', () => {
  it('opens the dropdown and adds an item', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(document.querySelector('.widget-title')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Button dropdown/ }));
    expect(screen.getByRole('menu')).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'one' }));
    expect(screen.getAllByText('one').length).toBeGreaterThan(0);
  });

  it('supports clear, defaults, and hidden toolbar', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(document.querySelector('.widget-container')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(document.querySelectorAll('.widget-container')).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Default Widgets' }));
    expect(document.querySelectorAll('.widget-container')).toHaveLength(1);
    cleanup();
    renderDashboard({ hideToolbar: true });
    expect(screen.queryAllByRole('button', { name: 'Clear' })).toHaveLength(0);
  });

  it('renders explicit-save states', async () => {
    const user = userEvent.setup();
    const setItem = vi.fn();
    const storage = { getItem: () => null, setItem, removeItem: () => undefined };
    renderDashboard({ storage, storageId: 'test', explicitSave: true });
    await waitFor(() => expect(document.querySelector('.btn-success')).toBeInTheDocument());
    const save = document.querySelector('.btn-success') as HTMLButtonElement;
    expect(save).toHaveTextContent('all saved');
    expect(save).toBeDisabled();
    expect(setItem).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Button dropdown/ }));
    await user.click(screen.getByRole('link', { name: 'one' }));
    expect(document.querySelector('.btn-success')).toHaveTextContent('save changes (1)');
    expect(document.querySelector('.btn-success')).toBeEnabled();
    expect(setItem).not.toHaveBeenCalled();
    await user.click(document.querySelector('.btn-success') as HTMLButtonElement);
    expect(document.querySelector('.btn-success')).toHaveTextContent('all saved');
    expect(document.querySelector('.btn-success')).toBeDisabled();
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it('uses buttons instead of a dropdown when widgetButtons is enabled', async () => {
    const user = userEvent.setup();
    renderDashboard({ widgetButtons: true });
    await waitFor(() => expect(document.querySelector('.widget-container')).toBeInTheDocument());
    expect(document.querySelector('.dropdown')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Button dropdown/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'two' }));
    expect(document.querySelectorAll('.widget-container')).toHaveLength(2);
  });
});
