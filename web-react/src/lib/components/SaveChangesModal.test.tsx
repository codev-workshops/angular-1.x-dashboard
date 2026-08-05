// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SaveChangesModal } from './SaveChangesModal';

afterEach(() => cleanup());

describe('SaveChangesModal', () => {
  it('renders the layout state and closes or dismisses without values', () => {
    const close = vi.fn();
    const dismiss = vi.fn();
    render(
      <SaveChangesModal
        resolve={{ layout: { title: 'Main', dashboard: { unsavedChangeCount: 2 } } }}
        scope={{}}
        close={close}
        dismiss={dismiss}
      />,
    );
    expect(screen.getByText('Unsaved Changes to "Main"')).toBeInTheDocument();
    expect(screen.getByText('You have 2 unsaved changes on this dashboard. Would you like to save them?')).toBeInTheDocument();
    fireEvent.click(screen.getByText("Don't Save"));
    expect(dismiss).toHaveBeenCalledWith();
    fireEvent.click(screen.getByText('Save'));
    expect(close).toHaveBeenCalledWith();
  });
});
