import _ from 'lodash';
import { WidgetDefinition, StorageInterface } from '../types';

export interface LayoutDefinition {
  title: string;
  id?: string | number;
  active?: boolean;
  locked?: boolean;
  editingTitle?: boolean;
  defaultWidgets?: Array<{ name: string; [key: string]: any }>;
  widgetDefinitions?: WidgetDefinition[];
  dashboard: DashboardConfig;
}

export interface DashboardConfig {
  storage?: StorageInterface;
  storageId?: string | number;
  widgetDefinitions?: WidgetDefinition[];
  stringifyStorage?: boolean;
  defaultWidgets?: Array<{ name: string; [key: string]: any }>;
  widgetButtons?: boolean;
  explicitSave?: boolean;
  settingsModalOptions?: Record<string, any>;
  onSettingsClose?: (result: any) => void;
  onSettingsDismiss?: (reason: any) => void;
  unsavedChangeCount?: number;
  saveDashboard?: (force?: boolean) => void;
  addWidget?: (...args: any[]) => void;
  [key: string]: any;
}

export interface LayoutStorageOptions {
  storageId: string;
  storage?: StorageInterface;
  storageHash?: string;
  stringifyStorage?: boolean;
  widgetDefinitions?: WidgetDefinition[];
  defaultLayouts?: Array<{ title: string; id?: string | number; active?: boolean; locked?: boolean; defaultWidgets?: any[] }>;
  lockDefaultLayouts?: boolean;
  widgetButtons?: boolean;
  explicitSave?: boolean;
  defaultWidgets?: Array<{ name: string; [key: string]: any }>;
  settingsModalOptions?: Record<string, any>;
  onSettingsClose?: (result: any) => void;
  onSettingsDismiss?: (reason: any) => void;
  unsavedChangeCount?: number;
  [key: string]: any;
}

const noopStorage: StorageInterface = {
  setItem: () => {},
  getItem: () => null,
  removeItem: () => {},
};

export class LayoutStorage implements StorageInterface {
  id: string;
  storage: StorageInterface;
  storageHash: string;
  stringifyStorage: boolean;
  widgetDefinitions: WidgetDefinition[];
  defaultLayouts: Array<{ title: string; [key: string]: any }>;
  lockDefaultLayouts: boolean;
  widgetButtons: boolean;
  explicitSave: boolean;
  defaultWidgets: Array<{ name: string; [key: string]: any }>;
  settingsModalOptions: Record<string, any>;
  onSettingsClose?: (result: any) => void;
  onSettingsDismiss?: (reason: any) => void;
  options: LayoutStorageOptions;
  layouts: LayoutDefinition[];
  states: Record<string | number, any>;

  constructor(options: LayoutStorageOptions) {
    const defaults: Partial<LayoutStorageOptions> = {
      storage: noopStorage,
      storageHash: '',
      stringifyStorage: true,
    };

    Object.assign(defaults, options);
    Object.assign(options, defaults);

    this.id = options.storageId;
    this.storage = options.storage || noopStorage;
    this.storageHash = options.storageHash || '';
    this.stringifyStorage = options.stringifyStorage !== false;
    this.widgetDefinitions = options.widgetDefinitions || [];
    this.defaultLayouts = options.defaultLayouts || [];
    this.lockDefaultLayouts = !!options.lockDefaultLayouts;
    this.widgetButtons = !!options.widgetButtons;
    this.explicitSave = !!options.explicitSave;
    this.defaultWidgets = options.defaultWidgets || [];
    this.settingsModalOptions = options.settingsModalOptions || {};
    this.onSettingsClose = options.onSettingsClose;
    this.onSettingsDismiss = options.onSettingsDismiss;
    this.options = options;
    this.options.unsavedChangeCount = 0;

    this.layouts = [];
    this.states = {};
    this.load();
    this._ensureActiveLayout();
  }

