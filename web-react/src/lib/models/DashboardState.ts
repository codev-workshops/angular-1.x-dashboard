import { logger } from '../logger';
import type { StorageLike } from './types';
import type { WidgetDefCollection } from './WidgetDefCollection';

export class DashboardState {
  constructor(
    public storage: StorageLike | undefined,
    public id: string | undefined,
    public hash: string | undefined,
    public widgetDefinitions: WidgetDefCollection,
    public stringify: boolean,
  ) {}

  save(widgets: Array<{ serialize: () => Record<string, unknown> }>): unknown {
    if (!this.storage) return true;
    const serialized = widgets.map((widget) => widget.serialize());
    const item: unknown = this.stringify ? JSON.stringify({ widgets: serialized, hash: this.hash }) : { widgets: serialized, hash: this.hash };
    return this.storage.setItem(this.id ?? '', item) || true;
  }

  load(): unknown {
    if (!this.storage) return null;
    const serialized = this.storage.getItem(this.id ?? '');
    if (!serialized) return null;
    if (typeof serialized === 'object' && serialized !== null && 'then' in serialized && typeof serialized.then === 'function') {
      return this._handleAsyncLoad(serialized as Promise<unknown>);
    }
    return this._handleSyncLoad(serialized);
  }

  _handleSyncLoad(serialized: unknown): Array<Record<string, unknown>> | null {
    if (!serialized) return null;
    let deserialized: { hash?: string; widgets?: Array<Record<string, unknown>> };
    if (this.stringify) {
      try {
        deserialized = JSON.parse(String(serialized)) as { hash?: string; widgets?: Array<Record<string, unknown>> };
      } catch {
        logger.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
        return null;
      }
    } else {
      deserialized = serialized as { hash?: string; widgets?: Array<Record<string, unknown>> };
    }
    if (deserialized.hash !== this.hash) {
      logger.info('Serialized dashboard from storage was stale (old hash: ' + deserialized.hash + ', new hash: ' + this.hash + ')');
      this.storage?.removeItem(this.id ?? '');
      return null;
    }
    const result: Array<Record<string, unknown>> = [];
    for (const savedWidgetDef of deserialized.widgets ?? []) {
      const name = String(savedWidgetDef.name ?? '');
      const widgetDefinition = this.widgetDefinitions.getByName(name);
      if (!widgetDefinition) {
        logger.warn('Widget with name "' + name + '" was not found in given widget definition objects');
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(widgetDefinition, 'storageHash') && widgetDefinition.storageHash !== savedWidgetDef.storageHash) {
        logger.info('Widget Definition Object with name "' + name + '" was found ' +
          'but the storageHash property on the widget definition is different from that on the ' +
          'serialized widget loaded from storage. hash from storage: "' + savedWidgetDef.storageHash + '"' +
          ', hash from WDO: "' + widgetDefinition.storageHash + '"');
        continue;
      }
      result.push(savedWidgetDef);
    }
    return result;
  }

  _handleAsyncLoad(promise: Promise<unknown>): Promise<Array<Record<string, unknown>>> {
    return promise.then((value) => {
      const result = this._handleSyncLoad(value);
      if (result) return result;
      return Promise.reject(result);
    });
  }
}
