import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './components/Dashboard';
import { DashboardOptions } from './types';
import './styles/dashboard.css';

const dashboardOptions: DashboardOptions = {
  widgetDefinitions: [
    { name: 'clock', title: 'Clock Widget' },
    { name: 'chart', title: 'Chart Widget', enableVerticalResize: true },
    { name: 'table', title: 'Data Table', size: { width: '50%' } },
  ],
  defaultWidgets: [
    { name: 'clock' },
    { name: 'chart' },
  ],
  widgetButtons: true,
};

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard Demo</h1>
      <Dashboard options={dashboardOptions}>
        {(widget) => (
          <div style={{ padding: '10px', minHeight: '80px' }}>
            <p>{widget.title} content area</p>
          </div>
        )}
      </Dashboard>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
