import type { WidgetDefinition, WidgetRegistry } from './models/types';
import { logger } from './logger';

export type WidgetResolution = {
  key: string;
  Component?: WidgetRegistry[string];
};

export function resolveWidgetContent(widget: WidgetDefinition, registry: WidgetRegistry): WidgetResolution {
  const key = widget.templateUrl ?? widget.template ?? widget.directive ?? widget.name ?? '';
  const Component = registry[key];
  if (!Component) {
    logger.warn(`Unable to resolve widget content: ${key}`);
  }
  return { key, Component };
}
