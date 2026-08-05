import { describe, expect, it } from 'vitest';
import { generatePeople } from './people';

describe('generatePeople', () => {
  it('generates ten people without replacement', () => {
    const values = [0.123456789012, 0.223456789012, 0.323456789012];
    let index = 0;
    const people = generatePeople(() => values[index++ % values.length]);
    expect(people).toHaveLength(10);
    expect(new Set(people.map((person) => person.name)).size).toBe(10);
    expect(people[0]).toEqual({ name: 'Christopher Clark', email: 'clark@company.com', phone: '323-456-7890' });
  });
});
