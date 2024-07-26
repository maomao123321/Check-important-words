import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';

function VoiceInput({ onSend }) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleVoiceInput = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          await transcribeAudio(audioBlob);
        };

        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setInput(response.data.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };


  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <TextField
        variant="outlined"
        value={input}
        onChange={handleInputChange}
        placeholder="Input your important information here:  'Meet on Friday'"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        sx={{ 
          width: '60%',
          mr: 2,
          '& .MuiInputBase-root': {
            height: '4rem',  // 增加整个输入框的高度
          },
          '& .MuiInputBase-input': {
            fontSize: '1.4rem',
            height: '4rem',  // 匹配外部容器的高度
            padding: '0 1rem',  // 调整左右内边距，移除上下内边距
            display: 'flex',
            alignItems: 'center',  // 确保文字垂直居中
          }
        }}
      />
       <IconButton
        onClick={handleVoiceInput}
        color={isRecording ? "error" : "primary"}
        sx={{ mr: 1 }}
      >
        {isRecording ? <StopIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
      </IconButton>
      <IconButton 
        onClick={handleSend} 
        color="primary"
      >
        <SendIcon sx={{ fontSize: 40 }} />
      </IconButton>
    </Box>
  );
}

export default VoiceInput;