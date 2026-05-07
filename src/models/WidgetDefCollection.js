import _ from 'lodash';

function convertToDefinition(d) {
  if (typeof d === 'function') {
    return new d();
  }
  return d;
}

export default class WidgetDefCollection extends Array {
  constructor(widgetDefs) {
    super();
    widgetDefs = widgetDefs.map(convertToDefinition);
    this.push(...widgetDefs);

    this.map_ = {};
    _.each(widgetDefs, (widgetDef) => {
      this.map_[widgetDef.name] = widgetDef;
    });
  }

  getByName(name) {
    return this.map_[name];
  }

  add(def) {
    def = convertToDefinition(def);
    this.push(def);
    this.map_[def.name] = def;
  }
}
