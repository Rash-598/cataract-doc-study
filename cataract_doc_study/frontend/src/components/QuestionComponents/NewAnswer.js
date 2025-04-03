import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import ActivityTracker, { ActivityType } from '../../utils/ActivityTracker';
import questionProvider from '../../utils/QuestionProvider';
import Timer from '../Timer';
import { getServerUrl } from '../../utils/FlagProvider';
import { toast } from 'react-toastify';
// import axios from 'axios';

const NewAnswer = ({ question, onNext, doctorId, progress_id }) => {

  const questionData = questionProvider.getQuestion(question.question_id);

  const [answer, setAnswer] = React.useState('');
  const [hasStarted, setHasStarted] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const activityTracker = React.useRef(new ActivityTracker());

//   console.log("question", question);


    if (!hasStarted) {
        setHasStarted(true);
        const now = Date.now();
        setStartTime(now);
        activityTracker.current.addActivity(ActivityType.QUESTION_START);
    }

    const handleSubmit = async () => {
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

        // Fetch call to submit answer, along with question_id, answer, and duration
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
        }

  };

  return (
    <Box component="form">
      <Typography variant="h6" gutterBottom>
        {questionData.question}
      </Typography>
      <Box sx={{ my: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer here..."
          variant="outlined"
        />
      </Box>
      <Timer start={startTime} />
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        disabled={!answer}
      >
        Submit
      </Button>
    </Box>
  );
};

export default NewAnswer;
