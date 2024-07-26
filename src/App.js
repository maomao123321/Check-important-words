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


            {/* VoiceInput and Refresh Icon */}
            <Box sx={{ 
        mb: 2, 
        position: 'relative',  // 添加相对定位
      }}>
        <VoiceInput onSend={handleSend} />
        <Box sx={{ 
          position: 'absolute',  // 绝对定位
          right: 0,  // 放置在最右侧
          top: '50%',  // 垂直居中
          transform: 'translateY(-50%)',  // 精确垂直居中
          display: 'flex', 
          alignItems: 'center',
          ml: 2,  // 左边距，与输入组件保持一定距离
        }}>
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
              ml: 1,
              fontWeight: "bold",
              maxWidth: '150px',
              lineHeight: 1.2
            }}
          >
            Input new, should clear first
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CheckInChat input={input} />
      </Box>
    </Box>
  );
}

export default App;