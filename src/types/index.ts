export interface WidgetDefinition {
  name: string;
  title?: string;
  attrs?: Record<string, any>;
  templateUrl?: string;
  template?: string;
  directive?: string;
  dataModelType?: (new () => WidgetDataModelBase) | string;
  dataModelOptions?: Record<string, any>;
  dataModelArgs?: Record<string, any>;
  dataAttrName?: string;
  storageHash?: string;
  settingsModalOptions?: Record<string, any>;
  size?: { width?: string; height?: string; minWidth?: string };
  style?: Record<string, string>;
  enableVerticalResize?: boolean;
  onSettingsClose?: (result: any) => void;
  onSettingsDismiss?: (reason: any) => void;
  serialize?: () => Record<string, any>;
  [key: string]: any; // arbitrary data allowed per README
}

export interface WidgetDataModelBase {
  dataAttrName?: string;
  dataModelOptions?: Record<string, any>;
  setup(widget: { dataAttrName?: string; dataModelOptions?: Record<string, any> }, scope: { widgetData?: any }): void;
  updateScope(data: any): void;
  init(): void;
  destroy(): void;
}

export interface StorageInterface {
  getItem(key: string): string | Promise<string> | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DashboardOptions {
  widgetDefinitions: WidgetDefinition[];
  defaultWidgets: Array<{ name: string; [key: string]: any }>;
  widgetButtons?: boolean;
  storage?: StorageInterface;
  storageId?: string;
  storageHash?: string;
  stringifyStorage?: boolean;
  explicitSave?: boolean;
  sortableOptions?: Record<string, any>;
  hideWidgetSettings?: boolean;
  hideWidgetClose?: boolean;
  settingsModalOptions?: Record<string, any>;
  onSettingsClose?: (result: any) => void;
  onSettingsDismiss?: (reason: any) => void;
}
