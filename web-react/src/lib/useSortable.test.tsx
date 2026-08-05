import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef, useState } from 'react';
import { useSortable } from './useSortable';

afterEach(cleanup);

function Harness({ options = {} }: { options?: { handle?: string; distance?: number; stop?: () => void } }): JSX.Element {
  const [items, setItems] = useState(['one', 'two', 'three']);
  const ref = useRef<HTMLDivElement>(null);
  useSortable({
    containerRef: ref,
    items,
    itemSelector: '.item',
    options,
    onReorder: (from, to) => {
      const next = items.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      setItems(next);
    },
  });
  return <div ref={ref}>{items.map((item) => <div className="item" data-name={item} key={item}><span className="handle">{item}</span></div>)}</div>;
}

function mockLayout(container: HTMLElement): void {
  Array.from(container.querySelectorAll<HTMLElement>('.item')).forEach((item, index) => {
    item.getBoundingClientRect = () => ({
      x: 0, y: index * 100, top: index * 100, left: 0, right: 100, bottom: index * 100 + 80,
      width: 100, height: 80, toJSON: () => ({}),
    });
  });
}

describe('useSortable', () => {
  it('does nothing before the distance threshold', () => {
    const stop = vi.fn();
    const { container } = render(<Harness options={{ handle: '.handle', distance: 5, stop }} />);
    mockLayout(container);
    const first = container.querySelector('.item') as HTMLElement;
    fireEvent.mouseDown(first.querySelector('.handle') as HTMLElement, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 12, clientY: 12 });
    fireEvent.mouseUp(window);
    expect(container.querySelector('[data-name="one"]')).toBe(first);
    expect(stop).not.toHaveBeenCalled();
  });

  it('requires the configured handle', () => {
    const stop = vi.fn();
    const { container } = render(<Harness options={{ handle: '.handle', distance: 5, stop }} />);
    mockLayout(container);
    const first = container.querySelector('.item') as HTMLElement;
    fireEvent.mouseDown(first, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 100 });
    fireEvent.mouseUp(window);
    expect(container.querySelector('[data-name="one"]')).toBe(first);
    expect(stop).not.toHaveBeenCalled();
  });

  it('reorders on a completed drag and stops once', () => {
    const stop = vi.fn();
    const { container } = render(<Harness options={{ handle: '.handle', distance: 5, stop }} />);
    mockLayout(container);
    const first = container.querySelector('.item') as HTMLElement;
    fireEvent.mouseDown(first.querySelector('.handle') as HTMLElement, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 20 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 180 });
    fireEvent.mouseUp(window);
    expect(Array.from(container.querySelectorAll<HTMLElement>('.item')).map((item) => item.dataset.name)).toEqual(['two', 'one', 'three']);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape without reordering or stopping', () => {
    const stop = vi.fn();
    const { container } = render(<Harness options={{ handle: '.handle', distance: 5, stop }} />);
    mockLayout(container);
    const first = container.querySelector('.item') as HTMLElement;
    fireEvent.mouseDown(first.querySelector('.handle') as HTMLElement, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 180 });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(Array.from(container.querySelectorAll<HTMLElement>('.item')).map((item) => item.dataset.name)).toEqual(['one', 'two', 'three']);
    expect(stop).not.toHaveBeenCalled();
  });

  it('removes window listeners when unmounted', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { container, unmount } = render(<Harness />);
    const first = container.querySelector('.item') as HTMLElement;
    fireEvent.mouseDown(first, { button: 0, clientX: 10, clientY: 10 });
    unmount();
    expect(remove).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(add).toHaveBeenCalledWith('mousemove', expect.any(Function));
    add.mockRestore();
    remove.mockRestore();
  });
});
