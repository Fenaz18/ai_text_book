# 🎓 EduAI Voice: Multilingual Textbook Assistant

An AI-powered educational platform that transforms static textbooks into interactive, multilingual learning experiences with voice synthesis capabilities.

## 🌟 Features

### Core Functionality
- **📚 PDF Processing**: Upload and automatically chunk textbook content
- **🔍 Semantic Search**: AI-powered content discovery using vector embeddings
- **🤖 AI Q&A**: Generate intelligent answers using Google Gemini AI
- **🎙️ Voice Synthesis**: Convert responses to natural speech using Murf AI
- **🌍 Multilingual Support**: 8+ Indian languages (Hindi, Tamil, Telugu, etc.)

### Advanced Capabilities
- **Smart Chunking**: Intelligent text segmentation with context preservation
- **Vector Search**: Sentence-transformer based semantic similarity
- **Language Detection**: Automatic target language identification from voice selection
- **Cross-book Queries**: Search and analyze content across multiple textbooks
- **Audio Management**: Download, play, and regenerate audio in different voices

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with vector indexing
- **AI Services**: Google Gemini API, Murf AI API
- **ML/NLP**: Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Search**: Scikit-learn cosine similarity
- **PDF Processing**: PyPDF2

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API Communication**: Axios

### DevOps & Tools
- **Environment**: Python virtual environment, Node.js
- **Package Management**: pip, npm
- **Development**: Hot-reload servers, CORS handling

## 🚀 Quick Start

### Prerequisites
```bash
- Python 3.8+
- Node.js 16+
- MongoDB (local installation)
- Google Gemini API key
- Murf AI API key
