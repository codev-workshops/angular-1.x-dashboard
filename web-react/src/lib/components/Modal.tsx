import { useEffect, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ModalProps = {
  index: number;
  backdrop: boolean | 'static';
  keyboard: boolean;
  isTop: boolean;
  onDismiss: (reason: string) => void;
  windowClass?: string;
  size?: string;
  children: ReactNode;
};

export function Modal({
  index,
  backdrop,
  keyboard,
  isTop,
  onDismiss,
  windowClass,
  size,
  children,
}: ModalProps): JSX.Element {
  const backdropPointer = useRef(false);
  const modalPointer = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;
    document.body.prepend(modalElement);
    const backdropElement = backdropRef.current;
    if (backdropElement) document.body.insertBefore(backdropElement, modalElement.nextSibling);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isTop && keyboard && event.key === 'Escape') {
        event.preventDefault();
        onDismiss('escape key press');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTop, keyboard, onDismiss]);

  const handleBackdropDown = (event: MouseEvent<HTMLDivElement>): void => {
    backdropPointer.current = event.target === event.currentTarget;
  };
  const handleBackdropUp = (event: MouseEvent<HTMLDivElement>): void => {
    const clickedBackdrop = backdropPointer.current && event.target === event.currentTarget;
    backdropPointer.current = false;
    if (clickedBackdrop && backdrop === true) onDismiss('backdrop click');
  };
  const handleModalDown = (event: MouseEvent<HTMLDivElement>): void => {
    modalPointer.current = event.target === event.currentTarget;
  };
  const handleModalUp = (event: MouseEvent<HTMLDivElement>): void => {
    const clickedWindow = modalPointer.current && event.target === event.currentTarget;
    modalPointer.current = false;
    if (clickedWindow && backdrop === true) onDismiss('backdrop click');
  };

  const modalWindow = (
    <div
      tabIndex={-1}
      role="dialog"
      className={`modal fade in${windowClass ? ` ${windowClass}` : ''}`}
      style={{ zIndex: 1050 + index * 10, display: 'block' }}
      ref={modalRef}
      onMouseDown={handleModalDown}
      onMouseUp={handleModalUp}
    >
      <div className={`modal-dialog${size ? ` modal-${size}` : ''}`}>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
  const portalChildren = (
    <>
      {modalWindow}
      {backdrop !== false && (
        <div
          className="modal-backdrop fade in"
          style={{ zIndex: 1040 + (index && 1 || 0) + index * 10 }}
          ref={backdropRef}
          onMouseDown={handleBackdropDown}
          onMouseUp={handleBackdropUp}
        />
      )}
    </>
  );
  return createPortal(portalChildren, document.body);
}
