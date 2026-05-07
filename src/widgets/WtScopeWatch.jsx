import React from 'react';

export default function WtScopeWatch({ widgetData }) {
  return <div>{widgetData !== null && widgetData !== undefined ? String(widgetData) : '-'}</div>;
}
