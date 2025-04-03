import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Timer = ({ start, end }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (start && !end) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else if (end) {
      setElapsed(Math.floor((end - start) / 1000));
    }

    return () => clearInterval(interval);
  }, [start, end]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Typography variant="body2" color="text.secondary">
      {formatTime(elapsed)}
    </Typography>
  );
};

export default Timer;
