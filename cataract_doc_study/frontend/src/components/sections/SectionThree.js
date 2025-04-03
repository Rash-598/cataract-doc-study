import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import FeedbackAnswer from '../QuestionComponents/FeedbackAnswer';

const SectionThree = ({ questions, progress_id, onProgressUpdate, doctorId }) => {
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
            Section 3 Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Section 3. 
            Please provide your feedback in order to improve the given answer.
            You can also choose between the different versions of the answer for editing.s
            Once satisfied, please submit the answer.
          </Typography>
          <Button variant="contained" onClick={handleNext}>
            Start Section 3
          </Button>
        </Box>
      ) : (
        <FeedbackAnswer
          key={currentQuestion.question_id}
          question={currentQuestion}
          onAnswer={handleAnswer}
          onNext={handleNext}
          doctorId={doctorId}
          progress_id={progress_id}
        />
      )}
    </Paper>
  );
};

export default SectionThree; 