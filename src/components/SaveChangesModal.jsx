import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function SaveChangesModal({ show, layout, onSave, onDiscard }) {
  return (
    <Modal show={show} onHide={onDiscard}>
      <Modal.Header closeButton>
        <Modal.Title>Unsaved Changes to "{layout ? layout.title : ''}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You have {layout && layout.dashboard ? layout.dashboard.unsavedChangeCount : 0} unsaved changes on this dashboard. Would you like to save them?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={onDiscard}>Don't Save</Button>
        <Button variant="primary" onClick={onSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}
