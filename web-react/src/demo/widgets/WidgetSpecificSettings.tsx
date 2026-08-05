import type { ChangeEvent } from 'react';

export type WidgetSettingsResult = { title: string };
export function WidgetSpecificSettings({ result, onChange, onOk, onCancel }: { result: WidgetSettingsResult; onChange: (result: WidgetSettingsResult) => void; onOk: () => void; onCancel: () => void }): JSX.Element {
  const change = (event: ChangeEvent<HTMLInputElement>): void => onChange({ ...result, title: event.target.value });
  return <><div className="modal-header"><button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={onCancel}>&times;</button><h3>Custom Settings for a special widget</h3></div><div className="modal-body"><form name="form" noValidate className="form-horizontal"><p>I override the entire widget settings modal template. This can be used for maximum customization!</p><div className="form-group"><label htmlFor="widgetTitle" className="col-sm-2 control-label">Title</label><div className="col-sm-10"><input type="text" className="form-control" name="widgetTitle" value={result.title} onChange={change} ng-model="result.title" /></div></div></form></div><div className="modal-footer"><button type="button" className="btn btn-default" onClick={onCancel}>fuhget about it</button><button type="button" className="btn btn-primary" onClick={onOk}>hell yea</button></div></>;
}
