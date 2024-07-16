import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, IconButton } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import axios from 'axios';


const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: { 'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` }
});

function CheckInChat({ input }) {
  const [aiMessage, setAiMessage] = useState('');
  const [keyword, setKeyword] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalNote, setFinalNote] = useState('');
  const [correctedInput, setCorrectedInput] = useState('');
  const [relatedWords, setRelatedWords] = useState([]);
  const [relatedImages, setRelatedImages] = useState([]);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const MAX_REGENERATE_COUNT = 2;
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);
  


  useEffect(() => {
    if (input) {
      setLoading(true);
      correctSpelling(input);
    }
  }, [input]);


  const correctSpelling = async (text) => {
    try {
      const response = await openai.post('/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that corrects spelling mistakes. Only output the corrected sentence, nothing else." },
          { role: "user", content: text }
        ]
      });
      const corrected = response.data.choices[0].message.content.trim();
      setCorrectedInput(corrected);
      setAiMessage(`Did you mean "${corrected}"?`);
      extractKeyword(corrected);
    } catch (error) {
      console.error('Error correcting spelling:', error);
      setLoading(false);
    }
  };

  const extractKeyword = async (text) => {
    try {
      const response = await openai.post('/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Extract all important noun and date from the following text. Respond with only that word or date." },
          { role: "user", content: text }
        ]
      });
      const extractedKeyword = response.data.choices[0].message.content.trim();
      setKeyword(extractedKeyword);
      generateImage(extractedKeyword);
    } catch (error) {
      console.error('Error extracting keyword:', error);
      setLoading(false);
    }
  };

  const generateImage = async (prompt) => {
    try {
      const response = await openai.post('/images/generations', {
        model: "dall-e-3",
        prompt: `A clear, simple image representing ${prompt}`,
        n: 1,
        size: "256x256"
      });
      setImageUrl(response.data.data[0].url);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (isCorrect) => {
    if (isCorrect) {
      setFinalNote(`Your final notes: ${correctedInput}`);
      setImageUrl('');
      setRelatedWords([]);
      setRelatedImages([]);
    } else {
      setLoading(true);
      generateRelatedWords(keyword);
    }
  };

  const generateRelatedWords = async (word) => {
    try {
      const response = await openai.post('/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `Given a correctly spelled word, generate three alternative words that the user might have actually meant. Follow these rules:
            1. The first word should correct a possible phonetic error (the user's word sounds similar but is spelled incorrectly).
            2. The second word should correct a possible semantic error (the user might have used a word with a similar meaning but not the one they intended).
            3. The third word should correct a possible mixed error (combining aspects of phonetic and semantic errors).
            4. All suggested words should be common, everyday words that are easy to understand.
            5. Avoid obscure or rarely used words.
            6. Each time this prompt is run, try to generate different words from previous runs.

            Example:
            Given word: "cat"
            Possible outputs:
            - First run: bat, pet, dog
            - Second run: hat, cloud, horse
            - Third run: sat, fruit, fish
  
            Explanation:
            - 'bat, hat, sat' corrects the phonetic error (rhymes with it)
            - 'pet, cloud, fruit' corrects a possible mixed error (user might have meant a general term for a domestic animal)
            - 'dog, horse, fish' corrects a possible semantic error (sounds somewhat similar and is also a common pet)

  
            Respond with only these three words, separated by commas.` },
          { role: "user", content: word }
        ],
        temperature: 0.8,  // 增加随机性
      });
      const words = response.data.choices[0].message.content.split(',').map(w => w.trim());
      setRelatedWords(words);
      setAiMessage("You just denied, so which did you mean?");
  
      // Generate images for related words
      await generateRelatedImages(words);
    } catch (error) {
      console.error('Error generating related words:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRelatedImages = async (words) => {
    setLoading(true);
    try {
      const images = await Promise.all(words.map(async (word) => {
        try {
          return await retryWithExponentialBackoff(async () => {
            const response = await openai.post('/images/generations', {
              model: "dall-e-3",
              prompt: `A clear, simple image representing ${word}`,
              n: 1,
              size: "256x256"
            });
            return response.data.data[0].url;
          });
        } catch (error) {
          console.error(`Error generating image for "${word}":`, error);
          return null; // 返回 null 而不是抛出错误
        }
      }));
      setRelatedImages(images);
    } catch (error) {
      console.error('Error generating related images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (regenerateCount >= MAX_REGENERATE_COUNT) {
        return;  // 如果已达到最大重新生成次数，直接返回
      }

    setLoading(true);
    setRegenerateCount(prevCount => prevCount + 1);
    setSelectedWordIndex(null); // 重置选择
    
    try {
      // 重新生成相关词
      const response = await openai.post('/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `Given a correctly spelled word, generate three alternative words that the user might have actually meant. Follow these rules:
            1. The first word should correct a possible phonetic error (the user's word sounds similar but is spelled incorrectly).
            2. The second word should correct a possible semantic error (the user might have used a word with a similar meaning but not the one they intended).
            3. The third word should correct a possible mixed error (combining aspects of phonetic and semantic errors).
            4. All suggested words should be common, everyday words that are easy to understand.
            5. Avoid obscure or rarely used words.
            6. Each time this prompt is run, try to generate different words from previous runs.
  
            Current regeneration count: ${regenerateCount + 1}
  
            Respond with only these three words, separated by commas.` },
          { role: "user", content: keyword }
        ],
        temperature: 0.8,  // 增加随机性
      });
      const words = response.data.choices[0].message.content.split(',').map(w => w.trim());
      setRelatedWords(words);
      setAiMessage("You just denied, so which did you mean?");
  
      // 为新生成的词重新生成图片
      await generateRelatedImages(words);
    } catch (error) {
      console.error('Error in handleRegenerate:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleWordSelection = (index) => {
    setSelectedWordIndex(index);
  };
  
  const handleConfirm = () => {
    if (selectedWordIndex !== null) {
      const selectedWord = relatedWords[selectedWordIndex];
      const updatedSentence = correctedInput.replace(keyword, selectedWord);
      setFinalNote(`Your final notes: ${updatedSentence}`);
      setRelatedWords([]);
      setRelatedImages([]);
      setRegenerateCount(0); //重置重新生成计数
    }
  };

  //重试函数，遇到速率限制自动请求重试
  const retryWithExponentialBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // 指数退避
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries reached');
  };

  const textToSpeech = async (text) => {
    try {
      const response = await openai.post('/audio/speech', {
        model: "tts-1",
        voice: "alloy",
        input: text
      }, {
        responseType: 'arraybuffer'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
    }
  };


  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      p: 2 
    }}>
      <Card sx={{ 
        width: '80%', 
        maxWidth: '600px', 
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
              <CardContent>
        {!input && !loading && !aiMessage && !finalNote ? (
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.secondary', fontStyle: 'italic' }}
          >
            AI will double-check your notes here
          </Typography>
        ) : finalNote ? (
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            {finalNote}
            <IconButton onClick={() => textToSpeech(finalNote)} size="small">
              <VolumeUpIcon />
            </IconButton>
          </Typography>
        ) : (
          <>
            {aiMessage && (
              <Typography 
                variant="h4" 
                align="center"
                sx={{ fontWeight: 'bold', mb: 2 }}
              >
                {aiMessage}
                <IconButton onClick={() => textToSpeech(aiMessage)} size="small">
                    <VolumeUpIcon />
                </IconButton>
              </Typography>
            )}
              {loading ? (
                <CircularProgress />
              ) : imageUrl && !relatedWords.length ? (
                <Box sx={{ 
                  width: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center'
                }}>
                  <img 
                    src={imageUrl} 
                    alt={keyword} 
                    style={{ width: '100%', height: 'auto', maxHeight: '40vh' }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <IconButton 
                      onClick={() => handleFeedback(true)} 
                      sx={{ mr: 2 }}
                      color="primary"
                    >
                      <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleFeedback(false)} 
                      sx={{ ml: 2 }}
                      color="error"
                    >
                      <CancelOutlinedIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                  </Box>
                </Box>
              ) : relatedWords.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', mt: 2 }}>
                    {relatedWords.map((word, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          cursor: 'pointer',
                          border: selectedWordIndex === index ? '2px solid blue' : 'none',
                          padding: '5px',
                        }}
                        onClick={() => handleWordSelection(index)}
                      >
                        <Typography variant="h6" sx={{ mb: 1 }}>{word}
                         <IconButton onClick={(e) => { e.stopPropagation(); textToSpeech(word); }} size="small">
                           <VolumeUpIcon />
                         </IconButton>
                        </Typography>
                        {relatedImages[index] ? (
                          <img 
                            src={relatedImages[index]} 
                            alt={word} 
                            style={{ width: '100%', height: 'auto', maxWidth: '150px' }} 
                          />
                        ) : (
                            <Box 
                              sx={{ 
                                width: '150px', 
                                height: '150px', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                backgroundColor: '#f0f0f0' 
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">Image unavailable</Typography>
                            </Box>
                          )}
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <IconButton 
                      onClick={handleConfirm} 
                      color="primary"
                      disabled={selectedWordIndex === null}
                    >
                      <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                    <IconButton 
                      onClick={handleRegenerate} 
                      color="error"
                      disabled={regenerateCount >= MAX_REGENERATE_COUNT && (
                        <Typography variant="caption" color="text.secondary" sx={{mt:1}}>
                            Max reached
                        </Typography>                      
                        )}
                    >
                      <CancelOutlinedIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                  </Box>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default CheckInChat;