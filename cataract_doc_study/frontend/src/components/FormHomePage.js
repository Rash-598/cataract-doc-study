import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import questionMapping from "../data/doctor_question_set.json";
import ProgressBar from "./ProgressBar";
import SectionOne from "./sections/SectionOne";
import SectionTwo from "./sections/SectionTwo";
import SectionThree from "./sections/SectionThree";
import { getServerUrl, shouldUseServer } from "../utils/FlagProvider";



const getQuestionsForDoctor = async (doctorId) => {
  console.log("doctorId", doctorId);
  console.log("shouldUseServer", shouldUseServer());
  const serverUrl = getServerUrl();
  const doctorUrl = `${serverUrl}/login?user_id=${doctorId}`;
  
  const data = await fetch(doctorUrl,       
    {
      method: "GET",
      headers: new Headers({
        "ngrok-skip-browser-warning": "69420",
      })
    }
  );

  return await data.json();
}

const getMockQuestionsForDoctor = async (doctorId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const data = questionMapping.find((map) => map.user_id === doctorId);
  return data;
}

const FormHomePage = () => {
  const { doctorId } = useParams();
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        let data;
        if(shouldUseServer()) {
          data = await getQuestionsForDoctor(doctorId);    
        } else {
          data = await getMockQuestionsForDoctor(doctorId);
        }
        console.log("data", data); 
        setSurveyData(data);
      } catch (error) {
        console.error("Error fetching survey data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const handleProgressUpdate = (newProgress) => {
    console.log("newProgress", newProgress);
    setSurveyData((prev) => ({
      ...prev,
      progress_id: newProgress,
    }));
  };

  const getCurrentSection = () => {
    // console.log("surveyData", surveyData);
    const questions = surveyData.questions_list;
    const progress_id = surveyData.progress_id;
    if (!questions || !questions.length) return null;

    if (progress_id >= questions.length) {
      return getSurveyCompletedComnponent();
    }


    const currentQuestion = questions[progress_id];
    // console.log("currentQuestion", currentQuestion);
    if (!currentQuestion) return null;

    const sectionProps = {
      doctorId: doctorId,
      questions: surveyData.questions_list,
      progress_id: surveyData.progress_id,
      onProgressUpdate: handleProgressUpdate,
    };

    switch (currentQuestion.condition_id) {
      case 0:
        return <SectionOne {...sectionProps} />;
      case 1:
        return <SectionTwo {...sectionProps} />;
      case 2:
        return <SectionThree {...sectionProps} />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (!surveyData) return "";

    if (surveyData.progress_id === 0) {
      return <Button onClick={() => setShowSurvey(true)}>Start survey</Button>;
    } else if (surveyData.progress_id === surveyData.questions_list.length) {
      return "Survey completed";
    } else {
      return <Button onClick={() => setShowSurvey(true)}>Resume survey</Button>;
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ py: 4 }}>
        <ProgressBar
          progress={surveyData.progress_id}
          totalQuestions={surveyData.questions_list.length}
        />
      </Box>
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {!showSurvey ? (
          <Paper
            elevation={3}
            sx={{
              padding: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Survey Status
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {getStatusMessage()}
            </Typography>
          </Paper>
        ) : (
          getCurrentSection()
        )}
      </Box>
    </Container>
  );
};


const getSurveyCompletedComnponent = () => {
  return           <Paper
  elevation={3}
  sx={{
    padding: 6,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
      maxWidth: "800px",
    }}
  >
    <Typography variant="h6" gutterBottom color="primary">
      Survey Completed!
    </Typography>
    <Typography variant="body1" paragraph>
      Thank you for completing all sections of the survey. Your responses have been recorded.
    </Typography>
  </Paper>
}

export default FormHomePage;
