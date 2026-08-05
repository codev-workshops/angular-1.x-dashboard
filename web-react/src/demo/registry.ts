import { CartDetail } from './widgets/CartDetail';
import { CartSummary } from './widgets/CartSummary';
import { DynamicOptionsContainer } from './widgets/DynamicOptionsContainer';
import { PeopleList } from './widgets/PeopleList';
import { PeopleThumbnail } from './widgets/PeopleThumbnail';
import { Resizable } from './widgets/Resizable';
import { WtScopeWatch } from './widgets/WtScopeWatch';
import { WtTime } from './widgets/WtTime';
import { WtFluid } from './widgets/WtFluid';
import { CartDataModel } from './dataModels/CartDataModel';
import { RandomDataModel } from './dataModels/RandomDataModel';

export const widgetRegistry = {
  'wt-time': WtTime,
  'wt-scope-watch': WtScopeWatch,
  'wt-fluid': WtFluid,
  random: WtScopeWatch,
  time: WtTime,
  datamodel: WtScopeWatch,
  fluid: WtFluid,
  resizable: Resizable,
  'app/template/resizable.html': Resizable,
  'app/template/cartDetail.html': CartDetail,
  'app/template/cartSummary.html': CartSummary,
  'app/template/dynamicOptionsContainer.html': DynamicOptionsContainer,
  cartDetail: CartDetail,
  cartSummary: CartSummary,
  peopleList: PeopleList,
  peopleThumbnail: PeopleThumbnail,
  'congfigurable widget': WtScopeWatch,
  'override modal widget': WtScopeWatch,
};

export const dataModelRegistry = {
  RandomDataModel,
  CartDataModel,
};
