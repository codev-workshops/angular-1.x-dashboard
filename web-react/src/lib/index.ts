export { Widget } from './components/Widget';
export { Dashboard, DefaultDashboard, dashboardTemplates } from './components/Dashboard';
export type { DashboardProps, DashboardTemplateProps, DashboardTemplate } from './components/Dashboard';
export { AltDashboard } from './components/AltDashboard';
export { DashboardToolbar } from './components/DashboardToolbar';
export { DashboardLayouts } from './components/DashboardLayouts';
export { useDashboardLayouts } from './useDashboardLayouts';
export type {
  DashboardLayoutsProps,
} from './components/DashboardLayouts';
export type {
  DashboardLayoutsOptions,
  DashboardLayoutsApi,
} from './useDashboardLayouts';
export {
  useModal,
  ModalProvider,
  useWidgetSettings,
} from './useModal';
export { Modal } from './components/Modal';
export { WidgetSettingsModal } from './components/WidgetSettingsModal';
export { SaveChangesModal } from './components/SaveChangesModal';
export type {
  ModalResolve,
  ModalOpenOptions,
  ModalInstance,
  ModalContentProps,
  ModalRegistry,
  WidgetSettingsPartialRegistry,
} from './useModal';
export type { WidgetSettingsPartialProps } from './components/WidgetSettingsModal';
export { WidgetDataModel } from './models/WidgetDataModel';
export { WidgetModel } from './models/WidgetModel';
export { logger } from './logger';
export { resolveWidgetContent } from './registry';
export type * from './models/types';
