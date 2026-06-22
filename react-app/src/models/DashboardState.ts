import type { WidgetDefCollection } from './WidgetDefCollection';

export interface StorageLike {
  getItem(id: string): unknown;
  setItem(id: string, value: unknown): unknown;
  removeItem(id: string): void;
}

export interface SerializedWidget {
  name: string;
  title?: string;
  storageHash?: string;
  [key: string]: unknown;
}

export class DashboardState {
  storage: StorageLike | undefined;
  id: string;
  hash: string | undefined;
  widgetDefinitions: WidgetDefCollection;
  stringify: boolean;

  constructor(
    storage: StorageLike | undefined,
    id: string,
    hash: string | undefined,
    widgetDefinitions: WidgetDefCollection,
    stringify: boolean
  ) {
    this.storage = storage;
    this.id = id;
    this.hash = hash;
    this.widgetDefinitions = widgetDefinitions;
    this.stringify = stringify;
  }

  save(widgets: Array<{ serialize: () => SerializedWidget }>): boolean {
    if (!this.storage) {
      return true;
    }

    const serialized = widgets.map(w => w.serialize());
    let item: unknown = { widgets: serialized, hash: this.hash };

    if (this.stringify) {
      item = JSON.stringify(item);
    }

    this.storage.setItem(this.id, item);
    return true;
  }

  load(): SerializedWidget[] | null | Promise<SerializedWidget[] | null> {
    if (!this.storage) {
      return null;
    }

    const serialized = this.storage.getItem(this.id);

    if (serialized) {
      if (typeof serialized === 'object' && serialized !== null && typeof (serialized as { then?: unknown }).then === 'function') {
        return this._handleAsyncLoad(serialized as Promise<unknown>);
      }
      return this._handleSyncLoad(serialized);
    } else {
      return null;
    }
  }

  _handleSyncLoad(serialized?: unknown): SerializedWidget[] | null {
    if (!serialized) {
      return null;
    }

    let deserialized: { hash?: string; widgets: SerializedWidget[] };

    if (this.stringify) {
      try {
        deserialized = JSON.parse(serialized as string);
      } catch {
        console.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
        return null;
      }
    } else {
      deserialized = serialized as { hash?: string; widgets: SerializedWidget[] };
    }

    if (deserialized.hash !== this.hash) {
      console.info('Serialized dashboard from storage was stale (old hash: ' + deserialized.hash + ', new hash: ' + this.hash + ')');
      this.storage?.removeItem(this.id);
      return null;
    }

    const savedWidgetDefs = deserialized.widgets;
    const result: SerializedWidget[] = [];

    for (let i = 0; i < savedWidgetDefs.length; i++) {
      const savedWidgetDef = savedWidgetDefs[i];
      const widgetDefinition = this.widgetDefinitions.getByName(savedWidgetDef.name);

      if (!widgetDefinition) {
        console.warn('Widget with name "' + savedWidgetDef.name + '" was not found in given widget definition objects');
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(widgetDefinition, 'storageHash') && widgetDefinition.storageHash !== savedWidgetDef.storageHash) {
        console.info('Widget Definition Object with name "' + savedWidgetDef.name + '" was found but the storageHash property differs.');
        continue;
      }

      result.push(savedWidgetDef);
    }

    return result;
  }

  _handleAsyncLoad(promise: Promise<unknown>): Promise<SerializedWidget[] | null> {
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
        (err) => {
          reject(err);
        }
      );
    });
  }
}
