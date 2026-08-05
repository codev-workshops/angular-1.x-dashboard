import { useEffect, useState } from 'react';

export function WtTime(): JSX.Element {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const intervalId = window.setInterval(() => setTime(new Date().toLocaleTimeString()), 500);
    return () => window.clearInterval(intervalId);
  }, []);
  return <div>Time<div className="alert alert-success">{time}</div></div>;
}
