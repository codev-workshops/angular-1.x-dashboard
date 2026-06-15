import React from 'react';

export interface SaveChangesModalProps {
  layoutTitle: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const SaveChangesModal: React.FC<SaveChangesModalProps> = ({
  layoutTitle,
  onSave,
  onDiscard,
  onCancel,
}) => {
  return (
    <div className="modal-backdrop-overlay">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              aria-hidden="true"
              onClick={onCancel}
            >
              &times;
            </button>
            <h3>Unsaved Changes to &quot;{layoutTitle}&quot;</h3>
          </div>

          <div className="modal-body">
            <p>
              You have {' '}
              <strong>unsaved changes</strong> to the current layout
              &quot;{layoutTitle}&quot;.
              Would you like to save them before switching?
            </p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-default"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={onDiscard}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
