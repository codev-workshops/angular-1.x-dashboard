import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CustomSettingsTemplate } from './CustomSettingsTemplate';

describe('CustomSettingsTemplate', () => {
  it('renders optional partials and modal actions', () => {
    const onChange = vi.fn();
    const onOk = vi.fn();
    const onCancel = vi.fn();
    const renderPartial = vi.fn((url: string) => <div data-testid="partial">{url}</div>);
    const { rerender } = render(<CustomSettingsTemplate widget={{ title: 'Widget' }} result={{ title: 'Title' }} onChange={onChange} onOk={onOk} onCancel={onCancel} renderPartial={renderPartial} />);
    expect(screen.getByText('Custom Settings Dialog for')).toBeInTheDocument();
    expect(screen.queryByTestId('partial')).not.toBeInTheDocument();
    rerender(<CustomSettingsTemplate widget={{ title: 'Widget', partialSettingTemplateUrl: 'settings.html' }} result={{ title: 'Title' }} onChange={onChange} onOk={onOk} onCancel={onCancel} renderPartial={renderPartial} />);
    expect(screen.getByTestId('partial')).toHaveTextContent('settings.html');
    const input = screen.getByDisplayValue('Title');
    expect(input).toHaveAttribute('ng-model', 'result.title');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('OK'));
    expect(onChange).toHaveBeenCalledWith({ title: 'Changed' });
    expect(onCancel).toHaveBeenCalled();
    expect(onOk).toHaveBeenCalled();
  });
});
