import { Route, Routes } from 'react-router-dom';
import { DashboardHarness } from './demo/harness/DashboardHarness';
import { FoundationHarness } from './demo/harness/FoundationHarness';
import { ModalHarness } from './demo/harness/ModalHarness';
import { LayoutsHarness } from './demo/harness/LayoutsHarness';
import { PagesHarness } from './demo/harness/PagesHarness';
import { ReferenceHarness } from './demo/harness/ReferenceHarness';
import { ResizeHarness } from './demo/harness/ResizeHarness';
import { SortableHarness } from './demo/harness/SortableHarness';
import { WidgetLibraryHarness } from './demo/harness/WidgetLibraryHarness';

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<div />} />
      <Route path="/__harness/reference" element={<ReferenceHarness />} />
      <Route path="/__harness/foundation" element={<FoundationHarness />} />
      <Route path="/__harness/dashboard" element={<DashboardHarness />} />
      <Route path="/__harness/modals" element={<ModalHarness />} />
      <Route path="/__harness/widgets" element={<WidgetLibraryHarness />} />
      <Route path="/__harness/resize" element={<ResizeHarness />} />
      <Route path="/__harness/sortable" element={<SortableHarness />} />
      <Route path="/__harness/layouts" element={<LayoutsHarness />} />
      <Route path="/__harness/pages/*" element={<PagesHarness />} />
      <Route path="/__harness/*" element={<div />} />
      <Route path="*" element={<div />} />
    </Routes>
  );
}
