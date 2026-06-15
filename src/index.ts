// Components
export { Dashboard } from './components/Dashboard';
export type { DashboardProps } from './components/Dashboard/Dashboard';

export { Widget } from './components/Widget';
export type { WidgetProps } from './components/Widget/Widget';

export { DashboardLayouts } from './components/DashboardLayouts';
export type { DashboardLayoutsProps } from './components/DashboardLayouts/DashboardLayouts';

export { WidgetSettingsModal } from './components/WidgetSettingsModal';
export type { WidgetSettingsModalProps } from './components/WidgetSettingsModal';

export { SaveChangesModal } from './components/SaveChangesModal';
export type { SaveChangesModalProps } from './components/SaveChangesModal';

// Models
export { WidgetDataModel } from './models/WidgetDataModel';
export { WidgetDefCollection } from './models/WidgetDefCollection';
export { WidgetModel } from './models/WidgetModel';
export { DashboardState } from './models/DashboardState';
export { LayoutStorage } from './models/LayoutStorage';
export type { LayoutDefinition, LayoutStorageOptions } from './models/LayoutStorage';

// Hooks
export { useWidgetData } from './hooks/useWidgetData';
export { useResize } from './hooks/useResize';
export type { ResizeEvent } from './hooks/useResize';

// Types
export type {
  WidgetDefinition,
  WidgetDataModelBase,
  StorageInterface,
  DashboardOptions,
} from './types';
