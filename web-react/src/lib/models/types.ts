import type { ComponentType } from 'react';

export type WidgetSize = {
  width?: string | number;
  height?: string | number;
  minWidth?: string;
  minHeight?: string;
  heightToWidthRatio?: number;
  contentOverflow?: string;
  [key: string]: unknown;
};

export type WidgetStyle = Record<string, string | number | undefined>;

export type WidgetOverrides = {
  [key: string]: unknown;
};

export type WidgetDefinition = {
  name?: string;
  title?: string;
  style?: WidgetStyle;
  size?: WidgetSize;
  enableVerticalResize?: boolean;
  containerStyle?: WidgetStyle;
  contentStyle?: WidgetStyle;
  templateUrl?: string;
  template?: string;
  directive?: string;
  attrs?: Record<string, string>;
  dataAttrName?: string;
  dataModelType?: string | WidgetDataModelCtor;
  dataModelOptions?: Record<string, unknown>;
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  storageHash?: string;
  [key: string]: unknown;
};

export type StorageLike = {
  getItem: (key: string) => unknown;
  setItem: (key: string, value: unknown) => unknown;
  removeItem: (key: string) => unknown;
};

export type WidgetDefinitionInput = WidgetDefinition | (new () => WidgetDefinition);

export type LayoutDefinition = {
  title?: string;
  id?: string | number;
  active?: boolean;
  locked?: boolean;
  defaultWidgets?: WidgetDefinition[];
  widgetDefinitions?: WidgetDefinitionInput[];
  dashboard?: Omit<DashboardOptions, 'storageId'> & { storageId?: string | number } & Record<string, unknown>;
};

export type LayoutStorageOptions = {
  storageId?: string | number;
  storage?: StorageLike;
  storageHash?: string;
  stringifyStorage?: boolean;
  widgetDefinitions?: WidgetDefinitionInput[];
  defaultLayouts?: LayoutDefinition[];
  lockDefaultLayouts?: boolean;
  widgetButtons?: boolean;
  explicitSave?: boolean;
  defaultWidgets?: WidgetDefinition[];
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  unsavedChangeCount?: number;
};

export type DashboardOptions = {
  hideWidgetClose?: boolean;
  hideWidgetSettings?: boolean;
  hideWidgetName?: boolean;
  hideToolbar?: boolean;
  widgetButtons?: boolean;
  storage?: StorageLike;
  explicitSave?: boolean;
  unsavedChangeCount?: number;
  storageId?: string;
  storageHash?: string;
  stringifyStorage?: boolean;
  defaultWidgets?: WidgetDefinition[];
  widgetDefinitions?: WidgetDefinitionInput[];
  defaultLayouts?: LayoutDefinition[];
  lockDefaultLayouts?: boolean;
  sortableOptions?: Record<string, unknown>;
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  saveDashboard?: (force?: boolean) => unknown;
  addWidget?: (spec: WidgetDefinition | string, doNotSave?: boolean) => WidgetModelLike;
  prependWidget?: (spec: WidgetDefinition | string, doNotSave?: boolean) => WidgetModelLike;
  removeWidget?: (widget: WidgetModelLike) => void;
  loadWidgets?: (widgets: WidgetDefinition[]) => void;
  clear?: (doNotSave?: boolean) => void;
  resetWidgetsToDefault?: () => unknown;
  openWidgetSettings?: (widget: WidgetModelLike) => void;
  onOpenWidgetSettings?: (widget: WidgetModelLike) => void;
  currentWidgets?: WidgetModelLike[];
  [key: string]: unknown;
};

export type WidgetModelLike = WidgetDefinition & { uid: string; serialize: () => Record<string, unknown> };

export type WidgetDataModelApi = {
  updateScope: (data: unknown) => void;
};

export type WidgetDataModelCtor = new () => WidgetDataModel;

export type WidgetDataModel = {
  setup: (widget: WidgetDefinition, api: WidgetDataModelApi) => void;
  init: () => void;
  destroy: () => void;
  updateScope: (data: unknown) => void;
  [key: string]: unknown;
};

export type WidgetContentProps = {
  widgetData: unknown;
  scope: Record<string, unknown>;
  [prop: string]: unknown;
};

export type WidgetRegistry = Record<string, ComponentType<WidgetContentProps>>;
export type DataModelRegistry = Record<string, WidgetDataModelCtor>;
