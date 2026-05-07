import React, { useRef } from 'react';
import Dashboard from '../components/Dashboard';
import RandomDataModel from '../models/RandomDataModel';

function ConfigurableWidgetOptions({ result, setResult }) {
  return (
    <div className="form-group">
      <label className="col-sm-2 control-label">Random Limit</label>
      <div className="col-sm-10">
        <input
          type="text"
          className="form-control"
          value={(result.dataModelOptions && result.dataModelOptions.limit) || ''}
          onChange={(e) => setResult({
            ...result,
            dataModelOptions: { ...result.dataModelOptions, limit: parseInt(e.target.value) || 100 }
          })}
        />
      </div>
    </div>
  );
}

function WidgetSpecificSettings({ widget, result, setResult, onClose, onDismiss }) {
  return (
    <>
      <div className="modal-header">
        <button type="button" className="close" onClick={() => onDismiss('cancel')}>&times;</button>
        <h3>Custom Settings for a special widget</h3>
      </div>
      <div className="modal-body">
        <form name="form" noValidate className="form-horizontal">
          <p>I override the entire widget settings modal template. This can be used for maximum customization!</p>
          <div className="form-group">
            <label htmlFor="widgetTitle" className="col-sm-2 control-label">Title</label>
            <div className="col-sm-10">
              <input
                type="text"
                className="form-control"
                value={result.title || ''}
                onChange={(e) => setResult({ ...result, title: e.target.value })}
              />
            </div>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-default" onClick={() => onDismiss('cancel')}>fuhget about it</button>
        <button type="button" className="btn btn-primary" onClick={() => onClose(result)}>hell yea</button>
      </div>
    </>
  );
}

export default function CustomSettingsDemo() {
  const dashboardRef = useRef(null);

  const dashboardOptions = useRef({
    widgetButtons: true,
    widgetDefinitions: [
      {
        name: 'configurable',
        directive: 'wt-scope-watch',
        title: 'Configurable Random',
        dataModelType: RandomDataModel,
        dataModelOptions: { limit: 100 },
        size: { width: '33%' },
      },
      {
        name: 'override',
        directive: 'wt-scope-watch',
        title: 'Override Template',
        dataModelType: RandomDataModel,
        dataModelOptions: { limit: 50 },
        settingsModalOptions: {
          customTemplate: WidgetSpecificSettings,
        },
        size: { width: '33%' },
      },
    ],
    defaultWidgets: [
      { name: 'configurable' },
      { name: 'override' },
    ],
    settingsModalOptions: {
      partialTemplateContent: ConfigurableWidgetOptions,
    },
    useLocalStorage: true,
    storageId: 'demo_custom_settings',
    storageHash: 'cs1',
  }).current;

  return (
    <div className="row">
      <div className="col-md-12">
        <Dashboard options={dashboardOptions} dashboardRef={dashboardRef} />
      </div>
    </div>
  );
}
