import { Link, useLocation } from 'react-router-dom';

export type DemoRoute = {
  path: string;
  title: string;
  description: string;
};

export const demoRoutes: DemoRoute[] = [
  { path: '/', title: 'simple', description: 'This is the simplest demo.' },
  { path: '/resize', title: 'resize', description: 'This demo showcases widget resizing.' },
  {
    path: '/custom-settings',
    title: 'custom widget settings',
    description: 'This demo showcases overriding the widget settings dialog/modal for the entire dashboard and for a specific widget. Click on the cog of each widget to see the custom modal. \n"configurable widget" has "limit" option in the modal that controls RandomDataModel.',
  },
  {
    path: '/explicit-saving',
    title: 'explicit saving',
    description: 'This demo showcases an option to only save the dashboard state explicitly, e.g. by user input. Notice the "all saved" button in the controls updates as you make saveable changes.',
  },
  {
    path: '/layouts',
    title: 'dashboard layouts',
    description: 'This demo showcases the ability to have "dashboard layouts", meaning the ability to have multiple arbitrary configurations of widgets. For more information, take a look at [issue #31](https://github.com/DataTorrent/malhar-angular-dashboard/issues/31)',
  },
  {
    path: '/layouts/explicit-saving',
    title: 'layouts explicit saving',
    description: 'This demo showcases dashboard layouts with explicit saving enabled.',
  },
  {
    path: '/dynamic-options',
    title: 'dynamic options',
    description: 'This demo showcases loading dashboard options dynamically.',
  },
  {
    path: '/dynamic-data',
    title: 'dynamic data',
    description: 'This demo showcases loading the widgets and refreshing the contents as the source data is updated.',
  },
];

function Description({ route }: { route?: DemoRoute }): JSX.Element | null {
  if (!route) return null;
  const marker = '[issue #31](https://github.com/DataTorrent/malhar-angular-dashboard/issues/31)';
  const linkIndex = route.description.indexOf(marker);
  const before = linkIndex >= 0 ? route.description.slice(0, linkIndex) : route.description;
  const after = linkIndex >= 0 ? route.description.slice(linkIndex + marker.length) : '';
  return (
    <div
      {...{
        'ng-if': '$route.current.$$route.description',
        'btf-markdown': "'**Description:** ' + $route.current.$$route.description",
      }}
      className="alert alert-success"
      role="alert"
    >
      <p>
        <strong>Description:</strong>{' '}
        {linkIndex >= 0 ? <>{before}<a href="https://github.com/DataTorrent/malhar-angular-dashboard/issues/31">issue #31</a>{after}</> : route.description}
      </p>
    </div>
  );
}

export function NavBar({ path }: { path?: string } = {}): JSX.Element {
  const location = useLocation();
  const currentPath = path ?? location.pathname;
  const route = demoRoutes.find((candidate) => candidate.path === currentPath);
  return (
    <>
      <nav className="navbar navbar-default navbar-inverse navbar-fixed-top" role="navigation">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#">angular-dashboard</a>
          </div>
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              {demoRoutes.map((candidate) => (
                <li
                  {...{ 'ng-class': "{ 'active': $route.current.$$route === route}" }}
                  className={candidate.path === currentPath ? 'active' : undefined}
                  key={candidate.path}
                >
                  <Link to={candidate.path} {...{ 'ng-href': "{{'#' + route.originalPath}}" }}>{candidate.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <div><Description route={route} /></div>
    </>
  );
}
