import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Paper, LinearProgress, Alert, TextField, CircularProgress
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

// --- ICONS ---
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import FastForwardOutlinedIcon from '@mui/icons-material/FastForwardOutlined';

// --- THEME AND STYLES ---
let theme = createTheme({
  palette: {
    primary: { 
      main: '#F57C00',
      light: 'rgba(245, 124, 0, 0.08)',
    },
    secondary: { main: '#B31B1B' },
    text: { primary: '#2c3e50', secondary: '#34495e' },
    background: { default: '#f8f9fa', paper: '#FFFFFF' },
    action: { hover: 'rgba(245, 124, 0, 0.04)' }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, color: '#B31B1B', textAlign: 'center' },
    h2: { fontWeight: 600, color: '#B31B1B', textAlign: 'center', marginBottom: '1.5rem' },
    h5: { color: '#F57C00', fontWeight: 600, borderBottom: '2px solid #F57C00', paddingBottom: '0.5rem', marginBottom: '1rem' },
    body1: { fontSize: '1rem', color: '#2c3e50' },
    body2: { fontSize: '0.9rem', color: '#34495e' },
  },
});
theme = responsiveFontSizes(theme);

const containerStyles = {
  padding: { xs: 2, sm: 3, md: 4 },
  margin: { xs: '1rem auto', md: '2rem auto' },
  borderRadius: '15px',
  backgroundColor: 'background.paper',
  border: '1px solid #e9ecef',
  maxWidth: { xs: '100%', sm: '700px', md: '800px' },
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
};

function App() {
  const [step, setStep] = useState('welcome');
  const [userInfo, setUserInfo] = useState({ 
    name: '', 
    organization: '',
    department: '', 
    jobTitle: '',
    experience: ''
  });
  const [responses, setResponses] = useState({ start: '', stop: '', continue: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleStart = () => {
    if (
      userInfo.name.trim() && 
      userInfo.organization.trim() && 
      userInfo.department.trim() && 
      userInfo.jobTitle.trim() && 
      userInfo.experience.trim()
    ) {
      setError('');
      setStep('assessment');
    } else {
      setError('Please fill out all fields to continue.');
    }
  };

  const handleResponseChange = (field, value) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!responses.start.trim() || !responses.stop.trim() || !responses.continue.trim()) {
      setError('Please answer all three questions before submitting.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    const payload = {
      name: userInfo.name,
      organization: userInfo.organization,
      department: userInfo.department,
      jobTitle: userInfo.jobTitle,
      experience: userInfo.experience,
      start: responses.start,
      stop: responses.stop,
      continue: responses.continue,
      timestamp: new Date().toLocaleString()
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      await axios.post(`${backendUrl}/api/submit`, payload);
      setStep('submitted');
    } catch (error) {
      console.error("Failed to save results:", error);
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    let filled = 0;
    if (responses.start.trim()) filled += 1;
    if (responses.stop.trim()) filled += 1;
    if (responses.continue.trim()) filled += 1;
    return (filled / 3) * 100;
  };

  const renderWelcome = () => (
    <Paper elevation={3} sx={containerStyles}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box component="img" src="/logo.png" alt="Carnelian Logo" sx={{ maxWidth: { xs: '100px', sm: '120px' }, height: 'auto' }} />
        <Typography variant="h1">Post-Training Reflection</Typography>
      </Box>
      <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal', px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
        Reflect on your training session. Identify one habit to start, one to stop, and one to continue.
      </Typography>
      <Box sx={{ maxWidth: { xs: '100%', sm: 400 }, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2, px: { xs: 1, sm: 0 } }}>
        <TextField fullWidth label="Your Name" variant="outlined" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
        <TextField fullWidth label="Your Organization" variant="outlined" value={userInfo.organization} onChange={(e) => setUserInfo({ ...userInfo, organization: e.target.value })} />
        <TextField fullWidth label="Your Department" variant="outlined" value={userInfo.department} onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })} />
        <TextField fullWidth label="Your Job Title" variant="outlined" value={userInfo.jobTitle} onChange={(e) => setUserInfo({ ...userInfo, jobTitle: e.target.value })} />
        <TextField fullWidth label="Years of Experience" variant="outlined" type="number" value={userInfo.experience} onChange={(e) => setUserInfo({ ...userInfo, experience: e.target.value })} />
        
        {error && <Alert severity="error">{error}</Alert>}
        
        <Button variant="contained" size="large" color="primary" onClick={handleStart} startIcon={<RocketLaunchIcon />} sx={{ mt: 2, py: 1.5, width: { xs: '100%', sm: 'auto' }, alignSelf: 'center' }}>
          Begin Questionnaire
        </Button>
      </Box>
    </Paper>
  );

  const renderAssessment = () => {
    const progress = calculateProgress();

    return (
      <Paper sx={containerStyles}>
        <Box sx={{ mb: 4, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1, pt: 2, px: { xs: 1, sm: 2 } }}>
          <Typography variant="h2">Start, Stop, Continue</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: '8px', borderRadius: '4px', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" align="right">{Math.round(progress)}% Completed</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2e7d32', borderColor: '#2e7d32' }}><PlayCircleOutlineIcon /> START</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>What is one new habit, action, or behavior you will <strong>start</strong> doing as a result of this training?</Typography>
            <TextField fullWidth multiline rows={3} placeholder="I will start..." variant="outlined" value={responses.start} onChange={(e) => handleResponseChange('start', e.target.value)} />
          </Box>

          <Box>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#c62828', borderColor: '#c62828' }}><StopCircleOutlinedIcon /> STOP</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>What is one habit, action, or behavior you will <strong>stop</strong> doing?</Typography>
            <TextField fullWidth multiline rows={3} placeholder="I will stop..." variant="outlined" value={responses.stop} onChange={(e) => handleResponseChange('stop', e.target.value)} />
          </Box>

          <Box>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1565c0', borderColor: '#1565c0' }}><FastForwardOutlinedIcon /> CONTINUE</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>What is one positive habit, action, or behavior you will <strong>continue</strong> doing?</Typography>
            <TextField fullWidth multiline rows={3} placeholder="I will continue..." variant="outlined" value={responses.continue} onChange={(e) => handleResponseChange('continue', e.target.value)} />
          </Box>
        </Box>

        {error && <Alert severity="warning" sx={{ mt: 3 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, pt: 3, borderTop: '1px solid #eee' }}>
          <Button variant="contained" size="large" color="primary" onClick={handleSubmit} disabled={isSubmitting} endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} sx={{ px: 5, py: 1.5 }}>
            {isSubmitting ? 'Submitting...' : 'Submit Responses'}
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderSubmitted = () => (
    <Paper sx={{ ...containerStyles, textAlign: 'center', py: 6 }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h1" gutterBottom>Thank You, {userInfo.name}!</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your Start, Stop, Continue feedback has been successfully recorded. 
        We appreciate your commitment to continuous improvement.
      </Typography>
      
      <Box sx={{ backgroundColor: 'primary.light', p: 3, borderRadius: 2, textAlign: 'left' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>Your Commitments:</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}><strong>Start:</strong> {responses.start}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}><strong>Stop:</strong> {responses.stop}</Typography>
        <Typography variant="body2"><strong>Continue:</strong> {responses.continue}</Typography>
      </Box>
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" sx={{ mt: { xs: 2, sm: 3 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        {step === 'welcome' && renderWelcome()}
        {step === 'assessment' && renderAssessment()}
        {step === 'submitted' && renderSubmitted()}
      </Container>
    </ThemeProvider>
  );
}

export default App;