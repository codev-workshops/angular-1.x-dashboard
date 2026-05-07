export default class WidgetDataModel {
  setup(widget, setData) {
    this.dataAttrName = widget.dataAttrName;
    this.dataModelOptions = widget.dataModelOptions;
    this.setData = setData;
  }

  updateScope(data) {
    if (this.setData) {
      this.setData(data);
    }
  }

  init() {}
  destroy() {}
}
