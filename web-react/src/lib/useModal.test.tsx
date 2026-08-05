// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDashboardEvents } from './events';
import { ModalProvider, useModal, useWidgetSettings, WIDGET_SPECIFIC_SETTINGS_TEMPLATE_URL } from './useModal';
import type { WidgetModelLike } from './models/types';

function OpenButton({ onInstance }: { onInstance: (result: Promise<unknown>) => void }): JSX.Element {
  const { open } = useModal();
  return <button type="button" onClick={() => onInstance(open({ controller: 'missing' }).result)}>Open</button>;
}

const widget: WidgetModelLike = { uid: 'one', title: 'Before', name: 'demo', serialize: () => ({}) };

afterEach(() => {
  cleanup();
  document.body.className = '';
});

describe('useModal', () => {
  it('warns and rejects asynchronously without rendering a modal', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    let result!: Promise<unknown>;
    render(
      <ModalProvider>
        <OpenButton onInstance={(value) => { result = value; }} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open'));
    await expect(result).rejects.toBeInstanceOf(Error);
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
    expect(WIDGET_SPECIFIC_SETTINGS_TEMPLATE_URL).toBe('app/template/WidgetSpecificSettings.html');
    warn.mockRestore();
  });

  it('dispatches widget settings and emits only after close', async () => {
    const onClose = vi.fn();
    const onDismiss = vi.fn();
    const emit = vi.spyOn(createDashboardEvents(), 'emit');
    const events = createDashboardEvents();
    const actualEmit = vi.spyOn(events, 'emit');
    function Dispatch(): JSX.Element {
      const dispatch = useWidgetSettings({ options: { onSettingsClose: onClose, onSettingsDismiss: onDismiss }, events });
      return <button type="button" onClick={() => dispatch(widget)}>Dispatch</button>;
    }
    render(<ModalProvider><Dispatch /></ModalProvider>);
    fireEvent.click(screen.getByText('Dispatch'));
    fireEvent.change(screen.getByDisplayValue('Before'), { target: { value: 'After' } });
    fireEvent.click(screen.getByText('OK'));
    await Promise.resolve();
    expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ title: 'After' }), widget, {});
    expect(actualEmit).toHaveBeenCalledWith('widgetChanged', widget);
    expect(emit).not.toHaveBeenCalled();
  });
});
