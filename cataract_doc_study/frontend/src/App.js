import { ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import DoctorLogin from './components/DoctorLogin';
import SurveyStatus from './components/FormHomePage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<DoctorLogin />} />
            <Route path="/survey/:doctorId" element={<SurveyStatus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
