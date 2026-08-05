import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PeopleThumbnail } from './PeopleThumbnail';
import type { Person } from '../people';

describe('PeopleThumbnail', () => {
  it('renders one people div and image per person', () => {
    const people: Person[] = [{ name: 'James Smith', email: 'smith@company.com', phone: '123-456-7890' }, { name: 'Mary Clark', email: 'clark@company.com', phone: '234-567-8901' }];
    const { container } = render(<PeopleThumbnail people={people} />);
    expect(container.querySelectorAll('div.people')).toHaveLength(2);
    expect(container.querySelectorAll('div.people img')).toHaveLength(2);
    expect(container.querySelector('img')).toHaveAttribute('src', 'person.png');
    expect(container).toHaveTextContent('Mary Clark');
  });
});
