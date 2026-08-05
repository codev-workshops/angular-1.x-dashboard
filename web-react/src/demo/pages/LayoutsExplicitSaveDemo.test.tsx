import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LayoutsExplicitSaveDemo } from './LayoutsExplicitSaveDemo';

afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

describe('LayoutsExplicitSaveDemo', () => {
  it('renders the layout tabs with an explicit-save dashboard', async () => {
    render(<LayoutsExplicitSaveDemo />);
    expect(document.querySelectorAll('.nav-tabs.layout-tabs > li')).toHaveLength(4);
    await waitFor(() => expect(document.querySelectorAll('[dashboard]')).toHaveLength(1));
    expect(screen.getByText('all saved')).toBeInTheDocument();
  });

  it('leaves the default layouts unlocked and persists under demo-layouts-explicit-save', async () => {
    render(<LayoutsExplicitSaveDemo />);
    const tabs = document.querySelectorAll<HTMLLIElement>('.nav-tabs.layout-tabs > li');
    expect(tabs[0].querySelector('.remove-layout-icon')).toBeInTheDocument();
    fireEvent.click(tabs[1].querySelector('a') as HTMLAnchorElement);
    await waitFor(() => expect(window.localStorage.getItem('demo-layouts-explicit-save')).not.toBeNull());
  });
});
