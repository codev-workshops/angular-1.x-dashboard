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

export type DashboardOptions = {
  hideWidgetClose?: boolean;
  hideWidgetSettings?: boolean;
  hideWidgetName?: boolean;
  hideToolbar?: boolean;
  widgetButtons?: boolean;
  storage?: StorageLike;
  explicitSave?: boolean;
  unsavedChangeCount?: number;
  [key: string]: unknown;
};

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
