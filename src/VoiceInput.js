import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
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
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 2,
        backgroundColor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        value={input}
        onChange={handleInputChange}
        placeholder="Input your notes here:  'Meet on Friday'"
        sx={{ mr: 1 }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
      />
      <IconButton onClick={handleVoiceInput} color={isRecording ? "secondary" : "primary"}>
        <MicIcon />
      </IconButton>
      <IconButton onClick={handleSend} color="primary">
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default VoiceInput;