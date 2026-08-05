import { describe, expect, it } from 'vitest';
import { defaultWidgets, widgetDefinitions } from './widgetDefinitions';
import { RandomDataModel } from './dataModels/RandomDataModel';

describe('demo widget definitions', () => {
  it('matches the shared AngularJS definitions and defaults', () => {
    expect(widgetDefinitions).toHaveLength(5);
    expect(widgetDefinitions[0]).toMatchObject({ name: 'random', directive: 'wt-scope-watch', attrs: { value: 'randomValue' } });
    expect(widgetDefinitions[1]).toMatchObject({ name: 'time', directive: 'wt-time' });
    expect(widgetDefinitions[2]).toMatchObject({ name: 'datamodel', directive: 'wt-scope-watch', dataAttrName: 'value', dataModelType: RandomDataModel });
    expect(widgetDefinitions[3]).toMatchObject({ name: 'resizable', templateUrl: 'app/template/resizable.html', attrs: { class: 'demo-widget-resizable' } });
    expect(widgetDefinitions[4]).toMatchObject({ name: 'fluid', directive: 'wt-fluid', size: { width: '50%', height: '250px' } });
    expect(defaultWidgets).toEqual([
      { name: 'random' },
      { name: 'time' },
      { name: 'datamodel' },
      { name: 'random', style: { width: '50%', minWidth: '39%' } },
      { name: 'time', style: { width: '50%' } },
    ]);
  });
});
