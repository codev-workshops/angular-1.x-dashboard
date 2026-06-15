import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import { WidgetModel } from '../../models/WidgetModel';

describe('WidgetSettingsModal', () => {
  let widget: WidgetModel;
  let onClose: jest.Mock;
  let onDismiss: jest.Mock;

  beforeEach(() => {
    widget = new WidgetModel({ name: 'test-widget', title: 'Test Widget' });
    onClose = jest.fn();
    onDismiss = jest.fn();
  });

  it('should render modal with widget title', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    expect(screen.getByText('Widget Options')).toBeInTheDocument();
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('should display the widget title in the input field', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    const input = screen.getByDisplayValue('Test Widget');
    expect(input).toBeInTheDocument();
  });

  it('should call onClose with result when OK is clicked', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByText('OK'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Widget', name: 'test-widget' })
    );
  });

  it('should call onDismiss when Cancel is clicked', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onDismiss).toHaveBeenCalledWith('cancel');
  });

  it('should call onDismiss when close button (×) is clicked', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByText('×'));
    expect(onDismiss).toHaveBeenCalledWith('cancel');
  });

  it('should allow editing the title and include it in result', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    const input = screen.getByDisplayValue('Test Widget');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.click(screen.getByText('OK'));
    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Title' })
    );
  });

  it('should deep clone widget properties so mutations do not affect original', () => {
    widget.dataModelOptions = { key: 'value' };
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByText('OK'));
    const result = onClose.mock.calls[0][0];
    expect(result.dataModelOptions).toEqual({ key: 'value' });
    expect(result.dataModelOptions).not.toBe(widget.dataModelOptions);
  });

  it('should render custom children inside the form', () => {
    render(
      <WidgetSettingsModal widget={widget} onClose={onClose} onDismiss={onDismiss}>
        <div data-testid="custom-field">Custom Settings</div>
      </WidgetSettingsModal>
    );
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();
  });
});
