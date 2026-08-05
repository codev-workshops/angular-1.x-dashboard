import type { ChangeEvent } from 'react';

export type ConfigurableResult = { dataModelOptions: { limit: unknown } };
export function ConfigurableWidgetModalOptions({ result, onChange }: { result: ConfigurableResult; onChange: (result: ConfigurableResult) => void }): JSX.Element {
  const change = (event: ChangeEvent<HTMLInputElement>): void => onChange({ ...result, dataModelOptions: { ...result.dataModelOptions, limit: event.target.value } });
  return <div className="form-group"><label className="col-sm-2 control-label">Random Limit</label><div className="col-sm-10"><input type="text" className="form-control" name="widgetTitle" value={String(result.dataModelOptions.limit ?? '')} onChange={change} ng-model="result.dataModelOptions.limit" /></div></div>;
}
