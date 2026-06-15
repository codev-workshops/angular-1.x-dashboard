import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SaveChangesModal } from './SaveChangesModal';

describe('SaveChangesModal', () => {
  let onSave: jest.Mock;
  let onDiscard: jest.Mock;
  let onCancel: jest.Mock;

  beforeEach(() => {
    onSave = jest.fn();
    onDiscard = jest.fn();
    onCancel = jest.fn();
  });

  it('should render with the layout title', () => {
    render(
      <SaveChangesModal
        layoutTitle="My Dashboard"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    );
    expect(screen.getByText(/Unsaved Changes to "My Dashboard"/)).toBeInTheDocument();
  });

  it('should mention the layout name in the body', () => {
    render(
      <SaveChangesModal
        layoutTitle="My Dashboard"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    );
    expect(screen.getByText(/unsaved changes/)).toBeInTheDocument();
  });

  it('should call onSave when Save button is clicked', () => {
    render(
      <SaveChangesModal
        layoutTitle="Test"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should call onDiscard when Discard button is clicked', () => {
    render(
      <SaveChangesModal
        layoutTitle="Test"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Discard'));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <SaveChangesModal
        layoutTitle="Test"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when close button (×) is clicked', () => {
    render(
      <SaveChangesModal
        layoutTitle="Test"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('×'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
