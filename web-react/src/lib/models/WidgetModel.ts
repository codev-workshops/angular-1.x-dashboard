import { cloneDeep, has, merge, pick } from 'lodash-es';
import { logger } from '../logger';
import type { WidgetDefinition, WidgetOverrides, WidgetSize, WidgetStyle } from './types';

function defaults(): WidgetDefinition {
  return {
    title: 'Widget',
    style: {},
    size: { width: '33%' },
    enableVerticalResize: true,
    containerStyle: { width: '33%' },
    contentStyle: {},
  };
}

let nextUid = 0;

export class WidgetModel implements WidgetDefinition {
  [key: string]: unknown;
  title!: string;
  style!: WidgetStyle;
  size!: WidgetSize;
  enableVerticalResize!: boolean;
  containerStyle!: WidgetStyle;
  contentStyle!: WidgetStyle;
  name?: string;
  templateUrl?: string;
  template?: string;
  directive?: string;
  dataModelOptions?: Record<string, unknown>;
  attrs?: Record<string, string>;
  dataModelType?: string | WidgetDefinition['dataModelType'];
  dataAttrName?: string;
  storageHash?: string;
  widthUnits?: string;
  readonly uid!: string;

  constructor(widgetDefinition: WidgetDefinition = {}, overrides: WidgetOverrides = {}) {
    Object.defineProperty(this, 'uid', {
      value: `widget-${++nextUid}`,
      enumerable: false,
      writable: false,
    });
    const merged = merge(cloneDeep(widgetDefinition), cloneDeep(overrides));
    Object.assign(this, defaults(), merged);
    this.style = this.style ?? {};
    this.size = this.size ?? {};
    this.containerStyle = this.containerStyle ?? {};
    this.contentStyle = this.contentStyle ?? {};
    this.updateContainerStyle(this.style);

    if (!this.templateUrl && !this.template && !this.directive) {
      this.directive = widgetDefinition.name;
    }
    if (this.size && has(this.size, 'height')) {
      this.setHeight(this.size.height as string | number);
    }
    if (this.style && has(this.style, 'width')) {
      this.setWidth(this.style.width as string | number);
    }
    if (this.size && has(this.size, 'width')) {
      this.setWidth(this.size.width as string | number);
    }
  }

  setWidth(width: string | number, units?: string): string | undefined {
    const widthString = width.toString();
    const widthUnits = units ?? (widthString.replace(/^[-.\d]+/, '') || '%');
    this.widthUnits = widthUnits;
    let numericWidth = parseFloat(widthString);

    if (this.size?.minWidth && this.size.minWidth.endsWith(widthUnits)) {
      numericWidth = Math.max(parseFloat(this.size.minWidth), numericWidth);
    }
    if (numericWidth < 0 || Number.isNaN(numericWidth)) {
      logger.warn(`malhar-angular-dashboard: setWidth was called when width was ${numericWidth}`);
      return undefined;
    }
    if (widthUnits === '%') {
      numericWidth = Math.min(100, Math.max(0, numericWidth));
    }
    this.containerStyle.width = `${numericWidth}${widthUnits}`;
    this.updateSize(this.containerStyle);
    return `${numericWidth}${widthUnits}`;
  }

  setHeight(height: string | number): string {
    this.contentStyle.height = height;
    this.updateSize(this.contentStyle);
    return `${height}px`;
  }

  setStyle(style: WidgetStyle): void {
    this.style = style;
    this.updateContainerStyle(style);
  }

  updateSize(size: WidgetStyle): void {
    Object.assign(this.size, size);
  }

  updateContainerStyle(style: WidgetStyle): void {
    Object.assign(this.containerStyle, style);
  }

  serialize(): Record<string, unknown> {
    return pick(this, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
  }
}
