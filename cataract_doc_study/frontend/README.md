# Doctor's Survey System

A React-based web application designed for doctors to complete surveys. The system consists of multiple sections where doctors can provide answers and receive feedback. The application uses Material-UI for styling and includes features like timers, activity tracking, and server communication.

## Project Structure
```
src/
├── components/
│   ├── sections/           # Section components for different parts of the survey
│   ├── QuestionComponents/ # Components for handling questions and answers
│   └── Timer.js           # Timer component for tracking time
├── utils/                  # Utility functions and providers
└── App.js                  # Main application component
```

## Key Components

### 1. FormHomePage
The main container component that manages the overall survey flow.

```javascript
// Example usage
<FormHomePage doctorId={doctorId} />
```

Key features:
- Manages survey sections
- Handles progress tracking
- Controls navigation between sections
- Manages server communication

### 2. Question Components

#### EditAnswer Component
A component for answering questions in the first section.

```javascript
// Example usage
<EditAnswer 
  question={questionData}
  onAnswer={handleAnswer}
  onNext={handleNext}
  doctorId={doctorId}
  progress_id={currentProgress}
/>
```

Features:
- Text input for answers
- Timer display
- Submit button with loading state
- Activity tracking

#### FeedbackAnswer Component
A component for providing feedback and corrections in the third section.

```javascript
// Example usage
<FeedbackAnswer 
  question={questionData}
  onAnswer={handleAnswer}
  onNext={handleNext}
  doctorId={doctorId}
  progress_id={currentProgress}
/>
```

Features:
- Display of previous answers
- Navigation between answer versions
- Correction input
- Update and Submit buttons with loading states
- Timer display

### 3. Timer Component
A component that displays elapsed time.

```javascript
// Example usage
<Timer start={startTime} />
```

Features:
- Real-time time display
- Customizable styling
- Starts on first user interaction

## Key Concepts

### 1. State Management
React uses state to manage data that can change over time. In this project:

```javascript
// Example of state declaration
const [answer, setAnswer] = React.useState('');

// Example of state update
setAnswer(newValue);
```

### 2. Props
Props are used to pass data between components:

```javascript
// Parent component
<ChildComponent 
  propName={value}
  onEvent={handleEvent}
/>

// Child component
const ChildComponent = ({ propName, onEvent }) => {
  // Use props here
};
```

### 3. Event Handling
React uses event handlers to respond to user actions:

```javascript
// Example of event handler
const handleSubmit = async () => {
  // Handle submission
};

// Using the handler
<Button onClick={handleSubmit}>Submit</Button>
```

### 4. Material-UI Components
The project uses Material-UI for styled components:

```javascript
// Example of Material-UI components
<Box>          // Container component
<Button>       // Button component
<TextField>    // Text input component
<Typography>   // Text component
```

## Server Communication

### API Endpoints
The application communicates with a server using these endpoints:
- `/submit` - Submit answers
- `/update_answer` - Update answers with corrections
- `/progress` - Update survey progress

### Server Communication Example
```javascript
const response = await fetch(`${serverUrl}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

## Activity Tracking
The system tracks user activities using the `ActivityTracker` class:

```javascript
// Example of activity tracking
activityTracker.current.addActivity(ActivityType.QUESTION_START);
```

## Styling
The project uses Material-UI's styling system:

```javascript
// Example of styling
<Box sx={{ 
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 3
}}>
```

## Loading States
Components show loading states during server operations:

```javascript
// Example of loading state
const [isLoading, setIsLoading] = React.useState(false);

// In the button
<Button
  disabled={isLoading}
  startIcon={isLoading ? <CircularProgress /> : null}
>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

## Error Handling
The application includes error handling for server operations:

```javascript
try {
  // Server operation
} catch (error) {
  toast.error('Error message');
  console.error('Error details:', error);
} finally {
  // Cleanup
}
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Access the application at `http://localhost:3000`

## Best Practices
1. Always use proper error handling for server operations
2. Implement loading states for better user experience
3. Track user activities for analytics
4. Use consistent styling across components
5. Keep components focused and single-responsibility

## Dependencies
- React
- Material-UI
- React Router
- Axios (for API calls)

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
