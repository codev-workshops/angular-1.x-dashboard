import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Widget } from './Widget';
import { WidgetModel } from '../models/WidgetModel';

function renderWidget() {
  const widget = new WidgetModel({ name: 'reference', directive: 'reference', title: 'Widget 1' });
  const Component = () => <div>Reference content</div>;
  const onRemove = vi.fn();
  const onOpenSettings = vi.fn();
  return {
    ...render(
      <Widget
        widget={widget}
        options={{}}
        scope={{}}
        registry={{ reference: Component }}
        onRemove={onRemove}
        onOpenSettings={onOpenSettings}
        onWidgetChanged={vi.fn()}
      />,
    ),
    onRemove,
    onOpenSettings,
  };
}

afterEach(() => cleanup());

describe('Widget', () => {
  it('renders the shell and content', () => {
    renderWidget();
    expect(screen.getByText('Widget 1')).toBeInTheDocument();
    expect(screen.getByText('Reference content')).toBeInTheDocument();
    expect(document.querySelector('.widget-container')).toBeInTheDocument();
  });

  it('edits a title and toggles content', () => {
    renderWidget();
    fireEvent.doubleClick(screen.getAllByText('Widget 1')[0]);
    const input = screen.getByDisplayValue('Widget 1');
    fireEvent.change(input, { target: { value: 'Renamed' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText('Renamed')).toBeInTheDocument();
    fireEvent.click(document.querySelector('.glyphicon-minus')!);
    expect(document.querySelector('.widget-content')).toHaveStyle({ display: 'none' });
  });

  it('fires remove and settings controls', () => {
    const { onRemove, onOpenSettings } = renderWidget();
    fireEvent.click(document.querySelector('.glyphicon-remove')!);
    fireEvent.click(document.querySelector('.glyphicon-cog')!);
    expect(onRemove).toHaveBeenCalled();
    expect(onOpenSettings).toHaveBeenCalled();
  });
});
