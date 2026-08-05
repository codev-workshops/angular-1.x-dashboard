import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardContext } from '../../lib/DashboardContext';
import { createDashboardEvents } from '../../lib/events';
import { WtFluid } from './WtFluid';

describe('WtFluid', () => {
  it('renders the template and responds to widgetResized', () => {
    const events = createDashboardEvents();
    render(<DashboardContext.Provider value={{ options: {}, events, widgetRegistry: {}, dataModelRegistry: {}, dashboard: {} }}><WtFluid widgetData={null} scope={{}} /></DashboardContext.Provider>);
    expect(document.querySelector('.demo-widget-fluid')).toBeInTheDocument();
    expect(screen.getByText('Widget takes 100% height (blue border).')).toBeInTheDocument();
    expect(screen.getByText('Resize the widget vertically to see that this text (red border) stays middle aligned.')).toBeInTheDocument();
    expect(screen.getByText('New width:')).toBeInTheDocument();
    act(() => events.emit('widgetResized', { width: '55%', height: '300px' }));
    expect(screen.getByText('New width: 55%')).toBeInTheDocument();
    expect(screen.getByText('New height: 300px')).toBeInTheDocument();
  });
});
