import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardContext } from '../../lib/DashboardContext';
import { createDashboardEvents } from '../../lib/events';
import { Resizable } from './Resizable';

describe('Resizable', () => {
  it('renders nested dimensions and responds to widgetResized', () => {
    const events = createDashboardEvents();
    render(<DashboardContext.Provider value={{ options: {}, events, widgetRegistry: {}, dataModelRegistry: {}, dashboard: {} }}><Resizable widgetData={null} scope={{}} /></DashboardContext.Provider>);
    expect(screen.getByText('New width:')).toBeInTheDocument();
    expect(screen.getByText('New height:')).toBeInTheDocument();
    act(() => events.emit('widgetResized', { width: '55%', height: '300px' }));
    expect(screen.getByText('New width: 55%')).toBeInTheDocument();
    expect(screen.getByText('New height: 300px')).toBeInTheDocument();
  });
});
