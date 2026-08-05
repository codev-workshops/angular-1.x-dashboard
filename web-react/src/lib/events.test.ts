import { describe, expect, it } from 'vitest';
import { createDashboardEvents } from './events';

describe('DashboardEvents', () => {
  it('subscribes, emits, and unsubscribes', () => {
    const events = createDashboardEvents();
    let count = 0;
    const off = events.on('widgetChanged', () => { count += 1; });
    events.emit('widgetChanged');
    off();
    events.emit('widgetChanged');
    expect(count).toBe(1);
  });
});
