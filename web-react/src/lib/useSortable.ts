import { useEffect, useRef, type RefObject } from 'react';

export type SortableOptions = {
  handle?: string;
  distance?: number;
  stop?: () => void;
  disabled?: boolean;
};

export type UseSortableOptions<T> = {
  containerRef: RefObject<HTMLElement>;
  items: T[];
  itemSelector: string;
  onReorder: (from: number, to: number) => void;
  options?: SortableOptions;
};

type DragState = {
  item: HTMLElement;
  from: number;
  startX: number;
  startY: number;
  pointerX: number;
  pointerY: number;
  dragging: boolean;
  target: number;
  originalTransform: string;
  originalPosition: string;
  originalZIndex: string;
  originalWillChange: string;
};

function itemElements(container: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

function insertionIndex(
  container: HTMLElement,
  selector: string,
  dragged: HTMLElement,
  pointerX: number,
  pointerY: number,
  from: number,
): number {
  const siblings = itemElements(container, selector).filter((item) => item !== dragged);
  if (!siblings.length) return from;

  const containing = siblings.find((item) => {
    const rect = item.getBoundingClientRect();
    return pointerX >= rect.left && pointerX <= rect.right && pointerY >= rect.top && pointerY <= rect.bottom;
  });
  if (containing) {
    const rect = containing.getBoundingClientRect();
    const hasMultipleRows = itemElements(container, selector).some((item) => item.getBoundingClientRect().top !== rect.top);
    const before = hasMultipleRows
      ? pointerY < rect.top + rect.height / 2
      : pointerX < rect.left + rect.width / 2;
    const siblingIndex = siblings.indexOf(containing);
    return siblingIndex + (before ? 0 : 1);
  }

  const rects = siblings.map((item, index) => ({ item, index, rect: item.getBoundingClientRect() }));
  const allItems = itemElements(container, selector);
  const dominantAxis = allItems.some((item) => item.getBoundingClientRect().top
    !== allItems[0].getBoundingClientRect().top) ? 'y' : 'x';
  const target = rects.find(({ rect }) => dominantAxis === 'x'
    ? pointerX < rect.left + rect.width / 2
    : pointerY < rect.top + rect.height / 2);
  if (!target) return siblings.length;
  return target.index;
}

export function useSortable<T>({
  containerRef,
  items,
  itemSelector,
  onReorder,
  options = {},
}: UseSortableOptions<T>): void {
  const optionsRef = useRef(options);
  const reorderRef = useRef(onReorder);
  const itemsRef = useRef(items);
  optionsRef.current = options;
  reorderRef.current = onReorder;
  itemsRef.current = items;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let state: DragState | undefined;

    const clearVisuals = (): void => {
      if (!state) return;
      state.item.style.transform = state.originalTransform;
      state.item.style.position = state.originalPosition;
      state.item.style.zIndex = state.originalZIndex;
      state.item.style.willChange = state.originalWillChange;
    };
    const finish = (cancelled: boolean): void => {
      if (!state) return;
      const completed = state.dragging;
      const { from, target } = state;
      clearVisuals();
      state = undefined;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('keydown', keydown);
      if (!cancelled && completed) {
        if (from !== target) reorderRef.current(from, target);
        optionsRef.current.stop?.();
      }
    };
    const move = (event: MouseEvent): void => {
      if (!state) return;
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      const distance = Math.max(Math.abs(event.clientX - state.startX), Math.abs(event.clientY - state.startY));
      if (!state.dragging && distance >= (optionsRef.current.distance ?? 0)) {
        state.dragging = true;
        state.item.style.position = 'relative';
        state.item.style.zIndex = '1';
        state.item.style.willChange = 'transform';
      }
      if (!state.dragging) return;
      event.preventDefault();
      state.target = insertionIndex(container, itemSelector, state.item, event.clientX, event.clientY, state.from);
      state.item.style.transform = `translate(${event.clientX - state.startX}px, ${event.clientY - state.startY}px)`;
    };
    const up = (): void => finish(false);
    const keydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') finish(true);
    };
    const down = (event: MouseEvent): void => {
      if (event.button !== 0 || state || optionsRef.current.disabled) return;
      const item = (event.target as Element | null)?.closest(itemSelector);
      if (!(item instanceof HTMLElement) || !container.contains(item)) return;
      const handle = optionsRef.current.handle;
      if (handle && !(event.target as Element | null)?.closest(handle)) return;
      const from = itemElements(container, itemSelector).indexOf(item);
      if (from < 0 || from >= itemsRef.current.length) return;
      state = {
        item,
        from,
        startX: event.clientX,
        startY: event.clientY,
        pointerX: event.clientX,
        pointerY: event.clientY,
        dragging: false,
        target: from,
        originalTransform: item.style.transform,
        originalPosition: item.style.position,
        originalZIndex: item.style.zIndex,
        originalWillChange: item.style.willChange,
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      window.addEventListener('keydown', keydown);
    };
    container.addEventListener('mousedown', down);
    return () => {
      finish(true);
      container.removeEventListener('mousedown', down);
    };
  }, [containerRef, itemSelector]);
}
