import React, { useState, useRef } from 'react';
import Dashboard from '../components/Dashboard';

export default function DynamicOptionsDemo() {
  const [style, setStyle] = useState('peopleList');
  const dashboardRef = useRef(null);
  const [key, setKey] = useState(0);

  const getDashboardOptions = (widgetStyle) => ({
    widgetButtons: false,
    widgetDefinitions: [
      {
        name: widgetStyle,
        directive: widgetStyle,
        title: widgetStyle === 'peopleList' ? 'People (List)' : 'People (Thumbnail)',
        size: { width: '50%' },
      },
    ],
    defaultWidgets: [
      { name: widgetStyle },
    ],
    useLocalStorage: false,
    storageId: 'demo_dynamic_options',
    storageHash: 'do1',
    hideWidgetSettings: true,
    hideWidgetClose: true,
  });

  const [dashboardOptions, setDashboardOptions] = useState(() => getDashboardOptions('peopleList'));

  const toggleWidget = () => {
    const newStyle = style === 'peopleList' ? 'peopleThumbnail' : 'peopleList';
    setStyle(newStyle);
    setDashboardOptions(getDashboardOptions(newStyle));
    setKey(k => k + 1);
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <b>Change widget to:</b>
        <div className="btn-group" style={{ marginLeft: 10, marginBottom: 10 }}>
          <button
            className={'btn btn-default btn-sm' + (style === 'peopleList' ? ' active' : '')}
            disabled={style === 'peopleList'}
            onClick={toggleWidget}
          >List</button>
          <button
            className={'btn btn-default btn-sm' + (style === 'peopleThumbnail' ? ' active' : '')}
            disabled={style === 'peopleThumbnail'}
            onClick={toggleWidget}
          >Thumbnail</button>
        </div>
        <div style={{ paddingBottom: 12 }}>
          This methodology will destroy the existing widget and creates a new widget with new scope and data.
          Notice the names change as you toggle between the List and Thumbnail buttons.
        </div>
        <Dashboard key={key} options={dashboardOptions} dashboardRef={dashboardRef} />
      </div>
    </div>
  );
}
