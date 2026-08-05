// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDashboardEvents } from './events';
import {
  ModalProvider,
  SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL,
  useModal,
  useWidgetSettings,
  WIDGET_SPECIFIC_SETTINGS_TEMPLATE_URL,
} from './useModal';
import type { WidgetModelLike } from './models/types';

const widget: WidgetModelLike = { uid: 'one', title: 'Before', name: 'demo', serialize: () => ({}) };

afterEach(() => {
  cleanup();
  document.body.className = '';
});

function OutsideProvider(): JSX.Element {
  useModal();
  return <div />;
}

function MissingLauncher({ onDismiss }: { onDismiss: (reason: unknown) => void }): JSX.Element {
  const { open } = useModal();
  return (
    <>
      <button type="button" onClick={() => open({ templateUrl: WIDGET_SPECIFIC_SETTINGS_TEMPLATE_URL }).result.catch(onDismiss)}>Widget broken</button>
      <button type="button" onClick={() => open({ templateUrl: SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL }).result.catch(onDismiss)}>Layout broken</button>
    </>
  );
}

function DispatchHarness({
  options,
  events,
  target,
}: {
  options: Parameters<typeof useWidgetSettings>[0]['options'];
  events: ReturnType<typeof createDashboardEvents>;
  target: WidgetModelLike;
}): JSX.Element {
  const dispatch = useWidgetSettings({ options, events });
  return <button type="button" onClick={() => dispatch(target)}>Dispatch</button>;
}

function ClosableContent({ close, label }: { close: () => void; label: string }): JSX.Element {
  return <button type="button" onClick={() => close()}>{label}</button>;
}

describe('useModal', () => {
  it('throws when used outside a ModalProvider', () => {
    expect(() => render(<OutsideProvider />)).toThrow('useModal must be used within a ModalProvider');
  });

  it('warns and rejects both broken Angular keys without rendering', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const dismiss = vi.fn();
    render(<ModalProvider><MissingLauncher onDismiss={dismiss} /></ModalProvider>);
    fireEvent.click(screen.getByText('Widget broken'));
    expect(screen.getByText('Widget broken')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Layout broken'));
    await vi.waitFor(() => expect(dismiss).toHaveBeenCalledTimes(2));
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(WIDGET_SPECIFIC_SETTINGS_TEMPLATE_URL));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL));
    warn.mockRestore();
  });

  it('uses widget settings defaults in widget, dashboard, then built-in order', () => {
    const events = createDashboardEvents();
    const dashboardWidget: WidgetModelLike = { ...widget, settingsModalOptions: {} };
    const WidgetLayer = ({ close }: { close: () => void }): JSX.Element => <ClosableContent close={close} label="widget-layer" />;
    const DashboardLayer = ({ close }: { close: () => void }): JSX.Element => <ClosableContent close={close} label="dashboard-layer" />;
    const registry = {
      'widget-layer': WidgetLayer,
      'dashboard-layer': DashboardLayer,
    };
    const options = {
      settingsModalOptions: { templateUrl: 'dashboard-layer', controller: 'DashboardCtrl' },
    };
    render(
      <ModalProvider registry={registry}>
        <DispatchHarness options={options} events={events} target={dashboardWidget} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Dispatch'));
    expect(screen.getByText('dashboard-layer')).toBeInTheDocument();
    fireEvent.click(screen.getByText('dashboard-layer'));
    cleanup();

    const widgetLayer = { ...widget, settingsModalOptions: { templateUrl: 'widget-layer', controller: 'WidgetCtrl' } };
    render(
      <ModalProvider registry={registry}>
        <DispatchHarness options={options} events={events} target={widgetLayer} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Dispatch'));
    expect(screen.getByText('widget-layer')).toBeInTheDocument();
    fireEvent.click(screen.getByText('widget-layer'));
    cleanup();

    const builtInOptions = { settingsModalOptions: {} };
    render(
      <ModalProvider>
        <DispatchHarness options={builtInOptions} events={events} target={dashboardWidget} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Dispatch'));
    expect(screen.getByText('Widget Options')).toBeInTheDocument();
  });

  it('dispatches widget settings and emits only after close', async () => {
    const onClose = vi.fn();
    const onDismiss = vi.fn();
    const events = createDashboardEvents();
    const actualEmit = vi.spyOn(events, 'emit');
    function Dispatch(): JSX.Element {
      return <DispatchHarness options={{ onSettingsClose: onClose, onSettingsDismiss: onDismiss }} events={events} target={widget} />;
    }
    render(<ModalProvider><Dispatch /></ModalProvider>);
    fireEvent.click(screen.getByText('Dispatch'));
    fireEvent.change(screen.getByDisplayValue('Before'), { target: { value: 'After' } });
    fireEvent.click(screen.getByText('OK'));
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ title: 'After' }), widget, {});
    expect(actualEmit).toHaveBeenCalledWith('widgetChanged', widget);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('runs the dismiss branch when a broken layout modal rejects', async () => {
    const dismissBranch = vi.fn();
    function LayoutConsumer(): JSX.Element {
      const { open } = useModal();
      return <button type="button" onClick={() => open({ templateUrl: SAVE_CHANGES_MODAL_BROKEN_TEMPLATE_URL }).result.then(() => undefined, dismissBranch)}>Open layout</button>;
    }
    render(<ModalProvider><LayoutConsumer /></ModalProvider>);
    fireEvent.click(screen.getByText('Open layout'));
    await vi.waitFor(() => expect(dismissBranch).toHaveBeenCalledWith(expect.any(Error)));
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
  });
});
