import { RandomDataModel } from './dataModels/RandomDataModel';
import type { WidgetDefinition } from '../lib/models/types';

export const widgetDefinitions: WidgetDefinition[] = [
  {
    name: 'random',
    directive: 'wt-scope-watch',
    attrs: { value: 'randomValue' },
  },
  {
    name: 'time',
    directive: 'wt-time',
  },
  {
    name: 'datamodel',
    directive: 'wt-scope-watch',
    dataAttrName: 'value',
    dataModelType: RandomDataModel,
  },
  {
    name: 'resizable',
    templateUrl: 'app/template/resizable.html',
    attrs: { class: 'demo-widget-resizable' },
  },
  {
    name: 'fluid',
    directive: 'wt-fluid',
    size: {
      width: '50%',
      height: '250px',
    },
  },
];

export const defaultWidgets: WidgetDefinition[] = [
  { name: 'random' },
  { name: 'time' },
  { name: 'datamodel' },
  {
    name: 'random',
    style: {
      width: '50%',
      minWidth: '39%',
    },
  },
  {
    name: 'time',
    style: {
      width: '50%',
    },
  },
];
