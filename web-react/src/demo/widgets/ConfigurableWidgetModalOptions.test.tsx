import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigurableWidgetModalOptions } from './ConfigurableWidgetModalOptions';

describe('ConfigurableWidgetModalOptions', () => {
  it('renders the form and emits changes', () => {
    const onChange = vi.fn();
    render(<ConfigurableWidgetModalOptions result={{ dataModelOptions: { limit: 100 } }} onChange={onChange} />);
    const input = screen.getByDisplayValue('100');
    expect(input).toHaveAttribute('ng-model', 'result.dataModelOptions.limit');
    expect(screen.getByText('Random Limit')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: '25' } });
    expect(onChange).toHaveBeenCalledWith({ dataModelOptions: { limit: '25' } });
  });
});
