import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { NavBar, demoRoutes } from './NavBar';

describe('NavBar', () => {
  it('renders the brand and all authored routes', () => {
    render(<HashRouter><NavBar path="/layouts" /></HashRouter>);
    expect(screen.getByRole('link', { name: 'angular-dashboard' })).toHaveAttribute('href', '#');
    expect(document.querySelector('.alert.alert-success')).toHaveAttribute('ng-if', '$route.current.$$route.description');
    expect(document.querySelector('.alert.alert-success')).toHaveAttribute('btf-markdown', "'**Description:** ' + $route.current.$$route.description");
    expect(document.querySelector('.navbar-nav > li')).toHaveAttribute('ng-class', "{ 'active': $route.current.$$route === route}");
    expect(document.querySelector('.navbar-nav > li > a')).toHaveAttribute('ng-href', "{{'#' + route.originalPath}}");
    const navLinks = Array.from(document.querySelectorAll('.navbar-nav > li > a'));
    expect(navLinks.map((link) => link.textContent)).toEqual(demoRoutes.map((route) => route.title));
    expect(navLinks.map((link) => link.getAttribute('href'))).toEqual(demoRoutes.map((route) => `#${route.path}`));
  });

  it('selects the active route and renders markdown description output', () => {
    render(<HashRouter><NavBar path="/layouts" /></HashRouter>);
    expect(document.querySelector('.navbar-nav > li.active')).toHaveTextContent('dashboard layouts');
    expect(screen.getAllByRole('strong').at(-1)).toHaveTextContent('Description:');
    expect(screen.getAllByRole('link', { name: 'issue #31' }).at(-1)).toHaveAttribute('href', 'https://github.com/DataTorrent/malhar-angular-dashboard/issues/31');
  });
});
