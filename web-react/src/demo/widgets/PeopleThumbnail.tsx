import type { WidgetContentProps } from '../../lib/models/types';
import type { Person } from '../people';

export function PeopleThumbnail(props: { people: Person[] } | WidgetContentProps): JSX.Element {
  const people = ('people' in props ? props.people : props.widgetData) as Person[];
  return <>{people.map((person) => <div className="people" key={`${person.name}-${person.email}`}><img src="person.png" /><p>{person.name}<br />{person.email}<br />{person.phone}</p></div>)}</>;
}
