import { Route, Routes } from 'react-router-dom';
import { ReferenceHarness } from './demo/harness/ReferenceHarness';

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<div />} />
      <Route path="/__harness/reference" element={<ReferenceHarness />} />
      <Route path="/__harness/*" element={<div />} />
      <Route path="*" element={<div />} />
    </Routes>
  );
}
