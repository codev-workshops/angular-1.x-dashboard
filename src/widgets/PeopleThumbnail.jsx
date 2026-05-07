import React from 'react';

const PEOPLE = [
  { name: 'Frank Ocean', age: 33, city: 'New Orleans' },
  { name: 'Grace Hopper', age: 85, city: 'Arlington' },
  { name: 'Henry Ford', age: 83, city: 'Dearborn' },
  { name: 'Iris Apfel', age: 102, city: 'Palm Beach' },
  { name: 'Jack Black', age: 54, city: 'Los Angeles' },
];

export default function PeopleThumbnail() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
      {PEOPLE.map((p, i) => (
        <div key={i} style={{ textAlign: 'center', width: '80px' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: '#' + Math.floor(Math.abs(Math.sin(i + 1) * 16777215) % 16777215).toString(16).padStart(6, '0'),
            margin: '0 auto 5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: 20
          }}>
            {p.name.charAt(0)}
          </div>
          <small>{p.name}</small>
        </div>
      ))}
    </div>
  );
}
