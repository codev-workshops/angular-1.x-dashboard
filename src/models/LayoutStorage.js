import _ from 'lodash';

const noopStorage = {
  setItem() {},
  getItem() {},
  removeItem() {}
};

export default class LayoutStorage {
  constructor(options) {
    const defs = {
      storage: noopStorage,
      storageHash: '',
      stringifyStorage: true
    };

    Object.assign(defs, options);
    Object.assign(options, defs);

    this.id = options.storageId;
    this.storage = options.storage;
    this.storageHash = options.storageHash;
    this.stringifyStorage = options.stringifyStorage;
    this.widgetDefinitions = options.widgetDefinitions;
    this.defaultLayouts = options.defaultLayouts;
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

  add(layouts) {
    if (!Array.isArray(layouts)) {
      layouts = [layouts];
    }
    layouts.forEach((layout) => {
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

  remove(layout) {
    const index = this.layouts.indexOf(layout);
    if (index >= 0) {
      this.layouts.splice(index, 1);
      delete this.states[layout.id];

      if (layout.active && this.layouts.length) {
        const nextActive = index > 0 ? index - 1 : 0;
        this.layouts[nextActive].active = true;
      }
    }
  }

  save() {
    let state = {
      layouts: this._serializeLayouts(),
      states: this.states,
      storageHash: this.storageHash
    };

    if (this.stringifyStorage) {
      state = JSON.stringify(state);
    }

    this.storage.setItem(this.id, state);
    this.options.unsavedChangeCount = 0;
  }

  load() {
    const serialized = this.storage.getItem(this.id);
    this.clear();

    if (serialized) {
      if (serialized && typeof serialized === 'object' && typeof serialized.then === 'function') {
        this._handleAsyncLoad(serialized);
      } else {
        this._handleSyncLoad(serialized);
      }
    } else {
      this._addDefaultLayouts();
    }
  }

  clear() {
    this.layouts = [];
    this.states = {};
  }

  setItem(id, value) {
    this.states[id] = value;
    this.save();
  }

  getItem(id) {
    return this.states[id];
  }

  removeItem(id) {
    delete this.states[id];
    this.save();
  }

  getActiveLayout() {
    for (let i = 0; i < this.layouts.length; i++) {
      if (this.layouts[i].active) {
        return this.layouts[i];
      }
    }
    return false;
  }

  _addDefaultLayouts() {
    const defs = this.lockDefaultLayouts ? { locked: true } : {};
    (this.defaultLayouts || []).forEach((layout) => {
      this.add(Object.assign(_.clone(defs), layout));
    });
  }

  _serializeLayouts() {
    return this.layouts.map((l) => ({
      title: l.title,
      id: l.id,
      active: l.active,
      locked: l.locked,
      defaultWidgets: l.dashboard.defaultWidgets
    }));
  }

  _handleSyncLoad(serialized) {
    let deserialized;

    if (this.stringifyStorage) {
      try {
        deserialized = JSON.parse(serialized);
      } catch (e) {
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

  _handleAsyncLoad(promise) {
    promise.then(
      (res) => this._handleSyncLoad(res),
      () => this._addDefaultLayouts()
    );
  }

  _ensureActiveLayout() {
    for (let i = 0; i < this.layouts.length; i++) {
      if (this.layouts[i].active) {
        return;
      }
    }
    if (this.layouts[0]) {
      this.layouts[0].active = true;
    }
  }

  _getLayoutId(layout) {
    if (layout.id) {
      return layout.id;
    }
    let max = 0;
    for (let i = 0; i < this.layouts.length; i++) {
      max = Math.max(max, this.layouts[i].id * 1);
    }
    return max + 1;
  }
}
