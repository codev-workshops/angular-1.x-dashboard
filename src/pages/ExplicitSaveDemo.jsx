import React, { useRef } from 'react';
import Dashboard from '../components/Dashboard';
import RandomDataModel from '../models/RandomDataModel';

export default function ExplicitSaveDemo() {
  const dashboardRef = useRef(null);

  const dashboardOptions = useRef({
    widgetButtons: true,
    explicitSave: true,
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
      { name: 'wt-time' },
      { name: 'random' },
    ],
    useLocalStorage: true,
    storageId: 'demo_explicit_save',
    storageHash: 'es1',
  }).current;

  return (
    <div className="row">
      <div className="col-md-12">
        <Dashboard options={dashboardOptions} dashboardRef={dashboardRef} />
      </div>
    </div>
  );
}
