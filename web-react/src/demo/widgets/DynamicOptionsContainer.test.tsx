import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DynamicOptionsContainer } from './DynamicOptionsContainer';

describe('DynamicOptionsContainer', () => {
  it('toggles templates, preserves people, and removes a row', () => {
    const widget = { includeUrl: 'app/template/peopleList.html' };
    const { container } = render(<DynamicOptionsContainer widget={widget} widgetData={null} scope={{}} />);
    const listButton = screen.getByRole('button', { name: /^List$/ });
    const thumbnailButton = screen.getByRole('button', { name: /^Thumbnail$/ });
    expect(container.querySelectorAll('table.people tr')).toHaveLength(10);
    expect(listButton).toHaveClass('active');
    expect(listButton).toBeDisabled();
    fireEvent.click(thumbnailButton);
    expect(container.querySelectorAll('.people img')).toHaveLength(10);
    expect(container.querySelector('table.people')).not.toBeInTheDocument();
    expect(thumbnailButton).toHaveClass('active');
    expect(thumbnailButton).toBeDisabled();
    fireEvent.click(listButton);
    expect(container.querySelectorAll('table.people tr')).toHaveLength(10);
    fireEvent.click(container.querySelector('.glyphicon-remove')!.parentElement!);
    expect(container.querySelectorAll('table.people tr')).toHaveLength(9);
  });
});
