import React, { useState, useEffect, useRef } from 'react';

export default function ResizableWidget() {
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        const parent = ref.current.closest('.widget-content');
        if (parent) {
          setDims({ width: parent.offsetWidth, height: parent.offsetHeight });
        }
      }
    };
    update();

    const handler = () => update();
    const el = ref.current?.closest('.widget-container');
    if (el) el.addEventListener('widgetResized', handler);
    window.addEventListener('resize', handler);

    return () => {
      if (el) el.removeEventListener('widgetResized', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);

  return (
    <div ref={ref}>
      <p>Width: {dims.width}px</p>
      <p>Height: {dims.height}px</p>
    </div>
  );
}
