import type { Person } from '../people';

export function PeopleThumbnail({ people }: { people: Person[] }): JSX.Element {
  return <>{people.map((person) => <div className="people" key={`${person.name}-${person.email}`}><img src="person.png" /><p>{person.name}<br />{person.email}<br />{person.phone}</p></div>)}</>;
}
