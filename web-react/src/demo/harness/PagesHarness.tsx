import { Link, Route, Routes } from 'react-router-dom';
import { NavBar } from '../NavBar';
import { SimpleDemo } from '../pages/SimpleDemo';
import { ResizeDemo } from '../pages/ResizeDemo';
import { CustomSettingsDemo } from '../pages/CustomSettingsDemo';
import { ExplicitSaveDemo } from '../pages/ExplicitSaveDemo';
import { DynamicOptionsDemo } from '../pages/DynamicOptionsDemo';
import { DynamicDataDemo } from '../pages/DynamicDataDemo';

export function PagesHarness(): JSX.Element {
  const pages = [
    { path: 'simple', title: 'simple' },
    { path: 'resize', title: 'resize' },
    { path: 'custom-settings', title: 'custom widget settings' },
    { path: 'explicit-saving', title: 'explicit saving' },
    { path: 'dynamic-options', title: 'dynamic options' },
    { path: 'dynamic-data', title: 'dynamic data' },
  ];
  return (
    <Routes>
      <Route path="/" element={<main><h1>Wave 4b pages</h1><ul>{pages.map((page) => <li key={page.path}><Link to={page.path}>{page.title}</Link></li>)}</ul></main>} />
      <Route path="/simple" element={<><NavBar path="/" /><SimpleDemo /></>} />
      <Route path="/resize" element={<><NavBar path="/resize" /><ResizeDemo /></>} />
      <Route path="/custom-settings" element={<><NavBar path="/custom-settings" /><CustomSettingsDemo /></>} />
      <Route path="/explicit-saving" element={<><NavBar path="/explicit-saving" /><ExplicitSaveDemo /></>} />
      <Route path="/dynamic-options" element={<><NavBar path="/dynamic-options" /><DynamicOptionsDemo /></>} />
      <Route path="/dynamic-data" element={<><NavBar path="/dynamic-data" /><DynamicDataDemo /></>} />
    </Routes>
  );
}
