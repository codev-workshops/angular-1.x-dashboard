import React, { useRef } from 'react';
import DashboardLayouts from '../components/DashboardLayouts';
import RandomDataModel from '../models/RandomDataModel';

export default function LayoutsDemo() {
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
      { title: 'Layout 2', active: false, defaultWidgets: [{ name: 'random' }, { name: 'wt-time' }, { name: 'random' }] },
      { title: 'Layout 3', active: false, defaultWidgets: [{ name: 'wt-time' }] },
    ],
    storageId: 'demo_layouts',
    storageHash: 'ly1',
    storage: localStorage,
    stringifyStorage: true,
  }).current;

  const handlePrependWidget = () => {
    if (layoutOptions.prependWidget) {
      layoutOptions.prependWidget({ name: 'random' });
    }
  };

  return (
    <div>
      <p>
        <a onClick={handlePrependWidget} style={{ cursor: 'pointer' }}>Click here</a> to add new "random" widget to beginning of dashboard.
      </p>
      <DashboardLayouts options={layoutOptions} />
    </div>
  );
}
