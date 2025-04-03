import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import NewAnswer from '../QuestionComponents/NewAnswer';

const SectionOne = ({ questions, progress_id, onProgressUpdate, doctorId }) => {
  const currentQuestionIndex = progress_id; 
  const [showIntro, setShowIntro] = useState(true);

  const handleAnswer = (questionId, answer) => {
    // Here you can handle the answer submission
    console.log(`Question ${questionId} answered:`, answer);
  };

  const handleNext = () => {
    if (showIntro) {
      setShowIntro(false);
    } else {
      // Always update progress
      onProgressUpdate(currentQuestionIndex + 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 6, 
        width: '100%',
        maxWidth: '800px',
      }}
    >
      {showIntro ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Section 1 Introduction
          </Typography>
          <Typography variant="body1" paragraph={true}>
            Welcome to Section 1. 
            Please answer the following questions with your answer.
          </Typography>
          <Button variant="contained" onClick={handleNext}>
            Start Section 1
          </Button>
        </Box>
      ) : (
        <NewAnswer
          key={currentQuestion.question_id}
          doctorId={doctorId}
          question={currentQuestion}
          onAnswer={handleAnswer}
          onNext={handleNext}
          progress_id={progress_id}
        />
      )}
    </Paper>
  );
};

export default SectionOne; 