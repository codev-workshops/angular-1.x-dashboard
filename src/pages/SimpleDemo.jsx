import React, { useState, useEffect, useRef } from 'react';
import Dashboard from '../components/Dashboard';
import RandomDataModel from '../models/RandomDataModel';

export default function SimpleDemo() {
  const [randomValue, setRandomValue] = useState(0);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRandomValue(Math.floor(Math.random() * 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dashboardOptions = useRef({
    widgetButtons: true,
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
        dataAttrName: 'randomValue',
        dataModelType: RandomDataModel,
        size: { width: '33%' },
      },
      {
        name: 'wt-fluid',
        directive: 'wt-fluid',
        title: 'Fluid',
        size: { width: '33%', height: '250px' },
        enableVerticalResize: true,
      },
    ],
    defaultWidgets: [
      { name: 'wt-time' },
      { name: 'random' },
      { name: 'wt-time' },
      { name: 'random' },
    ],
    useLocalStorage: true,
    storageId: 'demo_simple',
    storageHash: 'sd1',
  }).current;

  const handlePrependWidget = () => {
    if (dashboardOptions.prependWidget) {
      dashboardOptions.prependWidget({ name: 'random' });
    }
  };

  return (
    <div>
      <p>
        <a onClick={handlePrependWidget} style={{ cursor: 'pointer' }}>Click here</a> to add new widget to beginning of dashboard.
      </p>
      <div className="row">
        <div className="col-md-12">
          <Dashboard options={dashboardOptions} dashboardRef={dashboardRef} />
        </div>
      </div>
    </div>
  );
}
