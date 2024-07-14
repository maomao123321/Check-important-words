import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VoiceInput from './VoiceInput';
import CheckInChat from './CheckInChat';

function App() {
  const [input, setInput] = useState('');

  const handleSend = (message) => {
    setInput(message);
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Title and Home Icon */}
      <Box sx={{ position: 'relative', my: 4 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: 'bold',
          }}
        >
          Check-in Notes
        </Typography>
        <IconButton
          onClick={handleReset}
          sx={{
            position: 'absolute',
            top: '50%',
            right: 16,
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <HomeIcon fontSize="large" />
          <Typography variant="caption">Refresh</Typography>
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CheckInChat input={input} />
        <VoiceInput onSend={handleSend} />
      </Box>
    </Box>
  );
}

export default App;