  add(layouts: any | any[]): void {
    if (!Array.isArray(layouts)) {
      layouts = [layouts];
    }
    layouts.forEach((layout: any) => {
      layout.dashboard = layout.dashboard || {};
      layout.dashboard.storage = this;
      layout.dashboard.storageId = layout.id = this._getLayoutId(layout);
      layout.dashboard.widgetDefinitions = layout.widgetDefinitions || this.widgetDefinitions;
      layout.dashboard.stringifyStorage = false;
      layout.dashboard.defaultWidgets = layout.defaultWidgets || this.defaultWidgets;
      layout.dashboard.widgetButtons = this.widgetButtons;
      layout.dashboard.explicitSave = this.explicitSave;
      layout.dashboard.settingsModalOptions = this.settingsModalOptions;
      layout.dashboard.onSettingsClose = this.onSettingsClose;
      layout.dashboard.onSettingsDismiss = this.onSettingsDismiss;
      this.layouts.push(layout);
    });
  }

  remove(layout: LayoutDefinition): void {
    const index = this.layouts.indexOf(layout);
    if (index >= 0) {
      this.layouts.splice(index, 1);
      delete this.states[layout.id!];

      if (layout.active && this.layouts.length) {
        const nextActive = index > 0 ? index - 1 : 0;
        this.layouts[nextActive].active = true;
      }
    }
  }

  save(): void {
    let state: any = {
      layouts: this._serializeLayouts(),
      states: this.states,
      storageHash: this.storageHash,
    };

    if (this.stringifyStorage) {
      state = JSON.stringify(state);
    }

    this.storage.setItem(this.id, state);
    this.options.unsavedChangeCount = 0;
  }

  load(): void {
    const serialized = this.storage.getItem(this.id);

    this.clear();

    if (serialized) {
      if (typeof serialized === 'object' && serialized !== null && 'then' in (serialized as any) && typeof (serialized as any).then === 'function') {
        this._handleAsyncLoad(serialized as any);
      } else {
        this._handleSyncLoad(serialized as string);
      }
    } else {
      this._addDefaultLayouts();
    }
  }

  clear(): void {
    this.layouts = [];
    this.states = {};
  }

  setItem(id: string | number, value: any): void {
    this.states[id] = value;
    this.save();
  }

  getItem(id: string | number): any {
    return this.states[id];
  }

  removeItem(id: string | number): void {
    delete this.states[id];
    this.save();
  }

  getActiveLayout(): LayoutDefinition | false {
    for (let i = 0; i < this.layouts.length; i++) {
      if (this.layouts[i].active) {
        return this.layouts[i];
      }
    }
    return false;
  }

  _addDefaultLayouts(): void {
    const defaults = this.lockDefaultLayouts ? { locked: true } : {};
    this.defaultLayouts.forEach((layout) => {
      this.add(Object.assign(_.clone(defaults), layout));
    });
  }

  _serializeLayouts(): Array<Record<string, any>> {
    return this.layouts.map((l) => ({
      title: l.title,
      id: l.id,
      active: l.active,
      locked: l.locked,
      defaultWidgets: l.dashboard.defaultWidgets,
    }));
  }

  _handleSyncLoad(serialized: string | Record<string, any>): void {
    let deserialized: any;

    if (this.stringifyStorage) {
      try {
        deserialized = JSON.parse(serialized as string);
      } catch {
        this._addDefaultLayouts();
        return;
      }
    } else {
      deserialized = serialized;
    }

    if (this.storageHash !== deserialized.storageHash) {
      this._addDefaultLayouts();
      return;
    }

    this.states = deserialized.states;
    this.add(deserialized.layouts);
  }

  _handleAsyncLoad(promise: Promise<any>): void {
    promise.then(
      (res: any) => this._handleSyncLoad(res),
      () => this._addDefaultLayouts()
    );
  }

  _ensureActiveLayout(): void {
    for (let i = 0; i < this.layouts.length; i++) {
      if (this.layouts[i].active) {
        return;
      }
    }
    if (this.layouts[0]) {
      this.layouts[0].active = true;
    }
  }

  _getLayoutId(layout: any): string | number {
    if (layout.id) {
      return layout.id;
    }
    let max = 0;
    for (let i = 0; i < this.layouts.length; i++) {
      const id = this.layouts[i].id;
      max = Math.max(max, Number(id));
    }
    return max + 1;
  }
}
