import type { Person } from '../people';

export type PeopleProps = { people: Person[]; removePerson?: (person: Person) => void };

export function PeopleList({ people, removePerson }: PeopleProps): JSX.Element {
  return <table className="people"><tbody>{people.map((person) => <tr key={`${person.name}-${person.email}`}><td>{person.name}</td><td>{person.email}</td><td>{person.phone}</td><td><button onClick={() => removePerson?.(person)} className="btn btn-danger btn-xs"><span className="glyphicon glyphicon-remove"></span></button></td></tr>)}</tbody></table>;
}
