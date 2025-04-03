import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import ActivityTracker, { ActivityType } from '../../utils/ActivityTracker';
import questionProvider from '../../utils/QuestionProvider';
import Timer from '../Timer';
import { shouldUseServer, getServerUrl } from '../../utils/FlagProvider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';

const FeedbackAnswer = ({ question, onAnswer, onNext, doctorId, progress_id }) => {
  const questionData = questionProvider.getQuestion(question.question_id);

  const [answers, setAnswers] = React.useState([{ id: 0, answer: questionData.answer }]);
  const [globalIndex, setGlobalIndex] = React.useState(0);
  const [currAnswerIndex, setCurrAnswerIndex] = React.useState(0);

  const [feedback, setFeedback] = React.useState('');
  const [hasStarted, setHasStarted] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const activityTracker = React.useRef(new ActivityTracker());
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  if (!hasStarted) {
      setHasStarted(true);
      const now = Date.now();
      setStartTime(now);
      activityTracker.current.addActivity(ActivityType.QUESTION_START);
  }
  // const handleInputFocus = () => {
  //   if (!hasStarted) {
  //     setHasStarted(true);
  //     const now = Date.now();
  //     setStartTime(now);
  //     activityTracker.current.addActivity(ActivityType.QUESTION_START, [...answers]);
  //   }
  // };

  const handlePrevious = () => {
    activityTracker.current.addActivity(ActivityType.GO_LEFT, answers.slice(0, currAnswerIndex));
    setCurrAnswerIndex(currAnswerIndex - 1);
  };

  const handleNext = () => {

    activityTracker.current.addActivity(ActivityType.GO_RIGHT, answers.slice(0, Math.max(answers.length, currAnswerIndex + 2)));
    setCurrAnswerIndex(currAnswerIndex + 1);
  };

  const handleFeedback = async (feedback) => {
    setIsUpdating(true);
    const currIndex = currAnswerIndex;

    const data = {
      user_id: doctorId,
      question_metadata: {
        question_id: question.question_id,
        question: questionData.question,
        answer: answers[currIndex].answer,
        update_info: feedback
      },
      activity_tracker: activityTracker.current.getActivities(),
      progress_id: progress_id
    }

    try {
      const serverUrl = getServerUrl();
      const doctorUrl = `${serverUrl}/update_answer`;
      
      const response = await fetch(doctorUrl, {
        method: "POST",
        headers: new Headers({
          "ngrok-skip-browser-warning": "69420",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(data)
      });

      if (response.ok === false) {
        throw new Error('Failed to update answer');
      }

      const responseData = await response.json();

      // First remove all answers after current index
      const newAnswers = answers.slice(0, currIndex + 1);
      const newAnswerIndex = globalIndex + 1;
      newAnswers.push({ index: newAnswerIndex, answer: responseData.updated_answer });

      // Add the new answer and update the current index
      setAnswers(newAnswers);
      setCurrAnswerIndex(currIndex + 1);
      setGlobalIndex(newAnswerIndex);

      activityTracker.current.addActivity(ActivityType.UPDATE_ANSWER, [...newAnswers], responseData.updated_answer);

    } catch (error) {
      toast.error('Failed to update answer, try again');
      console.error('Error updating answer:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    activityTracker.current.addActivity(ActivityType.SUBMIT_ANSWER, answers.slice(0, Math.max(answers.length, currAnswerIndex+1)));
    
    const data = {
      user_id: doctorId,
      question_metadata: {
        question_id: question.question_id,
        condition_id: question.condition_id,
        final_answer: answers[currAnswerIndex].answer,
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
        <Timer start={startTime} sx={{ fontWeight: 'bold', fontSize: '1.2rem' }} />
      </Box>
      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Your Answer:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={5}
          value={answers[currAnswerIndex].answer}
          readOnly
          variant="outlined"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mb: 3 }}>
        <Tooltip title="Go to previous answer">
          <Button
            onClick={handlePrevious}
            variant="contained"
            startIcon={<ArrowBackIcon />}
            disabled={currAnswerIndex === 0}
            color="success"
            size="small"
          >
            Previous
          </Button>
        </Tooltip>
        <Tooltip title="Go to next answer">
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!feedback || currAnswerIndex === answers.length - 1}
            color="success"
            size="small"
          >
            Next
          </Button>
        </Tooltip>
      </Box>
      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Correction:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Please provide your correction here..."
          variant="outlined"
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            onClick={() => handleFeedback(feedback)}
            variant="contained"
            color="success"
            disabled={!feedback || isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isUpdating ? 'Updating...' : 'Update Answer'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', my: 4 }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FeedbackAnswer;
