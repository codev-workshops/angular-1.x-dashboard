import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LayoutsDemo } from './LayoutsDemo';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('LayoutsDemo', () => {
  it('renders the prependWidget paragraph and the three default layout tabs', async () => {
    render(<LayoutsDemo />);
    expect(screen.getByText('Click here')).toBeInTheDocument();
    expect(screen.getByText(/to add new "random" widget to beginning of dashboard/)).toBeInTheDocument();
    expect(screen.getByText('issue #141')).toHaveAttribute('href', 'https://github.com/DataTorrent/malhar-angular-dashboard/issues/141');
    expect(document.querySelectorAll('.nav-tabs.layout-tabs > li')).toHaveLength(4);
    await waitFor(() => expect(document.querySelectorAll('[dashboard]')).toHaveLength(1));
  });

  it('locks the default layouts and persists under demo-layouts', async () => {
    render(<LayoutsDemo />);
    const tabs = document.querySelectorAll<HTMLLIElement>('.nav-tabs.layout-tabs > li');
    expect(tabs[0].querySelector('.remove-layout-icon')).not.toBeInTheDocument();
    fireEvent.click(tabs[1].querySelector('a') as HTMLAnchorElement);
    await waitFor(() => expect(window.localStorage.getItem('demo-layouts')).not.toBeNull());
    const stored = JSON.parse(window.localStorage.getItem('demo-layouts') as string);
    expect(stored.storageHash).toBe('fs4df4d51');
    expect(stored.layouts.map((layout: { title: string }) => layout.title)).toEqual(['Layout 1', 'Layout 2', 'Layout 3']);
  });
});
