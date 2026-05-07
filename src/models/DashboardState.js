import _ from 'lodash';

export default class DashboardState {
  constructor(storage, id, hash, widgetDefinitions, stringify) {
    this.storage = storage;
    this.id = id;
    this.hash = hash;
    this.widgetDefinitions = widgetDefinitions;
    this.stringify = stringify;
  }

  save(widgets) {
    if (!this.storage) {
      return true;
    }

    const serialized = _.map(widgets, (widget) => widget.serialize());
    let item = { widgets: serialized, hash: this.hash };

    if (this.stringify) {
      item = JSON.stringify(item);
    }

    return this.storage.setItem(this.id, item) || true;
  }

  load() {
    if (!this.storage) {
      return null;
    }

    const serialized = this.storage.getItem(this.id);

    if (serialized) {
      if (serialized && typeof serialized === 'object' && typeof serialized.then === 'function') {
        return this._handleAsyncLoad(serialized);
      }
      return this._handleSyncLoad(serialized);
    } else {
      return null;
    }
  }

  _handleSyncLoad(serialized) {
    let deserialized;

    if (!serialized) {
      return null;
    }

    if (this.stringify) {
      try {
        deserialized = JSON.parse(serialized);
      } catch (e) {
        console.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
        return null;
      }
    } else {
      deserialized = serialized;
    }

    if (deserialized.hash !== this.hash) {
      console.info('Serialized dashboard from storage was stale (old hash: ' + deserialized.hash + ', new hash: ' + this.hash + ')');
      this.storage.removeItem(this.id);
      return null;
    }

    const savedWidgetDefs = deserialized.widgets;
    const result = [];

    for (let i = 0; i < savedWidgetDefs.length; i++) {
      const savedWidgetDef = savedWidgetDefs[i];
      const widgetDefinition = this.widgetDefinitions.getByName(savedWidgetDef.name);

      if (!widgetDefinition) {
        console.warn('Widget with name "' + savedWidgetDef.name + '" was not found in given widget definition objects');
        continue;
      }

      if (widgetDefinition.hasOwnProperty('storageHash') && widgetDefinition.storageHash !== savedWidgetDef.storageHash) {
        console.info('Widget Definition Object with name "' + savedWidgetDef.name + '" had stale storageHash');
        continue;
      }

      result.push(savedWidgetDef);
    }

    return result;
  }

  _handleAsyncLoad(promise) {
    return new Promise((resolve, reject) => {
      promise.then(
        (res) => {
          const result = this._handleSyncLoad(res);
          if (result) {
            resolve(result);
          } else {
            reject(result);
          }
        },
        (res) => {
          reject(res);
        }
      );
    });
  }
}
