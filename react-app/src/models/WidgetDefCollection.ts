export interface WidgetDefinition {
  name: string;
  directive?: string;
  attrs?: Record<string, unknown>;
  dataAttrName?: string;
  dataModelType?: new () => unknown;
  dataModelOptions?: Record<string, unknown>;
  style?: Record<string, string>;
  size?: Record<string, string | number>;
  templateUrl?: string;
  template?: string;
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  storageHash?: string;
  [key: string]: unknown;
}

function convertToDefinition(d: WidgetDefinition | (new () => WidgetDefinition)): WidgetDefinition {
  if (typeof d === 'function') {
    return new d();
  }
  return d;
}

export class WidgetDefCollection extends Array<WidgetDefinition> {
  private _map: Record<string, WidgetDefinition> = {};

  constructor(widgetDefs: Array<WidgetDefinition | (new () => WidgetDefinition)>) {
    super();
    const converted = widgetDefs.map(convertToDefinition);
    this.push(...converted);

    for (const widgetDef of converted) {
      this._map[widgetDef.name] = widgetDef;
    }
  }

  getByName(name: string): WidgetDefinition | undefined {
    return this._map[name];
  }

  add(def: WidgetDefinition | (new () => WidgetDefinition)): void {
    const converted = convertToDefinition(def);
    this.push(converted);
    this._map[converted.name] = converted;
  }
}
