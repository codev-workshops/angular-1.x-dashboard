import type { LayoutDefinition } from '../models/types';
import type { ModalContentProps } from '../useModal';

function layoutFromResolve(resolve: ModalContentProps['resolve']): LayoutDefinition {
  const layout = resolve.layout;
  if (!layout || typeof layout !== 'object') throw new Error('SaveChangesModal requires resolve.layout');
  return layout as LayoutDefinition;
}

export function SaveChangesModal({ resolve, close, dismiss }: ModalContentProps): JSX.Element {
  const layout = layoutFromResolve(resolve);
  const dashboard = layout.dashboard;
  const unsavedChangeCount = typeof dashboard?.unsavedChangeCount === 'number' ? dashboard.unsavedChangeCount : 0;
  return (
    <>
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()" onClick={() => dismiss()}>&times;</button>
        <h3>Unsaved Changes to "{layout.title}"</h3>
      </div>
      <div className="modal-body">
        <p>You have {unsavedChangeCount} unsaved changes on this dashboard. Would you like to save them?</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-default" ng-click="cancel()" onClick={() => dismiss()}>Don't Save</button>
        <button type="button" className="btn btn-primary" ng-click="ok()" onClick={() => close()}>Save</button>
      </div>
    </>
  );
}
