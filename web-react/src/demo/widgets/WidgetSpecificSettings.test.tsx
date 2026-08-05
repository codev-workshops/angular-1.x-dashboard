import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetSpecificSettings } from './WidgetSpecificSettings';

describe('WidgetSpecificSettings', () => {
  it('renders modal markup and handles edit, cancel, and ok', () => {
    const onChange = vi.fn();
    const onOk = vi.fn();
    const onCancel = vi.fn();
    render(<WidgetSpecificSettings result={{ title: 'Title' }} onChange={onChange} onOk={onOk} onCancel={onCancel} />);
    expect(screen.getByText('Custom Settings for a special widget')).toBeInTheDocument();
    expect(screen.getByText('fuhget about it')).toBeInTheDocument();
    expect(screen.getByText('hell yea')).toBeInTheDocument();
    const input = screen.getByDisplayValue('Title');
    expect(input).toHaveAttribute('ng-model', 'result.title');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText('fuhget about it'));
    fireEvent.click(screen.getByText('hell yea'));
    expect(onChange).toHaveBeenCalledWith({ title: 'Changed' });
    expect(onCancel).toHaveBeenCalled();
    expect(onOk).toHaveBeenCalled();
  });
});
