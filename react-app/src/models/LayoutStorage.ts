export interface LayoutStorageOptions {
  storageId: string;
  storage?: StorageBackend;
  storageHash?: string;
  stringifyStorage?: boolean;
  widgetDefinitions?: unknown[];
  defaultLayouts?: LayoutDefinition[];
  lockDefaultLayouts?: boolean;
  widgetButtons?: boolean;
  explicitSave?: boolean;
  defaultWidgets?: unknown[];
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  unsavedChangeCount?: number;
  [key: string]: unknown;
}

export interface StorageBackend {
  setItem(key: string, value: unknown): void;
  getItem(key: string): unknown;
  removeItem(key: string): void;
}

export interface LayoutDefinition {
  title?: string;
  id?: string | number;
  active?: boolean;
  locked?: boolean;
  defaultWidgets?: unknown[];
  widgetDefinitions?: unknown[];
  dashboard?: DashboardConfig;
  [key: string]: unknown;
}

export interface DashboardConfig {
  storage?: LayoutStorage | StorageBackend;
  storageId?: string | number;
  widgetDefinitions?: unknown[];
  stringifyStorage?: boolean;
  defaultWidgets?: unknown[];
  widgetButtons?: boolean;
  explicitSave?: boolean;
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  [key: string]: unknown;
}

interface SerializedLayout {
  title?: string;
  id?: string | number;
  active?: boolean;
  locked?: boolean;
  defaultWidgets?: unknown[];
  [key: string]: unknown;
}

interface StoredState {
  layouts: LayoutDefinition[];
  states: Record<string, unknown>;
  storageHash?: string;
}

const noopStorage: StorageBackend = {
  setItem() {},
  getItem() {},
  removeItem() {},
};

export class LayoutStorage {
  id: string;
  storage: StorageBackend;
  storageHash: string;
  stringifyStorage: boolean;
  widgetDefinitions: unknown[];
  defaultLayouts: LayoutDefinition[];
  lockDefaultLayouts: boolean | undefined;
  widgetButtons: boolean | undefined;
  explicitSave: boolean | undefined;
  defaultWidgets: unknown[] | undefined;
  settingsModalOptions: Record<string, unknown> | undefined;
  onSettingsClose: ((...args: unknown[]) => void) | undefined;
  onSettingsDismiss: ((...args: unknown[]) => void) | undefined;
  options: LayoutStorageOptions;
  layouts: LayoutDefinition[];
  states: Record<string, unknown>;

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
    this.stringifyStorage = options.stringifyStorage !== undefined ? options.stringifyStorage : true;
    this.widgetDefinitions = options.widgetDefinitions || [];
    this.defaultLayouts = options.defaultLayouts || [];
    this.lockDefaultLayouts = options.lockDefaultLayouts;
    this.widgetButtons = options.widgetButtons;
    this.explicitSave = options.explicitSave;
    this.defaultWidgets = options.defaultWidgets;
    this.settingsModalOptions = options.settingsModalOptions;
    this.onSettingsClose = options.onSettingsClose;
    this.onSettingsDismiss = options.onSettingsDismiss;
    this.options = options;
    this.options.unsavedChangeCount = 0;

    this.layouts = [];
    this.states = {};
    this.load();
    this._ensureActiveLayout();
  }

  add(layouts: LayoutDefinition | LayoutDefinition[]): void {
    if (!Array.isArray(layouts)) {
      layouts = [layouts];
    }
    for (const layout of layouts) {
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
    }
  }

  remove(layout: LayoutDefinition): void {
    const index = this.layouts.indexOf(layout);
    if (index >= 0) {
      this.layouts.splice(index, 1);
      delete this.states[layout.id as string];

      if (layout.active && this.layouts.length) {
        const nextActive = index > 0 ? index - 1 : 0;
        this.layouts[nextActive].active = true;
      }
    }
  }

  save(): void {
    let state: StoredState | string = {
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
      if (typeof serialized === 'object' && serialized !== null && typeof (serialized as { then?: unknown }).then === 'function') {
        this._handleAsyncLoad(serialized as Promise<unknown>);
      } else {
        this._handleSyncLoad(serialized);
      }
    } else {
      this._addDefaultLayouts();
    }
  }

  clear(): void {
    this.layouts = [];
    this.states = {};
  }

  setItem(id: string, value: unknown): void {
    this.states[id] = value;
    this.save();
  }

  getItem(id: string): unknown {
    return this.states[id];
  }

  removeItem(id: string): void {
    delete this.states[id];
    this.save();
  }

  getActiveLayout(): LayoutDefinition | false {
    const len = this.layouts.length;
    for (let i = 0; i < len; i++) {
      const layout = this.layouts[i];
      if (layout.active) {
        return layout;
      }
    }
    return false;
  }

  _addDefaultLayouts(): void {
    const defaultProps = this.lockDefaultLayouts ? { locked: true } : {};
    for (const layout of this.defaultLayouts) {
      this.add(Object.assign({ ...defaultProps }, layout));
    }
  }

  _serializeLayouts(): SerializedLayout[] {
    const result: SerializedLayout[] = [];
    for (const l of this.layouts) {
      result.push({
        title: l.title,
        id: l.id,
        active: l.active,
        locked: l.locked,
        defaultWidgets: l.dashboard?.defaultWidgets,
      });
    }
    return result;
  }

  _handleSyncLoad(serialized: unknown): void {
    let deserialized: StoredState;

    if (this.stringifyStorage) {
      try {
        deserialized = JSON.parse(serialized as string);
      } catch {
        this._addDefaultLayouts();
        return;
      }
    } else {
      deserialized = serialized as StoredState;
    }

    if (this.storageHash !== deserialized.storageHash) {
      this._addDefaultLayouts();
      return;
    }
    this.states = deserialized.states;
    this.add(deserialized.layouts);
  }

  _handleAsyncLoad(promise: Promise<unknown>): void {
    promise.then(
      this._handleSyncLoad.bind(this),
      this._addDefaultLayouts.bind(this)
    );
  }

  _ensureActiveLayout(): void {
    for (let i = 0; i < this.layouts.length; i++) {
      const layout = this.layouts[i];
      if (layout.active) {
        return;
      }
    }
    if (this.layouts[0]) {
      this.layouts[0].active = true;
    }
  }

  _getLayoutId(layout: LayoutDefinition): string | number {
    if (layout.id) {
      return layout.id;
    }
    let max = 0;
    for (let i = 0; i < this.layouts.length; i++) {
      const id = this.layouts[i].id;
      max = Math.max(max, Number(id) * 1);
    }
    return max + 1;
  }
}
