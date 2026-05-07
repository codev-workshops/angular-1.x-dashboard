import _ from 'lodash';

function defaults() {
  return {
    title: 'Widget',
    style: {},
    size: { width: '33%' },
    enableVerticalResize: true,
    containerStyle: { width: '33%' },
    contentStyle: {}
  };
}

let globalId = 0;

export default class WidgetModel {
  constructor(widgetDefinition, overrides) {
    Object.assign(this, defaults(), _.merge({}, _.cloneDeep(_.omit(widgetDefinition, ['dataModelType'])), overrides));
    if (widgetDefinition.dataModelType) this.dataModelType = widgetDefinition.dataModelType;
    this.wid = ++globalId;

    this.updateContainerStyle(this.style);

    if (!this.templateUrl && !this.template && !this.directive) {
      this.directive = widgetDefinition.name;
    }

    if (this.size && _.has(this.size, 'height')) {
      this.setHeight(this.size.height);
    }

    if (this.style && _.has(this.style, 'width')) {
      this.setWidth(this.style.width);
    }

    if (this.size && _.has(this.size, 'width')) {
      this.setWidth(this.size.width);
    }
  }

  setWidth(width, units) {
    width = width.toString();
    units = units || width.replace(/^[-.\d]+/, '') || '%';

    this.widthUnits = units;
    width = parseFloat(width);

    if (this.size && _.has(this.size, 'minWidth') && _.endsWith(this.size.minWidth, units)) {
      width = _.max([parseFloat(this.size.minWidth), width]);
    }
    if (width < 0 || isNaN(width)) {
      console.warn('setWidth was called when width was ' + width);
      return;
    }

    if (units === '%') {
      width = Math.min(100, width);
      width = Math.max(0, width);
    }

    this.containerStyle.width = width + '' + units;
    this.updateSize(this.containerStyle);

    return width + units;
  }

  setHeight(height) {
    this.contentStyle.height = height;
    this.updateSize(this.contentStyle);
    return height + 'px';
  }

  setStyle(style) {
    this.style = style;
    this.updateContainerStyle(style);
  }

  updateSize(size) {
    Object.assign(this.size, size);
  }

  updateContainerStyle(style) {
    Object.assign(this.containerStyle, style);
  }

  serialize() {
    return _.pick(this, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
  }
}
