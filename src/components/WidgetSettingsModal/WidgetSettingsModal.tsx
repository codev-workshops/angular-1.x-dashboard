import React, { useCallback, useState } from 'react';
import _ from 'lodash';
import { WidgetModel } from '../../models/WidgetModel';

export interface WidgetSettingsModalProps {
  widget: WidgetModel;
  onClose: (result: Record<string, any>) => void;
  onDismiss: (reason: string) => void;
  children?: React.ReactNode;
}

export const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
  widget,
  onClose,
  onDismiss,
  children,
}) => {
  const [result, setResult] = useState<Record<string, any>>(() => _.cloneDeep({
    title: widget.title,
    name: widget.name,
    style: widget.style,
    size: widget.size,
    dataModelOptions: widget.dataModelOptions,
    attrs: widget.attrs,
    storageHash: widget.storageHash,
  }));

  const handleOk = useCallback(() => {
    onClose(result);
  }, [result, onClose]);

  const handleCancel = useCallback(() => {
    onDismiss('cancel');
  }, [onDismiss]);

  return (
    <div className="modal-backdrop-overlay">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              aria-hidden="true"
              onClick={handleCancel}
            >
              &times;
            </button>
            <h3>
              Widget Options <small>{widget.title}</small>
            </h3>
          </div>

          <div className="modal-body">
            <form name="form" noValidate className="form-horizontal">
              <div className="form-group">
                <label htmlFor="widgetTitle" className="col-sm-2 control-label">
                  Title
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control"
                    name="widgetTitle"
                    value={result.title || ''}
                    onChange={(e) =>
                      setResult((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
              </div>
              {children}
            </form>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-default"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOk}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
