import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dashboard } from './Dashboard';
import { DashboardOptions } from '../../types';

describe('Dashboard component', () => {
  const widgetDefs = [
    { name: 'widget-a', title: 'Widget A' },
    { name: 'widget-b', title: 'Widget B' },
  ];

  function makeOptions(overrides?: Partial<DashboardOptions>): DashboardOptions {
    return {
      widgetDefinitions: widgetDefs,
      defaultWidgets: [{ name: 'widget-a' }],
      ...overrides,
    };
  }

  it('should render the toolbar by default', () => {
    const { container } = render(<Dashboard options={makeOptions()} />);
    expect(container.querySelector('.btn-toolbar')).toBeInTheDocument();
  });

  it('should hide the toolbar when hideToolbar is true', () => {
    const { container } = render(<Dashboard options={makeOptions({ hideToolbar: true })} />);
    expect(container.querySelector('.btn-toolbar')).not.toBeInTheDocument();
  });

  it('should render default widgets on mount', () => {
    render(<Dashboard options={makeOptions()} />);
    expect(screen.getByText('Widget A')).toBeInTheDocument();
  });

  it('should render widget buttons when widgetButtons is true', () => {
    const { container } = render(<Dashboard options={makeOptions({ widgetButtons: true })} />);
    const buttons = container.querySelectorAll('.btn-group .btn-primary');
    const buttonTexts = Array.from(buttons).map((b) => b.textContent);
    expect(buttonTexts).toContain('widget-a');
    expect(buttonTexts).toContain('widget-b');
  });

  it('should render dropdown when widgetButtons is false', () => {
    const { container } = render(<Dashboard options={makeOptions()} />);
    expect(container.querySelector('.dropdown')).toBeInTheDocument();
  });

  it('should add widget when button is clicked in widgetButtons mode', () => {
    const options = makeOptions({ widgetButtons: true, defaultWidgets: [] });
    render(<Dashboard options={options} />);
    // Find the widget-a button and click it
    const buttons = screen.getAllByText('widget-a');
    fireEvent.click(buttons[0]);
    expect(screen.getByText('Widget A')).toBeInTheDocument();
  });

  it('should expose addWidget on options', () => {
    const options = makeOptions();
    render(<Dashboard options={options} />);
    expect(typeof (options as any).addWidget).toEqual('function');
  });

  it('should expose saveDashboard on options', () => {
    const options = makeOptions();
    render(<Dashboard options={options} />);
    expect(typeof (options as any).saveDashboard).toEqual('function');
  });

  it('should expose clear on options', () => {
    const options = makeOptions();
    render(<Dashboard options={options} />);
    expect(typeof (options as any).clear).toEqual('function');
  });

  it('should expose removeWidget on options', () => {
    const options = makeOptions();
    render(<Dashboard options={options} />);
    expect(typeof (options as any).removeWidget).toEqual('function');
  });

  it('should expose openWidgetSettings on options', () => {
    const options = makeOptions();
    render(<Dashboard options={options} />);
    expect(typeof (options as any).openWidgetSettings).toEqual('function');
  });

  it('should render Default Widgets button', () => {
    render(<Dashboard options={makeOptions()} />);
    expect(screen.getByText('Default Widgets')).toBeInTheDocument();
  });

  it('should render Clear button', () => {
    render(<Dashboard options={makeOptions()} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should clear all widgets when Clear is clicked', () => {
    render(<Dashboard options={makeOptions()} />);
    expect(screen.getByText('Widget A')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear'));
    expect(screen.queryByText('Widget A')).not.toBeInTheDocument();
  });

  it('should render dashboard-widget-area container', () => {
    const { container } = render(<Dashboard options={makeOptions()} />);
    expect(container.querySelector('.dashboard-widget-area')).toBeInTheDocument();
  });

  describe('settings modal', () => {
    it('should not render settings modal by default', () => {
      render(<Dashboard options={makeOptions()} />);
      expect(screen.queryByText('Widget Options')).not.toBeInTheDocument();
    });

    it('should open settings modal when cog icon is clicked', () => {
      const { container } = render(<Dashboard options={makeOptions()} />);
      const cogBtn = container.querySelector('.glyphicon-cog');
      if (cogBtn) {
        fireEvent.click(cogBtn);
        expect(screen.getByText('Widget Options')).toBeInTheDocument();
      }
    });
  });

  describe('explicit save mode', () => {
    it('should show save button when explicitSave and storage are set', () => {
      const storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };
      render(<Dashboard options={makeOptions({ explicitSave: true, storage })} />);
      expect(screen.getByText('all saved')).toBeInTheDocument();
    });
  });
});
