import React, { useRef } from 'react';
import Dashboard from '../components/Dashboard';

export default function ResizeDemo() {
  const dashboardRef = useRef(null);

  const dashboardOptions = useRef({
    widgetButtons: true,
    widgetDefinitions: [
      {
        name: 'fluid',
        directive: 'wt-fluid',
        title: 'Fluid Widget',
        enableVerticalResize: true,
        size: { width: '50%', height: '250px', minWidth: '25%' },
      },
      {
        name: 'resizable',
        directive: 'resizable',
        title: 'Resizable Widget',
        enableVerticalResize: true,
        size: { width: '50%', height: '200px', minWidth: '100px' },
      },
      {
        name: 'ratio',
        directive: 'resizable',
        title: 'Fixed Ratio (4:3)',
        enableVerticalResize: true,
        size: { width: '33%', heightToWidthRatio: 0.75, minWidth: '25%' },
      },
    ],
    defaultWidgets: [
      { name: 'fluid' },
      { name: 'resizable' },
      { name: 'ratio' },
    ],
    useLocalStorage: true,
    storageId: 'demo_resize',
    storageHash: 'rs1',
  }).current;

  return (
    <div className="row">
      <div className="col-md-12">
        <Dashboard options={dashboardOptions} dashboardRef={dashboardRef} />
      </div>
    </div>
  );
}
