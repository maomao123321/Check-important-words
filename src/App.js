import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import VoiceInput from './VoiceInput';
import CheckInChat from './CheckInChat';

function App() {
  const [input, setInput] = useState('');
  const [inputCounter, setInputCounter] = useState(0);

  const handleSend = (message) => {
    setInput(message);
    setInputCounter(prev => prev + 1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Title */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        my: 4
      }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 'bold',
          }}
        >
          Double Check Important Words
        </Typography>
      </Box>

      {/* VoiceInput */}
      <Box sx={{ mb: 2 }}>
        <VoiceInput onSend={handleSend} />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CheckInChat input={input} inputCounter={inputCounter} />
      </Box>
    </Box>
  );
}

export default App;