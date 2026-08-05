import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DashboardLayouts } from './DashboardLayouts';
import type { DashboardLayoutsOptions } from '../useDashboardLayouts';
import type { WidgetContentProps, WidgetDefinition, WidgetRegistry } from '../models/types';

afterEach(cleanup);

const definitions: WidgetDefinition[] = [
  { name: 'one', directive: 'one' },
  { name: 'two', directive: 'two' },
];
const defaultWidgets: WidgetDefinition[] = [{ name: 'one', title: 'Widget 1' }];

function Content({ widgetData }: WidgetContentProps): JSX.Element {
  return <div className="content">{String(widgetData ?? '')}</div>;
}
const registry: WidgetRegistry = { one: Content, two: Content };

function makeOptions(overrides: Partial<DashboardLayoutsOptions> = {}): DashboardLayoutsOptions {
  return {
    widgetDefinitions: definitions,
    defaultWidgets,
    lockDefaultLayouts: true,
    defaultLayouts: [
      { title: 'Layout 1', active: true, defaultWidgets },
      { title: 'Layout 2', active: false, defaultWidgets },
      { title: 'Layout 3', active: false, defaultWidgets, locked: false },
    ],
    ...overrides,
  };
}

function tabs(): HTMLLIElement[] {
  return Array.from(document.querySelectorAll<HTMLLIElement>('.nav-tabs.layout-tabs > li'));
}

describe('DashboardLayouts', () => {
  it('renders the default tabs plus the add-layout tab', async () => {
    render(<DashboardLayouts options={makeOptions()} registry={registry} />);
    await waitFor(() => expect(document.querySelectorAll('[dashboard]')).toHaveLength(1));
    expect(tabs()).toHaveLength(4);
    expect(tabs()[0].querySelector('span')).toHaveTextContent('Layout 1');
    expect(tabs()[1].querySelector('span')).toHaveTextContent('Layout 2');
    expect(document.querySelectorAll('.nav-tabs.layout-tabs > li.active')).toHaveLength(1);
    expect(tabs()[3].querySelector('.glyphicon-plus')).toBeInTheDocument();
  });

  it('emits the frozen template attributes', () => {
    render(<DashboardLayouts options={makeOptions()} registry={registry} />);
    expect(document.querySelectorAll('span[ng-dblclick="editTitle(layout)"]')).toHaveLength(3);
    expect(document.querySelectorAll('.nav-tabs.layout-tabs input[data-layout]')).toHaveLength(3);
    expect(document.querySelector('.layout-tabs')).toHaveAttribute('ui-sortable', 'sortableOptions');
    expect(document.querySelector('[dashboard]')).toHaveAttribute('template-url', 'components/directives/dashboard/dashboard.html');
  });

  it('omits the remove icon for locked layouts only', () => {
    render(<DashboardLayouts options={makeOptions()} registry={registry} />);
    expect(tabs()[0].querySelector('.remove-layout-icon')).not.toBeInTheDocument();
    expect(tabs()[2].querySelector('.remove-layout-icon')).toBeInTheDocument();
  });

  it('switches the active layout and renders exactly one dashboard', async () => {
    render(<DashboardLayouts options={makeOptions()} registry={registry} />);
    await waitFor(() => expect(document.querySelectorAll('[dashboard]')).toHaveLength(1));
    fireEvent.click(tabs()[1].querySelector('a') as HTMLAnchorElement);
    expect(tabs()[1]).toHaveClass('active');
    expect(tabs()[0]).not.toHaveClass('active');
    expect(document.querySelectorAll('[dashboard]')).toHaveLength(1);
  });

  it('creates, renames and removes a layout', async () => {
    render(<DashboardLayouts options={makeOptions()} registry={registry} />);
    fireEvent.click(tabs()[3].querySelector('a') as HTMLAnchorElement);
    await waitFor(() => expect(tabs()).toHaveLength(5));
    const custom = document.querySelector('.nav-tabs.layout-tabs > li.active') as HTMLLIElement;
    expect(custom).toHaveTextContent('Custom');

    fireEvent.doubleClick(custom.querySelector('span[ng-dblclick="editTitle(layout)"]') as HTMLSpanElement);
    const inputs = document.querySelectorAll<HTMLInputElement>('.nav-tabs.layout-tabs input[data-layout]');
    const input = inputs[inputs.length - 1];
    fireEvent.change(input, { target: { value: 'Renamed Layout' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(custom.querySelector('span')).toHaveTextContent('Renamed Layout');

    fireEvent.click(custom.querySelector('.remove-layout-icon') as HTMLSpanElement);
    expect(document.querySelector('.nav-tabs.layout-tabs')).not.toHaveTextContent('Renamed Layout');
  });

  it('keeps per-layout widget state across a switch', async () => {
    render(<DashboardLayouts options={makeOptions()} registry={registry} />);
    await waitFor(() => expect(document.querySelectorAll('.widget-container')).toHaveLength(1));
    fireEvent.click(screen.getAllByText('two')[0]);
    await waitFor(() => expect(document.querySelectorAll('.widget-container')).toHaveLength(2));
    fireEvent.click(tabs()[1].querySelector('a') as HTMLAnchorElement);
    await waitFor(() => expect(document.querySelectorAll('.widget-container')).toHaveLength(1));
    fireEvent.click(tabs()[0].querySelector('a') as HTMLAnchorElement);
    await waitFor(() => expect(document.querySelectorAll('.widget-container')).toHaveLength(2));
  });

  it('counts unsaved changes on the active dashboard when explicitSave is on', async () => {
    const storage = new Map<string, unknown>();
    const options = makeOptions({
      explicitSave: true,
      storageId: 'layouts-explicit',
      storage: {
        getItem: (key: string) => storage.get(key),
        setItem: (key: string, value: unknown) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
    render(<DashboardLayouts options={options} registry={registry} />);
    await waitFor(() => expect(screen.getByText('all saved')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('two')[0]);
    await waitFor(() => expect(screen.getByText('save changes (1)')).toBeInTheDocument());
    fireEvent.click(screen.getByText('save changes (1)'));
    await waitFor(() => expect(screen.getByText('all saved')).toBeInTheDocument());
  });

  it('does not switch layouts until the save-changes modal resolves', async () => {
    const options = makeOptions({ explicitSave: true });
    render(<DashboardLayouts options={options} registry={registry} />);
    await waitFor(() => expect(document.querySelectorAll('.widget-container')).toHaveLength(1));
    fireEvent.click(screen.getAllByText('two')[0]);
    await waitFor(() => expect(screen.getByText('save changes (1)')).toBeInTheDocument());
    fireEvent.click(tabs()[1].querySelector('a') as HTMLAnchorElement);
    expect(tabs()[1]).not.toHaveClass('active');
    await waitFor(() => expect(tabs()[1]).toHaveClass('active'));
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
  });
});
