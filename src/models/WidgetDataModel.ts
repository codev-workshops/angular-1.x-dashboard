/**
 * Base class for widget data models.
 * Subclass this and override init() and destroy() to provide data to widgets.
 */
export class WidgetDataModel {
  dataAttrName?: string;
  dataModelOptions?: Record<string, any>;
  protected widgetScope: { widgetData?: any } | null = null;

  setup(widget: { dataAttrName?: string; dataModelOptions?: Record<string, any> }, scope: { widgetData?: any }): void {
    this.dataAttrName = widget.dataAttrName;
    this.dataModelOptions = widget.dataModelOptions;
    this.widgetScope = scope;
  }

  updateScope(data: any): void {
    if (this.widgetScope) {
      this.widgetScope.widgetData = data;
    }
  }

  init(): void {
    // to be overridden by subclasses
  }

  destroy(): void {
    // to be overridden by subclasses
  }
}
