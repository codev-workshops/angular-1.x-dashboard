import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PeopleList } from './PeopleList';
import type { Person } from '../people';

const people: Person[] = [{ name: 'James Smith', email: 'smith@company.com', phone: '123-456-7890' }, { name: 'Mary Clark', email: 'clark@company.com', phone: '234-567-8901' }];

describe('PeopleList', () => {
  it('renders table rows and removes a person', () => {
    const removePerson = vi.fn();
    const { container } = render(<PeopleList people={people} removePerson={removePerson} />);
    expect(container.querySelectorAll('table.people tr')).toHaveLength(2);
    expect(container).toHaveTextContent('James Smith');
    expect(container).toHaveTextContent('smith@company.com');
    fireEvent.click(container.querySelector('.glyphicon-remove')!.parentElement!);
    expect(removePerson).toHaveBeenCalledWith(people[0]);
  });
});
