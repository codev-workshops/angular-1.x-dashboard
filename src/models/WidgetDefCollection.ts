import { WidgetDefinition } from '../types';

function convertToDefinition(d: WidgetDefinition | (() => WidgetDefinition)): WidgetDefinition {
  if (typeof d === 'function') {
    return (d as () => WidgetDefinition)();
  }
  return d;
}

export class WidgetDefCollection {
  private items: WidgetDefinition[] = [];
  private map: Record<string, WidgetDefinition> = {};

  constructor(widgetDefs: Array<WidgetDefinition | (() => WidgetDefinition)>) {
    const converted = widgetDefs.map(convertToDefinition);
    this.items = converted;

    converted.forEach((widgetDef) => {
      this.map[widgetDef.name] = widgetDef;
    });
  }

  getByName(name: string): WidgetDefinition | undefined {
    return this.map[name];
  }

  add(def: WidgetDefinition | (() => WidgetDefinition)): void {
    const converted = convertToDefinition(def);
    this.items.push(converted);
    this.map[converted.name] = converted;
  }

  get length(): number {
    return this.items.length;
  }

  getAll(): WidgetDefinition[] {
    return this.items;
  }

  getAt(index: number): WidgetDefinition | undefined {
    return this.items[index];
  }
}
