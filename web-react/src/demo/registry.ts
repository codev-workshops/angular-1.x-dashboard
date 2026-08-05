import { WtScopeWatch } from './widgets/WtScopeWatch';
import { WtTime } from './widgets/WtTime';
import { RandomDataModel } from './dataModels/RandomDataModel';

export const widgetRegistry = {
  'wt-time': WtTime,
  'wt-scope-watch': WtScopeWatch,
};

export const dataModelRegistry = {
  RandomDataModel,
};
