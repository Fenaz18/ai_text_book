import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};



export const askQuestionWithAudio = async (query, bookIds = null, voiceId = 'en-US-ken', generateAudio = true) => {
  const response = await api.post('/ask-with-audio', {
    query,
    book_ids: bookIds,
    voice_id: voiceId,
    generate_audio: generateAudio
  });
  return response.data;
};

export const getVoices = async () => {
  const response = await api.get('/voices');
  return response.data;
};

export const generateAudio = async (text, voiceId = 'en-US-ken') => {
  const response = await api.post('/generate-audio', {
    text,
    voice_id: voiceId
  });
  return response.data;
};

export const searchChunks = async (query, bookIds = null, topK = 5, minSimilarity = 0.1) => {
  const response = await api.post('/search', {
    query,
    book_ids: bookIds,
    top_k: topK,
    min_similarity: minSimilarity ,
  });
  return response.data;
};


export const getEmbeddingStatus = async (bookId) => {
  const response = await api.get(`/books/${bookId}/embedding-status`);
  return response.data;
};

export const askQuestion = async (query, bookIds = null, topK = 5) => {
  const response = await api.post('/ask', {
    query,
    book_ids: bookIds,
    top_k: topK,
    min_similarity: 0.3  // Higher threshold for AI responses
  });
  return response.data;
};


export const generateEmbeddings = async (bookId) => {
  const response = await api.post(`/books/${bookId}/generate-embeddings`);
  return response.data;
};


export const getBookChunks = async (bookId) => {
  const response = await api.get(`/books/${bookId}/chunks`);
  return response.data;
};

export const getBookStats = async (bookId) => {
  const response = await api.get(`/books/${bookId}/stats`);
  return response.data;
};

export const getAllBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};


export const deleteBook = async (bookId) => {
  const response = await api.delete(`/books/${bookId}`);
  return response.data;
};

export default api;