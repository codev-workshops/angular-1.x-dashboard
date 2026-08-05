import type { WidgetDefinition } from './types';

type WidgetDefinitionConstructor = new () => WidgetDefinition;
type WidgetDefinitionInput = WidgetDefinition | WidgetDefinitionConstructor;

function convertToDefinition(definition: WidgetDefinitionInput): WidgetDefinition {
  return typeof definition === 'function' ? new definition() : definition;
}

export class WidgetDefCollection extends Array<WidgetDefinition> {
  private readonly definitionsByName: Record<string, WidgetDefinition> = {};

  constructor(widgetDefinitions: readonly WidgetDefinitionInput[] = []) {
    super();
    widgetDefinitions.forEach((definition) => this.push(convertToDefinition(definition)));
    this.refreshDefinitionMap();
  }

  static get [Symbol.species](): ArrayConstructor {
    return Array;
  }

  private refreshDefinitionMap(): void {
    this.forEach((definition) => {
      if (definition.name) this.definitionsByName[definition.name] = definition;
    });
  }

  getByName(name: string): WidgetDefinition | undefined {
    return this.definitionsByName[name];
  }

  add(definition: WidgetDefinitionInput): void {
    const converted = convertToDefinition(definition);
    this.push(converted);
    if (converted.name) this.definitionsByName[converted.name] = converted;
  }
}
