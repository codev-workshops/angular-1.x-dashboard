import React from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import SimpleDemo from './pages/SimpleDemo';
import ResizeDemo from './pages/ResizeDemo';
import CustomSettingsDemo from './pages/CustomSettingsDemo';
import ExplicitSaveDemo from './pages/ExplicitSaveDemo';
import LayoutsDemo from './pages/LayoutsDemo';
import LayoutsExplicitSaveDemo from './pages/LayoutsExplicitSaveDemo';
import DynamicOptionsDemo from './pages/DynamicOptionsDemo';
import DynamicDataDemo from './pages/DynamicDataDemo';

const ROUTES = [
  { path: '/simple', label: 'Simple', description: 'Simple demo showcasing basic widget functionality with time and random data widgets.', component: SimpleDemo },
  { path: '/resize', label: 'Resize', description: 'Demonstrates widget resizing by dragging edges and corners. Includes fixed aspect ratio widgets.', component: ResizeDemo },
  { path: '/custom-settings', label: 'Custom Settings', description: 'Shows custom widget settings modals, including partial template overrides and full template overrides.', component: CustomSettingsDemo },
  { path: '/explicit-saving', label: 'Explicit Saving', description: 'Dashboard changes are not automatically saved. Use the Save button to persist changes.', component: ExplicitSaveDemo },
  { path: '/layouts', label: 'Layouts', description: 'Multiple dashboard layouts with tabs. Create, rename, remove, and switch between layouts.', component: LayoutsDemo },
  { path: '/layouts-explicit-saving', label: 'Layouts (Explicit)', description: 'Dashboard layouts with explicit saving. A confirmation modal appears when switching tabs with unsaved changes.', component: LayoutsExplicitSaveDemo },
  { path: '/dynamic-options', label: 'Dynamic Options', description: 'Dynamically change widget type at runtime. Toggle between list and thumbnail views.', component: DynamicOptionsDemo },
  { path: '/dynamic-data', label: 'Dynamic Data', description: 'Widgets that share a dynamic data model (shopping cart). Add items and see both detail and summary update.', component: DynamicDataDemo },
];

export default function App() {
  const location = useLocation();
  const currentRoute = ROUTES.find(r => r.path === location.pathname);

  return (
    <div>
      <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">Dashboard Demo</a>
          </div>
          <ul className="nav navbar-nav">
            {ROUTES.map(route => (
              <li key={route.path} className={location.pathname === route.path ? 'active' : ''}>
                <NavLink to={route.path}>{route.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {currentRoute && (
        <div className="alert alert-info" style={{ marginBottom: 15 }}>
          <strong>{currentRoute.label}:</strong> {currentRoute.description}
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/simple" replace />} />
        {ROUTES.map(route => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
      </Routes>
    </div>
  );
}
