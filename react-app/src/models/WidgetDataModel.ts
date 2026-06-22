export interface WidgetScope {
  widgetData?: unknown;
}

export interface WidgetLike {
  dataAttrName?: string;
  dataModelOptions?: Record<string, unknown>;
}

export class WidgetDataModel {
  dataAttrName?: string;
  dataModelOptions?: Record<string, unknown>;
  widgetScope?: WidgetScope;

  setup(widget: WidgetLike, scope: WidgetScope): void {
    this.dataAttrName = widget.dataAttrName;
    this.dataModelOptions = widget.dataModelOptions;
    this.widgetScope = scope;
  }

  updateScope(data: unknown): void {
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
