import WtTime from './WtTime';
import WtScopeWatch from './WtScopeWatch';
import WtFluid from './WtFluid';
import ResizableWidget from './ResizableWidget';
import CartDetail from './CartDetail';
import CartSummary from './CartSummary';
import PeopleList from './PeopleList';
import PeopleThumbnail from './PeopleThumbnail';

export const widgetRegistry = {
  'wt-time': WtTime,
  'wt-scope-watch': WtScopeWatch,
  'wt-fluid': WtFluid,
  'resizable': ResizableWidget,
  'cartDetail': CartDetail,
  'cartSummary': CartSummary,
  'peopleList': PeopleList,
  'peopleThumbnail': PeopleThumbnail,
  // templateUrl aliases
  'app/template/resizable.html': ResizableWidget,
  'app/template/cartDetail.html': CartDetail,
  'app/template/cartSummary.html': CartSummary,
  'app/template/peopleList.html': PeopleList,
  'app/template/peopleThumbnail.html': PeopleThumbnail,
};
