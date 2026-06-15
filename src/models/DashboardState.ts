import _ from 'lodash';
import { WidgetDefCollection } from './WidgetDefCollection';
import { StorageInterface } from '../types';

export class DashboardState {
  storage: StorageInterface | undefined;
  id: string;
  hash: string | undefined;
  widgetDefinitions: WidgetDefCollection;
  stringify: boolean;

  constructor(
    storage: StorageInterface | undefined,
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

  save(widgets: Array<{ serialize: () => Record<string, any> }>): boolean {
    if (!this.storage) {
      return true;
    }

    const serialized = _.map(widgets, (widget) => widget.serialize());
    let item: any = { widgets: serialized, hash: this.hash };

    if (this.stringify) {
      item = JSON.stringify(item);
    }

    this.storage.setItem(this.id, item);
    return true;
  }

  load(): Record<string, any>[] | Promise<Record<string, any>[]> | null {
    if (!this.storage) {
      return null;
    }

    const serialized = this.storage.getItem(this.id);

    if (serialized) {
      if (typeof serialized === 'object' && serialized !== null && 'then' in serialized && typeof (serialized as any).then === 'function') {
        return this._handleAsyncLoad(serialized as Promise<string>);
      }
      return this._handleSyncLoad(serialized as string);
    } else {
      return null;
    }
  }

  _handleSyncLoad(serialized?: string | Record<string, any>): Record<string, any>[] | null {
    if (!serialized) {
      return null;
    }

    let deserialized: any;

    if (this.stringify) {
      try {
        deserialized = JSON.parse(serialized as string);
      } catch {
        console.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
        return null;
      }
    } else {
      deserialized = serialized;
    }

    if (deserialized.hash !== this.hash) {
      console.info(
        'Serialized dashboard from storage was stale (old hash: ' + deserialized.hash + ', new hash: ' + this.hash + ')'
      );
      this.storage?.removeItem(this.id);
      return null;
    }

    const savedWidgetDefs: Record<string, any>[] = deserialized.widgets;
    const result: Record<string, any>[] = [];

    for (let i = 0; i < savedWidgetDefs.length; i++) {
      const savedWidgetDef = savedWidgetDefs[i];
      const widgetDefinition = this.widgetDefinitions.getByName(savedWidgetDef.name);

      if (!widgetDefinition) {
        console.warn('Widget with name "' + savedWidgetDef.name + '" was not found in given widget definition objects');
        continue;
      }

      if (
        Object.prototype.hasOwnProperty.call(widgetDefinition, 'storageHash') &&
        widgetDefinition.storageHash !== savedWidgetDef.storageHash
      ) {
        console.info(
          'Widget Definition Object with name "' + savedWidgetDef.name + '" was found ' +
          'but the storageHash property on the widget definition is different from that on the ' +
          'serialized widget loaded from storage. hash from storage: "' + savedWidgetDef.storageHash + '"' +
          ', hash from WDO: "' + widgetDefinition.storageHash + '"'
        );
        continue;
      }

      result.push(savedWidgetDef);
    }

    return result;
  }

  _handleAsyncLoad(promise: Promise<string>): Promise<Record<string, any>[]> {
    return promise.then(
      (res) => {
        const result = this._handleSyncLoad(res);
        if (result) {
          return result;
        }
        return Promise.reject(result);
      },
      (error) => Promise.reject(error)
    );
  }
}
