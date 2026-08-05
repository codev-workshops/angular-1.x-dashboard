// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import type { WidgetModelLike } from '../models/types';

const widget = (): WidgetModelLike => ({
  uid: 'widget-1',
  title: 'Original',
  name: 'demo',
  dataModelOptions: { limit: 10 },
  serialize: () => ({}),
});

afterEach(() => cleanup());

describe('WidgetSettingsModal', () => {
  it('edits a clone and closes with the draft', () => {
    const source = widget();
    const close = vi.fn();
    render(<WidgetSettingsModal resolve={{ widget: source }} scope={{}} close={close} dismiss={vi.fn()} />);
    fireEvent.change(screen.getByDisplayValue('Original'), { target: { value: 'Changed' } });
    expect(source.title).toBe('Original');
    fireEvent.click(screen.getByText('OK'));
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ title: 'Changed' }));
  });

  it('renders the partial with authored attributes and dismisses on cancel', () => {
    const source = widget();
    source.settingsModalOptions = { partialTemplateUrl: 'partial' };
    const dismiss = vi.fn();
    const Partial = (): JSX.Element => <input ng-model="result.dataModelOptions.limit" />;
    render(
      <WidgetSettingsModal
        resolve={{ widget: source }}
        scope={{}}
        close={vi.fn()}
        dismiss={dismiss}
        partials={{ partial: Partial }}
      />,
    );
    expect(document.querySelector('[ng-if="widget.settingsModalOptions.partialTemplateUrl"]')).toBeInTheDocument();
    expect(document.querySelector('input[ng-model="result.dataModelOptions.limit"]')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(dismiss).toHaveBeenCalledWith('cancel');
  });

  it('dismisses with cancel from the close button', () => {
    const dismiss = vi.fn();
    render(<WidgetSettingsModal resolve={{ widget: widget() }} scope={{}} close={vi.fn()} dismiss={dismiss} />);
    fireEvent.click(document.querySelector('button.close')!);
    expect(dismiss).toHaveBeenCalledWith('cancel');
  });
});
