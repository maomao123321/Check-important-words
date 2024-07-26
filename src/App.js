import React, { useState } from 'react';
import { Box, Typography, IconButton} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
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

      {/* Refresh Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton
          onClick={handleReset}
          sx={{
            padding: '12px',
          }}
        >
          <RefreshIcon sx={{fontSize: 40}} />
        </IconButton>
        <Typography 
          variant="subtitle1"
          sx={{
            ml: 2,
            fontWeight: "bold",
            maxWidth: '200px',
            lineHeight: 1.2
          }}
        >
          Input new, should clear first
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CheckInChat input={input} />
      </Box>
    </Box>
  );
}

export default App;