import { WidgetDataModel } from '../../lib/models/WidgetDataModel';

export class RandomDataModel extends WidgetDataModel {
  limit = 100;
  private intervalId?: number;

  init(): void {
    const configuredLimit = this.dataModelOptions?.limit;
    this.limit = typeof configuredLimit === 'number' ? configuredLimit : 100;
    this.updateScope('-');
    this.startInterval();
  }

  startInterval(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    }
    this.intervalId = window.setInterval(() => {
      this.updateScope(Math.floor(Math.random() * this.limit));
    }, 500);
  }

  updateLimit(limit: number): void {
    this.dataModelOptions = this.dataModelOptions ?? {};
    this.dataModelOptions.limit = limit;
    this.limit = limit;
  }

  destroy(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    }
    super.destroy();
  }
}
