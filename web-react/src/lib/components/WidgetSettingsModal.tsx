import { cloneDeep } from 'lodash-es';
import { useState } from 'react';
import type { WidgetDefinition, WidgetModelLike } from '../models/types';
import type { ModalContentProps } from '../useModal';

export type WidgetSettingsPartialProps = {
  widget: WidgetModelLike;
  result: WidgetDefinition;
  updateResult: (mutate: (draft: WidgetDefinition) => void) => void;
};

function widgetFromResolve(resolve: ModalContentProps['resolve']): WidgetModelLike {
  const widget = resolve.widget;
  if (!widget || typeof widget !== 'object' || typeof (widget as WidgetModelLike).uid !== 'string') {
    throw new Error('WidgetSettingsModal requires resolve.widget');
  }
  return widget as WidgetModelLike;
}

export function WidgetSettingsModal({
  resolve,
  close,
  dismiss,
  partials = {},
}: ModalContentProps): JSX.Element {
  const widget = widgetFromResolve(resolve);
  const [result, setResult] = useState<WidgetDefinition>(() => cloneDeep(widget));
  const partialUrl = typeof widget.settingsModalOptions?.partialTemplateUrl === 'string'
    ? widget.settingsModalOptions.partialTemplateUrl
    : undefined;
  const Partial = partialUrl ? partials[partialUrl] : undefined;
  const updateResult = (mutate: (draft: WidgetDefinition) => void): void => {
    setResult((draft) => {
      const next = cloneDeep(draft);
      mutate(next);
      return next;
    });
  };
  return (
    <>
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()" onClick={() => dismiss('cancel')}>&times;</button>
        <h3>Widget Options <small>{widget.title}</small></h3>
      </div>
      <div className="modal-body">
        <form name="form" noValidate className="form-horizontal">
          <div className="form-group">
            <label htmlFor="widgetTitle" className="col-sm-2 control-label">Title</label>
            <div className="col-sm-10">
              <input
                type="text"
                className="form-control"
                name="widgetTitle"
                ng-model="result.title"
                value={result.title ?? ''}
                onChange={(event) => updateResult((draft) => { draft.title = event.target.value; })}
              />
            </div>
          </div>
          {partialUrl && (
            <div ng-if="widget.settingsModalOptions.partialTemplateUrl" ng-include="widget.settingsModalOptions.partialTemplateUrl">
              {Partial && <Partial widget={widget} result={result} updateResult={updateResult} />}
            </div>
          )}
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-default" ng-click="cancel()" onClick={() => dismiss('cancel')}>Cancel</button>
        <button type="button" className="btn btn-primary" ng-click="ok()" onClick={() => close(result)}>OK</button>
      </div>
    </>
  );
}
