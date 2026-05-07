import React, { useRef } from 'react';
import DashboardLayouts from '../components/DashboardLayouts';
import RandomDataModel from '../models/RandomDataModel';

export default function LayoutsExplicitSaveDemo() {
  const layoutOptions = useRef({
    widgetDefinitions: [
      {
        name: 'wt-time',
        directive: 'wt-time',
        title: 'Time',
        size: { width: '33%' },
      },
      {
        name: 'random',
        directive: 'wt-scope-watch',
        title: 'Random',
        dataModelType: RandomDataModel,
        size: { width: '33%' },
      },
    ],
    defaultWidgets: [
      { name: 'wt-time' },
      { name: 'random' },
    ],
    defaultLayouts: [
      { title: 'Layout 1', active: true, defaultWidgets: [{ name: 'wt-time' }, { name: 'random' }] },
      { title: 'Layout 2', active: false, defaultWidgets: [{ name: 'random' }, { name: 'wt-time' }] },
    ],
    explicitSave: true,
    storageId: 'demo_layouts_explicit',
    storageHash: 'lye1',
    storage: localStorage,
    stringifyStorage: true,
  }).current;

  return (
    <div>
      <DashboardLayouts options={layoutOptions} />
    </div>
  );
}
