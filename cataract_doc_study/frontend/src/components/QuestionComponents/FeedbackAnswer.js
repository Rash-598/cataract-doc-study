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
  const [previousAnswer, setPreviousAnswer] = React.useState(null);
  const [showDiff, setShowDiff] = React.useState(true);

  const [feedback, setFeedback] = React.useState('');
  const [hasStarted, setHasStarted] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const activityTracker = React.useRef(new ActivityTracker());
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  if (!hasStarted) {
      setHasStarted(true);
      const now = Date.now();
      setStartTime(now);
      activityTracker.current.addActivity(ActivityType.QUESTION_START);
  }

  const handleTimeUpdate = (time) => {
    setTimeElapsed(time);
  };

  const handlePrevious = () => {
    activityTracker.current.addActivity(ActivityType.GO_LEFT, answers.slice(0, currAnswerIndex));
    setCurrAnswerIndex(currAnswerIndex - 1);
    if (currAnswerIndex - 2 < 0) {
      setPreviousAnswer(null);
    } else {
      setPreviousAnswer(answers[currAnswerIndex-2].answer);
    }
  };

  const handleNext = () => {
    activityTracker.current.addActivity(ActivityType.GO_RIGHT, answers.slice(0, Math.max(answers.length, currAnswerIndex + 2)));
    setCurrAnswerIndex(currAnswerIndex + 1);
    setPreviousAnswer(answers[currAnswerIndex].answer);
  };

  const handleFeedback = async (feedback) => {
    setIsUpdating(true);
    const currIndex = currAnswerIndex;
    setPreviousAnswer(answers[currIndex].answer);

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

    let startTime = new Date()
    let endTime = null;

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
      endTime = new Date();

      // First remove all answers after current index
      const newAnswers = answers.slice(0, currIndex + 1);
      const newAnswerIndex = globalIndex + 1;
      newAnswers.push({ id: newAnswerIndex, answer: responseData.updated_answer });

      // Add the new answer and update the current index
      setAnswers(newAnswers);
      setCurrAnswerIndex(currIndex + 1);
      setGlobalIndex(newAnswerIndex);

      // console.log(startTime, endTime);
      // console.log(feedback);
      activityTracker.current.addActivity(ActivityType.UPDATE_ANSWER, [...newAnswers], feedback, startTime.getTime(), endTime.getTime());

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
        duration: timeElapsed * 1000 // Convert seconds to milliseconds
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

  const getHighlightedText = (text) => {
    if (!previousAnswer || !showDiff) return text;

    // If the old answer is very short (like "a3"), treat it as a complete deletion
    // if (previousAnswer.length <= 3) {
    //   return (
    //     <>
    //       <span style={{ 
    //         backgroundColor: '#ffe6e6', 
    //         color: '#ff0000',
    //         textDecoration: 'line-through'
    //       }}>
    //         {previousAnswer}
    //       </span>
    //       {' '}
    //       <span style={{ 
    //         backgroundColor: '#e6ffe6', 
    //         color: '#00cc00'
    //       }}>
    //         {text}
    //       </span>
    //     </>
    //   );
    // }

    // Split texts into words for comparison
    const oldWords = previousAnswer.split(/\s+/);
    const newWords = text.split(/\s+/);
    const result = [];

    // Find the longest common subsequence of words
    const lcs = [];
    const dp = Array(oldWords.length + 1).fill().map(() => Array(newWords.length + 1).fill(0));
    
    for (let i = 1; i <= oldWords.length; i++) {
      for (let j = 1; j <= newWords.length; j++) {
        if (oldWords[i - 1] === newWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    let i = oldWords.length;
    let j = newWords.length;
    while (i > 0 && j > 0) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        lcs.unshift({ word: oldWords[i - 1], oldIndex: i - 1, newIndex: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    // Build the result with highlighting
    let oldIndex = 0;
    let newIndex = 0;
    let lcsIndex = 0;

    while (oldIndex < oldWords.length || newIndex < newWords.length) {
      if (lcsIndex < lcs.length && 
          oldIndex === lcs[lcsIndex].oldIndex && 
          newIndex === lcs[lcsIndex].newIndex) {
        // Common word
        if (result.length > 0) {
          result.push(' ');
        }
        result.push(<span key={`common-${newIndex}`}>{lcs[lcsIndex].word}</span>);
        oldIndex++;
        newIndex++;
        lcsIndex++;
      } else {
        // Handle deletions
        if (oldIndex < oldWords.length && 
            (lcsIndex >= lcs.length || oldIndex < lcs[lcsIndex].oldIndex)) {
          if (result.length > 0) {
            result.push(' ');
          }
          result.push(
            <span key={`deleted-${oldIndex}`} style={{ 
              backgroundColor: '#ffe6e6', 
              color: '#ff0000',
              textDecoration: 'line-through'
            }}>
              {oldWords[oldIndex]}
            </span>
          );
          oldIndex++;
        }
        
        // Handle additions
        if (newIndex < newWords.length && 
            (lcsIndex >= lcs.length || newIndex < lcs[lcsIndex].newIndex)) {
          if (result.length > 0) {
            result.push(' ');
          }
          result.push(
            <span key={`added-${newIndex}`} style={{ 
              backgroundColor: '#e6ffe6', 
              color: '#00cc00'
            }}>
              {newWords[newIndex]}
            </span>
          );
          newIndex++;
        }
      }
    }

    return result;
  };

  return (
    <Box component="form">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {questionData.question}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Timer start={startTime} onTimeUpdate={handleTimeUpdate} sx={{ fontWeight: 'bold', fontSize: '1.2rem' }} />
        </Box>
      </Box>
      <Box sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Your Answer:
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowDiff(!showDiff)}
            color={showDiff ? "success" : "default"}
          >
            {showDiff ? "Hide Diff" : "Show Diff"}
          </Button>
        </Box>
        <Box
          sx={{
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            backgroundColor: '#f5f5f5',
            minHeight: '100px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {getHighlightedText(answers[currAnswerIndex].answer)}
        </Box>
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
            disabled={currAnswerIndex === answers.length - 1}
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
