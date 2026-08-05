import { useState } from 'react';
import type { WidgetContentProps, WidgetDefinition } from '../../lib/models/types';
import { generatePeople, type Person } from '../people';
import { PeopleList } from './PeopleList';
import { PeopleThumbnail } from './PeopleThumbnail';

type DynamicWidget = WidgetDefinition & { includeUrl: string };

export function DynamicOptionsContainer({ widget }: WidgetContentProps): JSX.Element {
  const suppliedWidget = widget as DynamicWidget;
  const [people, setPeople] = useState<Person[]>(generatePeople);
  const [includeUrl, setIncludeUrl] = useState(suppliedWidget.includeUrl);
  const toggleTemplate = (): void => {
    const next = includeUrl === 'app/template/peopleList.html' ? 'app/template/peopleThumbnail.html' : 'app/template/peopleList.html';
    suppliedWidget.includeUrl = next;
    setIncludeUrl(next);
  };
  const removePerson = (person: Person): void => setPeople((current) => current.filter((candidate) => candidate !== person));
  const Included = includeUrl === 'app/template/peopleThumbnail.html' ? PeopleThumbnail : PeopleList;
  return (
    <div>
      <div>
        <b>Change includeUrl to:</b>
        <div className="btn-group">
          <button className={`btn btn-default btn-sm${includeUrl === 'app/template/peopleList.html' ? ' active' : ''}`} disabled={includeUrl === 'app/template/peopleList.html'} onClick={toggleTemplate}>List</button>
          <button className={`btn btn-default btn-sm${includeUrl === 'app/template/peopleThumbnail.html' ? ' active' : ''}`} disabled={includeUrl === 'app/template/peopleThumbnail.html'} onClick={toggleTemplate}>Thumbnail</button>
        </div>
        <div style={{ paddingBottom: '14px' }}>This methodology does not create a new widget and therefore does not create a new scope and the existing data remains unchanged.
            Notice the names do not change as you toggle between the List and Thumbnail buttons.</div>
      </div>
      <div><Included people={people} removePerson={removePerson} /></div>
    </div>
  );
}
