export type DashboardEventName = 'widgetAdded' | 'widgetChanged' | 'widgetResized';
export type DashboardEventHandler = (...args: unknown[]) => void;

export class DashboardEvents {
  private readonly handlers = new Map<DashboardEventName, Set<DashboardEventHandler>>();

  on(name: DashboardEventName, handler: DashboardEventHandler): () => void {
    const listeners = this.handlers.get(name) ?? new Set<DashboardEventHandler>();
    listeners.add(handler);
    this.handlers.set(name, listeners);
    return () => listeners.delete(handler);
  }

  emit(name: DashboardEventName, ...args: unknown[]): void {
    this.handlers.get(name)?.forEach((handler) => handler(...args));
  }
}

export function createDashboardEvents(): DashboardEvents {
  return new DashboardEvents();
}
