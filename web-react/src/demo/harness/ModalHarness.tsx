import { useEffect, useMemo, useState } from 'react';
import type { WidgetModelLike } from '../../lib/models/types';
import { createDashboardEvents } from '../../lib/events';
import type { WidgetSettingsPartialProps } from '../../lib/components/WidgetSettingsModal';
import {
  ModalProvider,
  useModal,
  useWidgetSettings,
  type ModalContentProps,
  type ModalRegistry,
  type WidgetSettingsPartialRegistry,
} from '../../lib/useModal';

const partialUrl = 'app/template/configurableWidgetModalOptions.html';

const fakeWidget = (withPartial = false): WidgetModelLike => ({
  uid: 'modal-harness-widget',
  name: 'configurable widget',
  title: 'Widget 1',
  dataModelOptions: { limit: 10 },
  settingsModalOptions: withPartial ? { partialTemplateUrl: partialUrl } : {},
  serialize: () => ({}),
});

function ConfigurablePartial({ result, updateResult }: WidgetSettingsPartialProps): JSX.Element {
  const limit = typeof result.dataModelOptions?.limit === 'number' ? result.dataModelOptions.limit : '';
  return (
    <div className="form-group">
      <label className="col-sm-2 control-label">Random Limit</label>
      <div className="col-sm-10">
        <input
          type="text"
          className="form-control"
          name="widgetTitle"
          ng-model="result.dataModelOptions.limit"
          value={limit}
          onChange={(event) => updateResult((draft) => {
            draft.dataModelOptions = { ...(draft.dataModelOptions ?? {}), limit: event.target.value };
          })}
        />
      </div>
    </div>
  );
}

function OverrideModal({ close, dismiss, resolve }: ModalContentProps): JSX.Element {
  const widget = resolve.widget as WidgetModelLike;
  return (
    <>
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()" onClick={() => dismiss('cancel')}>&times;</button>
        <h3>Custom Settings for a special widget</h3>
      </div>
      <div className="modal-body">
        <form name="form" noValidate className="form-horizontal">
          <p>I override the entire widget settings modal template. This can be used for maximum customization!</p>
          <div className="form-group">
            <label htmlFor="widgetTitle" className="col-sm-2 control-label">Title</label>
            <div className="col-sm-10">
              <input type="text" className="form-control" name="widgetTitle" ng-model="result.title" defaultValue={widget.title} />
            </div>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-default" ng-click="cancel()" onClick={() => dismiss('cancel')}>fuhget about it</button>
        <button type="button" className="btn btn-primary" ng-click="ok()" onClick={() => close()}>hell yea</button>
      </div>
    </>
  );
}

function ModalHarnessContent(): JSX.Element {
  const { open } = useModal();
  const events = useMemo(() => createDashboardEvents(), []);
  const [outcome, setOutcome] = useState('No modal result yet');
  const options = useMemo(() => ({
    settingsModalOptions: {},
    onSettingsClose: (result: unknown) => setOutcome(`widget close: ${JSON.stringify(result)}`),
    onSettingsDismiss: (reason: unknown) => setOutcome(`widget dismiss: ${String(reason)}`),
  }), []);
  const dispatchSettings = useWidgetSettings({ options, events });
  useEffect(() => events.on('widgetChanged', () => setOutcome('widgetChanged emitted')), [events]);
  const widget = useMemo(() => fakeWidget(), []);
  const partialWidget = useMemo(() => fakeWidget(true), []);
  const layout = useMemo(() => ({
    title: 'Dashboard 1',
    dashboard: { unsavedChangeCount: 3 },
  }), []);
  const showResult = (label: string, modal: { result: Promise<unknown> }): void => {
    modal.result.then(
      (value) => setOutcome(`${label} close: ${JSON.stringify(value)}`),
      (reason) => setOutcome(`${label} dismiss: ${String(reason)}`),
    );
  };
  const openWidget = (): void => showResult('default', open({
    templateUrl: 'components/directives/dashboard/widget-settings-template.html',
    controller: 'WidgetSettingsCtrl',
    resolve: { widget },
  }));
  const openPartial = (): void => showResult('partial', open({
    templateUrl: 'components/directives/dashboard/widget-settings-template.html',
    controller: 'WidgetSettingsCtrl',
    resolve: { widget: partialWidget },
  }));
  const openOverride = (): void => showResult('override', open({
    templateUrl: 'app/template/widgetSpecificSettings.html',
    controller: 'SpecialSettingsCtrl',
    resolve: { widget },
  }));
  const openNoBackdrop = (): void => showResult('no backdrop', open({
    templateUrl: 'components/directives/dashboard/widget-settings-template.html',
    resolve: { widget },
    backdrop: false,
  }));
  const openSaveChanges = (): void => showResult('save changes', open({
    templateUrl: 'components/directives/dashboardLayouts/SaveChangesModal.html',
    controller: 'SaveChangesModalCtrl',
    resolve: { layout },
  }));
  const openBroken = (): void => showResult('broken', open({
    templateUrl: 'template/SaveChangesModal.html',
    controller: 'SaveChangesModalCtrl',
    resolve: { layout },
  }));
  return (
    <div>
      <button type="button" onClick={openWidget}>Open widget settings</button>
      <button type="button" onClick={openPartial}>Open partial widget settings</button>
      <button type="button" onClick={openOverride}>Open overridden settings</button>
      <button type="button" onClick={openNoBackdrop}>Open without backdrop</button>
      <button type="button" onClick={openSaveChanges}>Open save changes</button>
      <button type="button" onClick={openBroken}>Open broken key</button>
      <button type="button" onClick={() => dispatchSettings(widget)}>Dispatch widget settings</button>
      <p data-testid="modal-outcome">{outcome}</p>
    </div>
  );
}

export function ModalHarness(): JSX.Element {
  const registry: ModalRegistry = {
    'app/template/widgetSpecificSettings.html': OverrideModal,
  };
  const partials: WidgetSettingsPartialRegistry = { [partialUrl]: ConfigurablePartial };
  return (
    <ModalProvider registry={registry} partials={partials}>
      <ModalHarnessContent />
    </ModalProvider>
  );
}
