import React, { useState } from 'react';
import { Box, Typography, IconButton} from '@mui/material';
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
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'relative', 
    my: 4 
  }}>
    <Typography
      variant="h2"
      sx={{
        fontWeight: 'bold',
        mr: 4  // 添加右边距，为图标腾出空间
      }}
    >
      Double Check Important Words
    </Typography>
    <IconButton
      onClick={handleReset}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
      }}
    >
        <HomeIcon sx={{fontSize: 48}} />
          <Typography 
          variant="subtitle1" 
          sx={{
            mt:1,
            fontweight:"bold"
          }}
        
          >Clear</Typography>
        </IconButton>
      </Box>

      {/* VoiceInput */}
      <Box sx={{ mb: 2 }}>
        <VoiceInput onSend={handleSend} />
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CheckInChat input={input} />
      </Box>
    </Box>
  );
}

export default App;