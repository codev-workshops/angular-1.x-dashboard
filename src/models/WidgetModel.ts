import _ from 'lodash';
import { WidgetDefinition } from '../types';

interface WidgetModelDefaults {
  title: string;
  style: Record<string, string>;
  size: Record<string, string>;
  enableVerticalResize: boolean;
  containerStyle: Record<string, string>;
  contentStyle: Record<string, string>;
}

function getDefaults(): WidgetModelDefaults {
  return {
    title: 'Widget',
    style: {},
    size: { width: '33%' },
    enableVerticalResize: true,
    containerStyle: { width: '33%' },
    contentStyle: {},
  };
}

export class WidgetModel {
  title!: string;
  name!: string;
  style!: Record<string, string>;
  size!: Record<string, string>;
  enableVerticalResize!: boolean;
  containerStyle!: Record<string, string>;
  contentStyle!: Record<string, string>;
  templateUrl?: string;
  template?: string;
  directive?: string;
  dataModelType?: any;
  dataModelOptions?: Record<string, any>;
  dataModelArgs?: Record<string, any>;
  dataAttrName?: string;
  attrs?: Record<string, any>;
  storageHash?: string;
  settingsModalOptions?: Record<string, any>;
  onSettingsClose?: (result: any) => void;
  onSettingsDismiss?: (reason: any) => void;
  widthUnits?: string;
  [key: string]: any;

  constructor(widgetDefinition: WidgetDefinition, overrides?: Partial<WidgetDefinition>) {
    const merged = _.merge(_.cloneDeep(widgetDefinition), overrides);
    Object.assign(this, getDefaults(), merged);

    this.updateContainerStyle(this.style);

    if (!this.templateUrl && !this.template && !this.directive) {
      this.directive = widgetDefinition.name;
    }

    if (this.size && _.has(this.size, 'height')) {
      this.setHeight(this.size.height!);
    }

    if (this.style && _.has(this.style, 'width')) {
      this.setWidth(this.style.width!);
    }

    if (this.size && _.has(this.size, 'width')) {
      this.setWidth(this.size.width!);
    }
  }

  setWidth(width: string | number, units?: string): string | undefined {
    const widthStr = width.toString();
    units = units || widthStr.replace(/^[-.\d]+/, '') || '%';

    this.widthUnits = units;
    let widthNum = parseFloat(widthStr);

    // check with min width if set
    if (this.size && _.has(this.size, 'minWidth') && _.endsWith(this.size.minWidth, units)) {
      widthNum = _.max([parseFloat(this.size.minWidth!), widthNum])!;
    }

    if (widthNum < 0 || isNaN(widthNum)) {
      console.warn('malhar-angular-dashboard: setWidth was called when width was ' + widthNum);
      return undefined;
    }

    if (units === '%') {
      widthNum = Math.min(100, widthNum);
      widthNum = Math.max(0, widthNum);
    }

    this.containerStyle.width = widthNum + '' + units;
    this.updateSize(this.containerStyle);

    return widthNum + units;
  }

  setHeight(height: string): string {
    this.contentStyle.height = height;
    this.updateSize(this.contentStyle);
    return height + 'px';
  }

  setStyle(style: Record<string, string>): void {
    this.style = style;
    this.updateContainerStyle(style);
  }

  updateSize(size: Record<string, string>): void {
    Object.assign(this.size, size);
  }

  updateContainerStyle(style: Record<string, string>): void {
    Object.assign(this.containerStyle, style);
  }

  serialize(): Record<string, any> {
    return _.pick(this, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
  }
}
