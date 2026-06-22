import { merge, has, endsWith, pick, cloneDeep } from 'lodash-es';

function defaults() {
  return {
    title: 'Widget',
    style: {} as Record<string, string>,
    size: { width: '33%' } as Record<string, string | number | undefined>,
    enableVerticalResize: true,
    containerStyle: { width: '33%' } as Record<string, string>,
    contentStyle: {} as Record<string, string>,
  };
}

export class WidgetModel {
  title!: string;
  name!: string;
  style!: Record<string, string>;
  size!: Record<string, string | number | undefined>;
  enableVerticalResize!: boolean;
  containerStyle!: Record<string, string>;
  contentStyle!: Record<string, string>;
  widthUnits?: string;
  directive?: string;
  templateUrl?: string;
  template?: string;
  dataModelOptions?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
  storageHash?: string;
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: (...args: unknown[]) => void;
  onSettingsDismiss?: (...args: unknown[]) => void;
  [key: string]: unknown;

  constructor(widgetDefinition: Record<string, unknown>, overrides?: Record<string, unknown>) {
    Object.assign(this, defaults(), merge(cloneDeep(widgetDefinition), overrides || {}));

    this.updateContainerStyle(this.style);

    if (!this.templateUrl && !this.template && !this.directive) {
      this.directive = widgetDefinition.name as string;
    }

    if (this.size && has(this.size, 'height')) {
      this.setHeight(this.size.height as string);
    }

    if (this.style && has(this.style, 'width')) {
      this.setWidth(this.style.width);
    }

    if (this.size && has(this.size, 'width')) {
      this.setWidth(this.size.width as string);
    }
  }

  setWidth(width: string | number, units?: string): string | undefined {
    width = width.toString();
    units = units || width.replace(/^[-.\d]+/, '') || '%';

    this.widthUnits = units;
    let numWidth = parseFloat(width);

    if (this.size && has(this.size, 'minWidth') && endsWith(this.size.minWidth as string, units)) {
      numWidth = Math.max(parseFloat(this.size.minWidth as string), numWidth);
    }
    if (numWidth < 0 || isNaN(numWidth)) {
      console.warn('setWidth was called when width was ' + numWidth);
      return undefined;
    }

    if (units === '%') {
      numWidth = Math.min(100, numWidth);
      numWidth = Math.max(0, numWidth);
    }

    this.containerStyle.width = numWidth + '' + units;
    this.updateSize(this.containerStyle);
    return numWidth + units;
  }

  setHeight(height: string | number): string {
    this.contentStyle.height = String(height);
    this.updateSize(this.contentStyle);
    return height + 'px';
  }

  setStyle(style: Record<string, string>): void {
    this.style = style;
    this.updateContainerStyle(style);
  }

  updateSize(size: Record<string, unknown>): void {
    Object.assign(this.size, size);
  }

  updateContainerStyle(style: Record<string, string>): void {
    Object.assign(this.containerStyle, style);
  }

  serialize(): Record<string, unknown> {
    return pick(this, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
  }
}
