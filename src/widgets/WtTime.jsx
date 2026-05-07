import React, { useState, useEffect } from 'react';

export default function WtTime() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <div>{time}</div>;
}
