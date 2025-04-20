import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, Modal } from '@mui/material';

const Timer = ({ start, end, onTimeUpdate }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (start && !end && !isPaused) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const totalElapsed = currentTime - start;
        const actualElapsed = totalElapsed - totalPausedTime;
        const newElapsed = Math.floor(actualElapsed / 1000);
        setElapsed(newElapsed);
        if (onTimeUpdate) {
          onTimeUpdate(newElapsed);
        }
      }, 1000);
    } else if (end) {
      const totalElapsed = end - start;
      const actualElapsed = totalElapsed - totalPausedTime;
      const newElapsed = Math.floor(actualElapsed / 1000);
      setElapsed(newElapsed);
      if (onTimeUpdate) {
        onTimeUpdate(newElapsed);
      }
    }

    return () => clearInterval(interval);
  }, [start, end, isPaused, totalPausedTime, onTimeUpdate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(true);
    setPauseStartTime(Date.now());
  };

  const handleResume = () => {
    if (pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setTotalPausedTime(prev => prev + pauseDuration);
    }
    setIsPaused(false);
    setPauseStartTime(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {formatTime(elapsed)}
      </Typography>
      <Button 
        variant="contained" 
        onClick={handlePause}
        disabled={isPaused || end}
        sx={{ 
          bgcolor: isPaused ? 'grey.400' : 'primary.main',
          '&:hover': {
            bgcolor: isPaused ? 'grey.400' : 'primary.dark'
          }
        }}
      >
        Pause
      </Button>

      <Modal
        open={isPaused}
        onClose={() => {}}
        aria-labelledby="pause-modal"
        disableEscapeKeyDown
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Timer Paused
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please take a break and enjoy your snacks! 🍪
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleResume}
            sx={{ mt: 2 }}
          >
            Resume
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Timer;
