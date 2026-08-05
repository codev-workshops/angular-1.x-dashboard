import type { WidgetDefinition } from './types';

type WidgetDefinitionConstructor = new () => WidgetDefinition;
type WidgetDefinitionInput = WidgetDefinition | WidgetDefinitionConstructor;

function convertToDefinition(definition: WidgetDefinitionInput): WidgetDefinition {
  return typeof definition === 'function' ? new definition() : definition;
}

export class WidgetDefCollection implements Iterable<WidgetDefinition> {
  private readonly definitionsByName: Record<string, WidgetDefinition> = {};
  private readonly entries: WidgetDefinition[];

  constructor(widgetDefinitions: WidgetDefinitionInput[] = []) {
    this.entries = widgetDefinitions.map(convertToDefinition);
    this.entries.forEach((definition, index) => {
      Object.defineProperty(this, index, {
        configurable: true,
        enumerable: true,
        get: () => this.entries[index],
      });
      if (definition.name) this.definitionsByName[definition.name] = definition;
    });
  }

  get length(): number {
    return this.entries.length;
  }

  [index: number]: WidgetDefinition;

  [Symbol.iterator](): Iterator<WidgetDefinition> {
    return this.entries[Symbol.iterator]();
  }

  mapEntries<T>(callback: (definition: WidgetDefinition, index: number) => T): T[] {
    return this.entries.map(callback);
  }

  map<T>(callback: (definition: WidgetDefinition, index: number) => T): T[] {
    return this.entries.map(callback);
  }

  getByName(name: string): WidgetDefinition | undefined {
    return this.definitionsByName[name];
  }

  add(definition: WidgetDefinitionInput): void {
    const converted = convertToDefinition(definition);
    const index = this.entries.push(converted) - 1;
    Object.defineProperty(this, index, {
      configurable: true,
      enumerable: true,
      get: () => this.entries[index],
    });
    if (converted.name) this.definitionsByName[converted.name] = converted;
  }
}
