import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './demo/NavBar';
import { SimpleDemo } from './demo/pages/SimpleDemo';
import { ResizeDemo } from './demo/pages/ResizeDemo';
import { CustomSettingsDemo } from './demo/pages/CustomSettingsDemo';
import { ExplicitSaveDemo } from './demo/pages/ExplicitSaveDemo';
import { LayoutsDemo } from './demo/pages/LayoutsDemo';
import { LayoutsExplicitSaveDemo } from './demo/pages/LayoutsExplicitSaveDemo';
import { DynamicOptionsDemo } from './demo/pages/DynamicOptionsDemo';
import { DynamicDataDemo } from './demo/pages/DynamicDataDemo';

export function App(): JSX.Element {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<SimpleDemo />} />
        <Route path="/resize" element={<ResizeDemo />} />
        <Route path="/custom-settings" element={<CustomSettingsDemo />} />
        <Route path="/explicit-saving" element={<ExplicitSaveDemo />} />
        <Route path="/layouts" element={<LayoutsDemo />} />
        <Route path="/layouts/explicit-saving" element={<LayoutsExplicitSaveDemo />} />
        <Route path="/dynamic-options" element={<DynamicOptionsDemo />} />
        <Route path="/dynamic-data" element={<DynamicDataDemo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
