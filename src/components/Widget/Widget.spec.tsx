import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Widget } from './Widget';
import { WidgetModel } from '../../models/WidgetModel';

describe('Widget component', () => {
  let widget: WidgetModel;

  beforeEach(() => {
    widget = new WidgetModel({
      name: 'test-widget',
      title: 'My Widget',
      enableVerticalResize: true,
    });
  });

  it('should render widget title', () => {
    render(<Widget widget={widget} />);
    expect(screen.getByText('My Widget')).toBeInTheDocument();
  });

  it('should render widget name label', () => {
    render(<Widget widget={widget} />);
    expect(screen.getByText('test-widget')).toBeInTheDocument();
  });

  it('should hide widget name when hideWidgetName is true', () => {
    render(<Widget widget={widget} hideWidgetName={true} />);
    expect(screen.queryByText('test-widget')).not.toBeInTheDocument();
  });

  it('should show remove button by default', () => {
    const { container } = render(<Widget widget={widget} />);
    expect(container.querySelector('.glyphicon-remove')).toBeInTheDocument();
  });

  it('should hide remove button when hideClose is true', () => {
    const { container } = render(<Widget widget={widget} hideClose={true} />);
    expect(container.querySelector('.glyphicon-remove')).not.toBeInTheDocument();
  });

  it('should show settings button by default', () => {
    const { container } = render(<Widget widget={widget} />);
    expect(container.querySelector('.glyphicon-cog')).toBeInTheDocument();
  });

  it('should hide settings button when hideSettings is true', () => {
    const { container } = render(<Widget widget={widget} hideSettings={true} />);
    expect(container.querySelector('.glyphicon-cog')).not.toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', () => {
    const onRemove = jest.fn();
    const { container } = render(<Widget widget={widget} onRemove={onRemove} />);
    fireEvent.click(container.querySelector('.glyphicon-remove')!);
    expect(onRemove).toHaveBeenCalledWith(widget);
  });

  it('should call onSettingsOpen when settings button is clicked', () => {
    const onSettingsOpen = jest.fn();
    const { container } = render(<Widget widget={widget} onSettingsOpen={onSettingsOpen} />);
    fireEvent.click(container.querySelector('.glyphicon-cog')!);
    expect(onSettingsOpen).toHaveBeenCalledWith(widget);
  });

  it('should toggle content visibility when collapse button is clicked', () => {
    const { container } = render(<Widget widget={widget} />);
    const content = container.querySelector('.widget-content') as HTMLElement;
    expect(content.style.display).toEqual('block');

    const collapseBtn = container.querySelector('.glyphicon-minus')!;
    fireEvent.click(collapseBtn);
    expect(content.style.display).toEqual('none');
  });

  it('should enter edit mode on title double-click', () => {
    render(<Widget widget={widget} />);
    fireEvent.doubleClick(screen.getByText('My Widget'));
    expect(screen.getByDisplayValue('My Widget')).toBeInTheDocument();
  });

  it('should save title on form submit', () => {
    const onChanged = jest.fn();
    render(<Widget widget={widget} onChanged={onChanged} />);
    fireEvent.doubleClick(screen.getByText('My Widget'));
    const input = screen.getByDisplayValue('My Widget');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.submit(input.closest('form')!);
    expect(widget.title).toEqual('New Title');
    expect(onChanged).toHaveBeenCalledWith(widget);
  });

  describe('resize handles', () => {
    it('should render horizontal resize handles', () => {
      const { container } = render(<Widget widget={widget} />);
      expect(container.querySelector('.w-resizer')).toBeInTheDocument();
      expect(container.querySelector('.e-resizer')).toBeInTheDocument();
    });

    it('should render vertical resize handles when enableVerticalResize is true', () => {
      const { container } = render(<Widget widget={widget} />);
      expect(container.querySelector('.n-resizer')).toBeInTheDocument();
      expect(container.querySelector('.s-resizer')).toBeInTheDocument();
      expect(container.querySelector('.nw-resizer')).toBeInTheDocument();
      expect(container.querySelector('.ne-resizer')).toBeInTheDocument();
      expect(container.querySelector('.sw-resizer')).toBeInTheDocument();
      expect(container.querySelector('.se-resizer')).toBeInTheDocument();
    });

    it('should not render vertical resize handles when enableVerticalResize is false', () => {
      const noVertWidget = new WidgetModel({
        name: 'no-vert',
        title: 'No Vertical',
        enableVerticalResize: false,
      });
      const { container } = render(<Widget widget={noVertWidget} />);
      expect(container.querySelector('.w-resizer')).toBeInTheDocument();
      expect(container.querySelector('.e-resizer')).toBeInTheDocument();
      expect(container.querySelector('.n-resizer')).not.toBeInTheDocument();
      expect(container.querySelector('.s-resizer')).not.toBeInTheDocument();
    });
  });

  it('should render children content', () => {
    render(
      <Widget widget={widget}>
        <div data-testid="child-content">Hello</div>
      </Widget>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should apply drag listeners to widget header', () => {
    const dragListeners = { 'data-testid': 'drag-handle' };
    const { container } = render(<Widget widget={widget} dragListeners={dragListeners} />);
    expect(container.querySelector('[data-testid="drag-handle"]')).toBeInTheDocument();
  });
});
