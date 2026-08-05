import type { WidgetDataModelApi, WidgetDefinition } from './types';

export class WidgetDataModel {
  [key: string]: unknown;
  dataAttrName?: string;
  dataModelOptions?: Record<string, unknown>;
  private api?: WidgetDataModelApi;

  setup(widget: WidgetDefinition, api: WidgetDataModelApi): void {
    this.dataAttrName = widget.dataAttrName;
    this.dataModelOptions = widget.dataModelOptions;
    this.api = api;
  }

  updateScope(data: unknown): void {
    this.api?.updateScope(data);
  }

  init(): void {}

  destroy(): void {}
}
