import { createContext, useContext } from 'react';
import type { DashboardOptions, DataModelRegistry, WidgetRegistry } from './models/types';
import type { DashboardEvents } from './events';

export type DashboardContextValue = {
  options: DashboardOptions;
  events: DashboardEvents;
  widgetRegistry: WidgetRegistry;
  dataModelRegistry: DataModelRegistry;
  dashboard: Record<string, unknown>;
};

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardContext(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboardContext must be used within a Dashboard provider');
  return context;
}
