// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ModalProvider, useModal } from '../useModal';

type ModalInstance = ReturnType<ReturnType<typeof useModal>['open']>;
type ModalOptions = Parameters<ReturnType<typeof useModal>['open']>[0];

function Launcher({
  options,
  onInstance,
}: {
  options?: ModalOptions;
  onInstance: (instance: ModalInstance) => void;
}): JSX.Element {
  const { open } = useModal();
  return <button type="button" onClick={() => onInstance(open(options ?? { controller: 'test' }))}>Open</button>;
}

function RegistryContent({ close, dismiss }: { close: (value?: unknown) => void; dismiss: (reason?: unknown) => void }): JSX.Element {
  return (
    <div>
      <button type="button" onClick={() => close('closed')}>Close content</button>
      <button type="button" onClick={() => dismiss('dismissed')}>Dismiss content</button>
    </div>
  );
}

function renderModal(options?: ModalOptions): { getInstance: () => ModalInstance } {
  let instance: ModalInstance | undefined;
  render(
    <ModalProvider registry={{ test: ({ close, dismiss }) => <RegistryContent close={close} dismiss={dismiss} /> }}>
      <Launcher options={options} onInstance={(value) => { instance = value; }} />
    </ModalProvider>,
  );
  fireEvent.click(screen.getByText('Open'));
  return {
    getInstance: () => {
      if (!instance) throw new Error('modal instance was not captured');
      return instance;
    },
  };
}

afterEach(() => {
  cleanup();
  document.body.className = '';
});

describe('Modal', () => {
  it('renders the portal shell, preserves body order, and closes on Escape', async () => {
    const { getInstance } = renderModal();
    expect(document.body.className).toBe('modal-open');
    expect(document.querySelector('.modal')?.parentElement).toBe(document.body);
    expect(document.querySelector('.modal')).toHaveAttribute('tabindex', '-1');
    expect(document.querySelector('.modal')).toHaveAttribute('role', 'dialog');
    expect(document.querySelector('.modal')).toHaveStyle({ zIndex: '1050', display: 'block' });
    expect(document.querySelector('.modal-backdrop')).toHaveStyle({ zIndex: '1040' });
    expect(document.body.children[0]).toBe(document.querySelector('.modal'));
    expect(document.body.children[1]).toBe(document.querySelector('.modal-backdrop'));
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(getInstance().result).rejects.toBe('escape key press');
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
    expect(document.body.className).toBe('');
  });

  it('dismisses on a real backdrop click but not a dialog-to-backdrop gesture', async () => {
    const { getInstance } = renderModal();
    const modal = document.querySelector('.modal')!;
    const backdrop = document.querySelector('.modal-backdrop')!;
    fireEvent.mouseDown(modal.querySelector('.modal-dialog')!);
    fireEvent.mouseUp(backdrop);
    expect(document.querySelector('.modal')).toBeInTheDocument();
    fireEvent.mouseDown(backdrop);
    fireEvent.mouseUp(backdrop);
    await expect(getInstance().result).rejects.toBe('backdrop click');
  });

  it('honors keyboard, static backdrop, and false backdrop options', async () => {
    const keyboard = renderModal({ controller: 'test', keyboard: false });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('.modal')).toBeInTheDocument();
    keyboard.getInstance().dismiss('cleanup');
    await expect(keyboard.getInstance().result).rejects.toBe('cleanup');
    cleanup();

    const staticModal = renderModal({ controller: 'test', backdrop: 'static' });
    const staticBackdrop = document.querySelector('.modal-backdrop')!;
    fireEvent.mouseDown(staticBackdrop);
    fireEvent.mouseUp(staticBackdrop);
    expect(document.querySelector('.modal')).toBeInTheDocument();
    staticModal.getInstance().dismiss('cleanup');
    await expect(staticModal.getInstance().result).rejects.toBe('cleanup');
    cleanup();

    const noBackdrop = renderModal({ controller: 'test', backdrop: false });
    expect(document.querySelector('.modal-backdrop')).not.toBeInTheDocument();
    fireEvent.mouseDown(document.querySelector('.modal')!);
    fireEvent.mouseUp(document.querySelector('.modal')!);
    expect(document.querySelector('.modal')).toBeInTheDocument();
    noBackdrop.getInstance().dismiss('cleanup');
    await expect(noBackdrop.getInstance().result).rejects.toBe('cleanup');
  });

  it('settles exactly once', async () => {
    const { getInstance } = renderModal();
    getInstance().close('first');
    getInstance().dismiss('second');
    await expect(getInstance().result).resolves.toBe('first');
    expect(document.querySelector('.modal')).not.toBeInTheDocument();

    cleanup();
    const second = renderModal();
    second.getInstance().dismiss('first');
    second.getInstance().close('second');
    await expect(second.getInstance().result).rejects.toBe('first');
  });

  it('closes only the top-most modal and keeps body state until the last closes', async () => {
    let instances: ModalInstance[] = [];
    render(
      <ModalProvider registry={{ test: ({ close, dismiss }) => <RegistryContent close={close} dismiss={dismiss} /> }}>
        <Launcher onInstance={(value) => { instances = [...instances, value]; }} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Open'));
    const windows = Array.from(document.querySelectorAll('.modal'));
    const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
    expect(windows.map((element) => (element as HTMLElement).style.zIndex).sort()).toEqual(['1050', '1060']);
    expect(backdrops.map((element) => (element as HTMLElement).style.zIndex).sort()).toEqual(['1040', '1051']);
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(instances[1]!.result).rejects.toBe('escape key press');
    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.body.className).toBe('modal-open');
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(instances[0]!.result).rejects.toBe('escape key press');
    expect(document.body.className).toBe('');
  });

  it('supports content close and dismiss controls', async () => {
    const { getInstance } = renderModal();
    fireEvent.click(screen.getByText('Close content'));
    await expect(getInstance().result).resolves.toBe('closed');
    cleanup();
    const second = renderModal();
    fireEvent.click(screen.getByText('Dismiss content'));
    await expect(second.getInstance().result).rejects.toBe('dismissed');
  });
});
