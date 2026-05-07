import React from 'react';

const PEOPLE = [
  { name: 'Alice Johnson', age: 28, city: 'New York' },
  { name: 'Bob Smith', age: 34, city: 'San Francisco' },
  { name: 'Charlie Brown', age: 45, city: 'Chicago' },
  { name: 'Diana Ross', age: 31, city: 'Los Angeles' },
  { name: 'Eddie Murphy', age: 52, city: 'Miami' },
];

export default function PeopleList() {
  return (
    <div>
      <table className="table table-striped table-condensed">
        <thead>
          <tr><th>Name</th><th>Age</th><th>City</th></tr>
        </thead>
        <tbody>
          {PEOPLE.map((p, i) => (
            <tr key={i}><td>{p.name}</td><td>{p.age}</td><td>{p.city}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
