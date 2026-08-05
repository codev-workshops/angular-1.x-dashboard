// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalProvider, useModal } from '../useModal';

function Launcher({ options, onInstance }: { options?: Parameters<ReturnType<typeof useModal>['open']>[0]; onInstance: (instance: ReturnType<ReturnType<typeof useModal>['open']>) => void }): JSX.Element {
  const { open } = useModal();
  return <button type="button" onClick={() => onInstance(open(options ?? { controller: 'test' }))}>Open</button>;
}

const RegistryComponent = ({ close }: { close: () => void }): JSX.Element => <div onClick={close}>Content</div>;

afterEach(() => {
  cleanup();
  document.body.className = '';
});

describe('Modal', () => {
  it('renders the portal shell and closes on Escape', async () => {
    let instance: ReturnType<ReturnType<typeof useModal>['open']>;
    const result = vi.fn();
    render(
      <ModalProvider registry={{ test: ({ close }) => <RegistryComponent close={close} /> }}>
        <Launcher onInstance={(value) => { instance = value; value.result.catch(result); }} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open'));
    expect(document.body.className).toBe('modal-open');
    expect(document.querySelector('.modal')?.parentElement).toBe(document.body);
    expect(document.querySelector('.modal')).toHaveAttribute('tabindex', '-1');
    expect(document.querySelector('.modal')).toHaveAttribute('role', 'dialog');
    expect(document.querySelector('.modal')).toHaveStyle({ zIndex: '1050', display: 'block' });
    expect(document.querySelector('.modal-backdrop')).toHaveStyle({ zIndex: '1040' });
    expect(document.body.children[0]).toBe(document.querySelector('.modal'));
    expect(document.body.children[1]).toBe(document.querySelector('.modal-backdrop'));
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(instance!.result).rejects.toBe('escape key press');
    expect(result).toHaveBeenCalled();
    expect(document.querySelector('.modal')).not.toBeInTheDocument();
    expect(document.body.className).toBe('');
  });

  it('supports static and absent backdrops', () => {
    const onInstance = vi.fn();
    render(
      <ModalProvider registry={{ test: ({ close }) => <RegistryComponent close={close} /> }}>
        <Launcher options={{ controller: 'test', backdrop: 'static' }} onInstance={onInstance} />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByText('Open'));
    expect(document.querySelector('.modal-backdrop')).toBeInTheDocument();
    fireEvent.mouseDown(document.querySelector('.modal')!);
    fireEvent.mouseUp(document.querySelector('.modal')!);
    cleanup();
    render(
      <ModalProvider registry={{ test: ({ close }) => <RegistryComponent close={close} /> }}>
        <Launcher options={{ controller: 'test', backdrop: false }} onInstance={onInstance} />
      </ModalProvider>,
    );
    expect(document.querySelector('.modal-backdrop')).not.toBeInTheDocument();
  });
});
