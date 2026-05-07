import WidgetDataModel from './WidgetDataModel';

export default class RandomDataModel extends WidgetDataModel {
  init() {
    const dataModelOptions = this.dataModelOptions;
    this.limit = (dataModelOptions && dataModelOptions.limit) ? dataModelOptions.limit : 100;
    this.updateScope('-');
    this.startInterval();
  }

  startInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      const value = Math.floor(Math.random() * this.limit);
      this.updateScope(value);
    }, 500);
  }

  updateLimit(limit) {
    this.dataModelOptions = this.dataModelOptions ? this.dataModelOptions : {};
    this.dataModelOptions.limit = limit;
    this.limit = limit;
  }

  destroy() {
    super.destroy();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
