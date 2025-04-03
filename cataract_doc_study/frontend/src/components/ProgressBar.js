import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const ProgressBar = ({ progress, totalQuestions }) => {
  const questionsLeft = totalQuestions - progress;
  const progressPercentage = (progress / totalQuestions) * 100;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1" color="text.secondary">
          Questions Left: {questionsLeft}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Progress: {progress}/{totalQuestions}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progressPercentage} 
        sx={{ 
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          }
        }}
      />
    </Box>
  );
};

export default ProgressBar;
