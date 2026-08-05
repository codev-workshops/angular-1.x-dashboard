import { clone } from 'lodash-es';
import type { LayoutDefinition, LayoutStorageOptions, StorageLike, WidgetDefinitionInput } from './types';

const noopStorage: StorageLike = { setItem: () => undefined, getItem: () => undefined, removeItem: () => undefined };

export class LayoutStorage implements StorageLike {
  id?: string | number;
  storage: StorageLike;
  storageHash: string;
  stringifyStorage: boolean;
  widgetDefinitions?: WidgetDefinitionInput[];
  defaultLayouts: LayoutDefinition[];
  lockDefaultLayouts?: boolean;
  widgetButtons?: boolean;
  explicitSave?: boolean;
  defaultWidgets?: LayoutDefinition['defaultWidgets'];
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  readonly options: LayoutStorageOptions;
  layouts: LayoutDefinition[] = [];
  states: Record<string, unknown> = {};

  constructor(options: LayoutStorageOptions) {
    const defaults = { storage: noopStorage, storageHash: '', stringifyStorage: true };
    Object.assign(defaults, options);
    Object.assign(options, defaults);
    this.id = options.storageId;
    this.storage = options.storage ?? noopStorage;
    this.storageHash = options.storageHash ?? '';
    this.stringifyStorage = options.stringifyStorage ?? true;
    this.widgetDefinitions = options.widgetDefinitions;
    this.defaultLayouts = options.defaultLayouts ?? [];
    this.lockDefaultLayouts = options.lockDefaultLayouts;
    this.widgetButtons = options.widgetButtons;
    this.explicitSave = options.explicitSave;
    this.defaultWidgets = options.defaultWidgets;
    this.settingsModalOptions = options.settingsModalOptions;
    this.onSettingsClose = options.onSettingsClose;
    this.onSettingsDismiss = options.onSettingsDismiss;
    this.options = options;
    options.unsavedChangeCount = 0;
    this.load();
    this._ensureActiveLayout();
  }

  add(input: LayoutDefinition | LayoutDefinition[]): void {
    const layouts = Array.isArray(input) ? input : [input];
    layouts.forEach((layout) => {
      layout.dashboard = layout.dashboard ?? {};
      layout.dashboard.storage = this;
      layout.dashboard.storageId = layout.id = this._getLayoutId(layout);
      layout.dashboard.widgetDefinitions = layout.widgetDefinitions ?? this.widgetDefinitions;
      layout.dashboard.stringifyStorage = false;
      layout.dashboard.defaultWidgets = layout.defaultWidgets ?? this.defaultWidgets;
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
    if (index < 0) return;
    this.layouts.splice(index, 1);
    delete this.states[String(layout.id)];
    if (layout.active && this.layouts.length) this.layouts[index > 0 ? index - 1 : 0].active = true;
  }

  save(): void {
    const value = { layouts: this._serializeLayouts(), states: this.states, storageHash: this.storageHash };
    this.storage.setItem(this.id as string, this.stringifyStorage ? JSON.stringify(value) : value);
    this.options.unsavedChangeCount = 0;
  }

  load(): void {
    const serialized = this.storage.getItem(this.id as string);
    this.clear();
    if (serialized) {
      if (typeof serialized === 'object' && serialized !== null && 'then' in serialized && typeof serialized.then === 'function') {
        this._handleAsyncLoad(serialized as Promise<unknown>);
      } else this._handleSyncLoad(serialized);
    } else this._addDefaultLayouts();
  }

  clear(): void { this.layouts = []; this.states = {}; }
  setItem(id: string, value: unknown): unknown { this.states[id] = value; this.save(); return undefined; }
  getItem(id: string): unknown { return this.states[id]; }
  removeItem(id: string): unknown { delete this.states[id]; this.save(); return undefined; }
  getActiveLayout(): LayoutDefinition | false { return this.layouts.find((layout) => layout.active) ?? false; }

  _addDefaultLayouts(): void {
    const defaults = this.lockDefaultLayouts ? { locked: true } : {};
    this.defaultLayouts.forEach((layout) => this.add(Object.assign(clone(defaults), layout)));
  }
  _serializeLayouts(): Array<Record<string, unknown>> {
    return this.layouts.map((layout) => ({ title: layout.title, id: layout.id, active: layout.active, locked: layout.locked, defaultWidgets: layout.dashboard?.defaultWidgets }));
  }
  _handleSyncLoad(serialized: unknown): void {
    let value: { storageHash?: string; layouts: LayoutDefinition[]; states: Record<string, unknown> };
    if (this.stringifyStorage) {
      try { value = JSON.parse(String(serialized)) as typeof value; } catch { this._addDefaultLayouts(); return; }
    } else value = serialized as typeof value;
    if (this.storageHash !== value.storageHash) { this._addDefaultLayouts(); return; }
    this.states = value.states;
    this.add(value.layouts);
  }
  _handleAsyncLoad(promise: Promise<unknown>): void {
    promise.then((value) => this._handleSyncLoad(value), () => this._addDefaultLayouts());
  }
  _ensureActiveLayout(): void { if (!this.layouts.some((layout) => layout.active) && this.layouts[0]) this.layouts[0].active = true; }
  _getLayoutId(layout: LayoutDefinition): string | number {
    if (layout.id) return layout.id;
    let max = 0;
    this.layouts.forEach((entry) => { max = Math.max(max, Number(entry.id)); });
    return max + 1;
  }
}
