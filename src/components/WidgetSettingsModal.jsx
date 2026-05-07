import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

export default function WidgetSettingsModal({ show, widget, onClose, onDismiss, partialContent: PartialContent, customTemplate }) {
  const [result, setResult] = useState(() => _.cloneDeep(widget));

  if (customTemplate) {
    const CustomTemplate = customTemplate;
    return (
      <Modal show={show} onHide={() => onDismiss('cancel')}>
        <CustomTemplate widget={widget} result={result} setResult={setResult} onClose={onClose} onDismiss={onDismiss} />
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={() => onDismiss('cancel')}>
      <Modal.Header closeButton>
        <Modal.Title>Widget Options <small>{widget.title}</small></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="widgetTitle" className="col-sm-2 control-label">Title</label>
            <div className="col-sm-10">
              <input
                type="text"
                className="form-control"
                name="widgetTitle"
                value={result.title || ''}
                onChange={(e) => setResult({ ...result, title: e.target.value })}
              />
            </div>
          </div>
          {PartialContent && <PartialContent result={result} setResult={setResult} />}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="default" onClick={() => onDismiss('cancel')}>Cancel</Button>
        <Button variant="primary" onClick={() => onClose(result)}>OK</Button>
      </Modal.Footer>
    </Modal>
  );
}
