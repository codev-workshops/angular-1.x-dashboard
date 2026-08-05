import { useState } from 'react';
import { LayoutsDemo } from '../pages/LayoutsDemo';
import { LayoutsExplicitSaveDemo } from '../pages/LayoutsExplicitSaveDemo';

export function LayoutsHarness(): JSX.Element {
  const [explicitSave, setExplicitSave] = useState(false);
  return (
    <main>
      <div className="btn-group">
        <button type="button" className="btn btn-default" onClick={() => setExplicitSave(false)}>layouts</button>
        <button type="button" className="btn btn-default" onClick={() => setExplicitSave(true)}>layouts explicit saving</button>
      </div>
      {explicitSave ? <LayoutsExplicitSaveDemo /> : <LayoutsDemo />}
    </main>
  );
}
