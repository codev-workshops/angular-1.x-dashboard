import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ResizeHarness } from './ResizeHarness';

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe('ResizeHarness', () => {
  it('renders the nine resize-demo widgets with their handles and a readout', async () => {
    render(<ResizeHarness />);
    expect(document.querySelectorAll('.widget-container')).toHaveLength(9);
    expect(document.querySelectorAll('.e-resizer')).toHaveLength(9);
    expect(document.querySelectorAll('.w-resizer')).toHaveLength(9);
    expect(document.querySelectorAll('.n-resizer')).toHaveLength(9);
    expect(document.querySelectorAll('.s-resizer')).toHaveLength(9);
    expect(screen.getByText('resizable (height = 25% of width)')).toBeInTheDocument();
    expect(document.querySelector('#last-widget-resized')).toBeInTheDocument();
    await waitFor(() => expect(document.querySelectorAll('#resize-readout tbody tr')).toHaveLength(9));
  });
});
