import type { WidgetContentProps } from '../../lib/models/types';
import type { Person } from '../people';

export type PeopleProps = { people: Person[]; removePerson?: (person: Person) => void };

export function PeopleList(props: PeopleProps | WidgetContentProps): JSX.Element {
  const people = ('people' in props ? props.people : props.widgetData) as Person[];
  const removePerson = 'removePerson' in props && typeof props.removePerson === 'function' ? props.removePerson as (person: Person) => void : undefined;
  return <table className="people"><tbody>{people.map((person) => <tr key={`${person.name}-${person.email}`}><td>{person.name}</td><td>{person.email}</td><td>{person.phone}</td><td><button onClick={() => removePerson?.(person)} className="btn btn-danger btn-xs"><span className="glyphicon glyphicon-remove"></span></button></td></tr>)}</tbody></table>;
}
