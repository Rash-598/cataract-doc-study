import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import ActivityTracker, { ActivityType } from '../../utils/ActivityTracker';
import questionProvider from '../../utils/QuestionProvider';
import Timer from '../Timer';
import { toast } from 'react-toastify';
import { getServerUrl } from '../../utils/FlagProvider';
// import axios from 'axios';

const EditAnswer = ({ question, onAnswer, onNext, doctorId, progress_id }) => {
  const questionData = questionProvider.getQuestion(question.question_id);

  const [answer, setAnswer] = React.useState(questionData.answer);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const activityTracker = React.useRef(new ActivityTracker());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

//   console.log("question", question);

if (!hasStarted) {
    setHasStarted(true);
    const now = Date.now();
    setStartTime(now);
    activityTracker.current.addActivity(ActivityType.QUESTION_START);
}
  // const handleInputFocus = () => {
  //   setHasStarted(true);
  //   const now = Date.now();
  //   setStartTime(now);
  //   // if (!hasStarted) {
  //   //   setHasStarted(true);
  //   //   const now = Date.now();
  //   //   setStartTime(now);
  //   activityTracker.current.addActivity(ActivityType.QUESTION_START);
  //   // }
  // };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    activityTracker.current.addActivity(ActivityType.SUBMIT_ANSWER);
    
    const data = {
      user_id: doctorId,
      question_metadata: {
        question_id: question.question_id,
        condition_id: question.condition_id,
        final_answer: answer,
        duration: Date.now() - startTime
      },
      activity_tracker: activityTracker.current.getActivities(),
      progress_id: progress_id
    }

    try {
      const serverUrl = getServerUrl();
      const response = await fetch(`${serverUrl}/submit`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.ok === false) {
        throw new Error('Failed to submit answer');
      }

      console.log("Answer submitted successfully");
      onNext();
    } catch (error) {
      toast.error('Failed to submit answer, try again');
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {questionData.question}
        </Typography>
      </Box>
      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Your Answer:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Please provide your answer here..."
          variant="outlined"
        />
      </Box>
      <Timer start={startTime} sx={{ fontWeight: 'bold', fontSize: '1.2rem' }} />
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        disabled={!answer || isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </Box>
  );
};

export default EditAnswer;
