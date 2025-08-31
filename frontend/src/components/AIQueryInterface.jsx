import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Book, Loader, CheckCircle, AlertCircle, Brain, Zap, BookOpen, Sparkles, Volume2, Languages, Headphones } from 'lucide-react';
import { askQuestionWithAudio,getVoices,askQuestion,generateAudio, getAllBooks } from '../services/api';
import AudioPlayer from './AudioPlayer';

const AIQueryInterface = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('hi-IN-kabir');
  const [generateAudioFlag, setGenerateAudioFlag] = useState(true);

  useEffect(() => {
    fetchBooks();
    fetchVoices();
  }, []);

  const fetchBooks = async () => {
    try {
      const result = await getAllBooks();
      setBooks(result.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchVoices = async () => {
    try {
      const result = await getVoices();
      setVoices(result.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
    //   const result = await askQuestion(
    //     query,
    //     selectedBooks.length > 0 ? selectedBooks : null,
    //     5
     const result = await askQuestionWithAudio(
        query,
        selectedBooks.length > 0 ? selectedBooks : null,
        selectedVoice,
        generateAudioFlag
      );
      
      setResponse(result);
    } catch (error) {
      console.error('AI query error:', error);
      setResponse({
        success: false,
        answer: 'Error: ' + (error.response?.data?.detail || error.message),
        query: query,
        sources: [],
        chunks_used: [],
        audio:null
      });
    }

    setLoading(false);
  };


  const handleRegenerateAudio = async () => {
    if (!response?.answer) return;

    setAudioLoading(true);
    try {
      const audioResult = await generateAudio(response.answer, selectedVoice);
      setResponse(prev => ({
        ...prev,
        audio: audioResult,
        voice_used: selectedVoice
      }));
    } catch (error) {
      console.error('Audio regeneration error:', error);
      alert('Error generating audio: ' + error.message);
    }
    setAudioLoading(false);
  };


  const groupVoicesByLanguage = (voices) => {
    const groups = {};
    voices.forEach(voice => {
      const langName = voice.language_name || 'Other';
      if (!groups[langName]) {
        groups[langName] = [];
      }
      groups[langName].push(voice);
    });
    return groups;
  };


  const readyBooks = books.filter(book => 
    book.embedded_chunks > 0 && book.embedded_chunks === book.chunk_count
  );


  const voiceGroups = groupVoicesByLanguage(voices);

  // return (
  //   <div className="max-w-4xl mx-auto p-6">
  //     <h2 className="text-2xl font-bold mb-6">Ask AI with Audio (Multi-language)</h2>
      
  //     {/* Status */}
  //     <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  //       <p className="text-sm text-blue-700">
  //         <strong>Ready:</strong> {readyBooks.length} books available for AI questioning
  //       </p>
  //     </div>

  //   {/* Audio Settings */}
  //     <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
  //       <h3 className="font-medium mb-3">Language and Audio Settings</h3>
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //         <div>
  //           <label className="block text-sm font-medium mb-1">Select Voice & Language:</label>
  //           <select
  //             value={selectedVoice}
  //             onChange={(e) => setSelectedVoice(e.target.value)}
  //             className="w-full p-2 border border-gray-300 rounded"
  //           >
  //               {Object.entries(voiceGroups).map(([language, voiceList]) => (
  //               <optgroup key={language} label={language}>
  //                   {voiceList.map((voice) => (
  //               <option key={voice.id} value={voice.id}>
  //                 {voice.name}
  //               </option>
  //             ))}
  //             </optgroup>
  //             ))}
  //           </select>
  //           <p className="text-xs text-gray-600 mt-1">
  //             AI will respond in the selected language, and audio will be generated accordingly.
  //           </p>
  //         </div>
  //         <div className="flex items-center">
  //           <label className="flex items-center space-x-2">
  //             <input
  //               type="checkbox"
  //               checked={generateAudioFlag}
  //               onChange={(e) => setGenerateAudioFlag(e.target.checked)}
  //             />
  //             <span className="text-sm">Generate audio automatically</span>
  //           </label>
  //         </div>
  //       </div>
  //     </div>


  //   {/* Sample Questions */}
  //     <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  //       <h3 className="font-medium mb-2">Sample Questions (Try these!):</h3>
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
  //         <div>
  //           <strong>English:</strong>
  //           <ul className="ml-4 list-disc">
  //             <li>What is photosynthesis?</li>
  //             <li>Explain Newton's laws</li>
  //           </ul>
  //         </div>
  //         <div>
  //           <strong>Hindi:</strong>
  //           <ul className="ml-4 list-disc">
  //             <li>प्रकाश संश्लेषण क्या है?</li>
  //             <li>न्यूटन के नियम बताइए</li>
  //           </ul>
  //         </div>
  //       </div>
  //     </div>


  //     {/* Book Selection */}
  //     {readyBooks.length > 0 && (
  //       <div className="mb-6">
  //         <h3 className="text-lg font-medium mb-3">Ask about specific books (optional):</h3>
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
  //           {readyBooks.map((book) => (
  //             <label key={book._id} className="flex items-center space-x-2 p-2 border rounded">
  //               <input
  //                 type="checkbox"
  //                 checked={selectedBooks.includes(book._id)}
  //                 onChange={() => setSelectedBooks(prev => 
  //                   prev.includes(book._id)
  //                     ? prev.filter(id => id !== book._id)
  //                     : [...prev, book._id]
  //                 )}
  //               />
  //               <span className="text-sm">{book.filename}</span>
  //             </label>
  //           ))}
  //         </div>
  //       </div>
  //     )}

  //     {/* Question Form */}
  //     <form onSubmit={handleAskQuestion} className="mb-6">
  //       <div className="flex gap-2">
  //         <input
  //           type="text"
  //           value={query}
  //           onChange={(e) => setQuery(e.target.value)}
  //           placeholder="Ask a question about your textbooks..."
  //           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  //           disabled={loading}
  //         />
  //         <button
  //           type="submit"
  //           disabled={loading || readyBooks.length === 0}
  //           className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
  //         >
  //           {loading ? 'AI Thinking...' : 'Ask AI'}
  //         </button>
  //       </div>
  //     </form>

  //     {/* No Books Warning */}
  //     {readyBooks.length === 0 && (
  //       <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  //         <p className="text-yellow-700">
  //           No books ready for AI questioning. Upload textbooks and wait for embedding generation to complete.
  //         </p>
  //       </div>
  //     )}

  //     {/* AI Response */}
  //     {response && (
  //       <div className="space-y-6">
  //         {/* Main Answer */}
  //         <div className={`p-6 rounded-lg ${response.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
  //           <div className="flex items-start justify-between mb-4">
  //             <h3 className="text-lg font-bold text-gray-800">AI Answer</h3>
  //             <div className="text-sm text-gray-500">
  //               {response.sources?.length > 0 && (
  //                 <span>Sources: {response.sources.join(', ')}</span>
  //               )}
  //             </div>
  //           </div>
            
  //           <div className="prose prose-sm max-w-none">
  //             <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
  //               {response.answer}
  //             </div>
  //           </div>
            
  //           {response.note && (
  //             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
  //               <p className="text-sm text-yellow-700">{response.note}</p>
  //             </div>
  //           )}
  //         </div>

  //       {/* Audio Player */}
  //         {response.audio && response.audio.success && (
  //           <AudioPlayer 
  //             audioUrl={response.audio.audio_url}
  //             audioInfo={response.audio}
  //             onRegenerate={handleRegenerateAudio}
  //           />
  //         )}

  //           {/* Audio Regeneration */}
  //         {response.success && !response.audio?.success && (
  //           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  //             <p className="text-yellow-700 mb-3">Audio generation failed or was disabled.</p>
  //             <button
  //               onClick={handleRegenerateAudio}
  //               disabled={audioLoading}
  //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
  //             >
  //               {audioLoading ? 'Generating Audio...' : 'Generate Audio'}
  //             </button>
  //           </div>
  //         )}


  //         {/* Source Chunks Used */}
  //         {response.chunks_used && response.chunks_used.length > 0 && (
  //           <div>
  //             <h4 className="text-lg font-medium mb-4">
  //               Source Content Used ({response.chunks_used.length} chunks)
  //             </h4>
  //             <div className="space-y-3">
  //               {response.chunks_used.map((chunk, index) => (
  //                 <div key={chunk.chunk_id} className="border rounded p-3 bg-gray-50">
  //                   <div className="flex items-center justify-between mb-2">
  //                     <div className="flex items-center gap-2">
  //                       <span className="text-sm font-medium text-blue-600">Source {index + 1}</span>
  //                       <span className="text-xs text-gray-600">{chunk.book_filename}</span>
  //                       {chunk.chapter && (
  //                         <span className="text-xs bg-blue-100 px-2 py-1 rounded">{chunk.chapter}</span>
  //                       )}
  //                     </div>
  //                     <span className="text-xs text-gray-500">
  //                       {(chunk.similarity_score * 100).toFixed(1)}% match
  //                     </span>
  //                   </div>
  //                   <div className="text-sm text-gray-700">
  //                     {chunk.content}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );
return (
  <div className="min-h-[85vh] p-8 md:p-12">
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black text-gradient">AI Assistant with Audio</h2>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Ask intelligent questions about your textbooks and get comprehensive answers with multi-language audio support
        </p>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-800 mb-1">
              {readyBooks.length} books ready for AI assistance
            </p>
            <p className="text-green-700">Your textbooks are processed and ready for intelligent questioning</p>
          </div>
        </div>
      </motion.div>

      {/* Audio Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-8 rounded-3xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <Languages className="w-7 h-7 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-800">Language & Audio Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-700">Select Voice & Language:</label>
            <div className="relative">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="input-modern w-full pl-12 pr-6 py-4 text-lg appearance-none bg-white"
              >
                {Object.entries(voiceGroups).map(([language, voiceList]) => (
                  <optgroup key={language} label={language}>
                    {voiceList.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Headphones className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              AI will respond in the selected language, and audio will be generated accordingly.
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:shadow-lg transition-all">
              <input
                type="checkbox"
                checked={generateAudioFlag}
                onChange={(e) => setGenerateAudioFlag(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-semibold text-purple-700">Generate audio automatically</span>
              </div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Sample Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-card p-8 rounded-3xl"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Sample Questions (Try these!):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">EN</span>
              </div>
              <strong className="text-lg text-gray-800">English:</strong>
            </div>
            <div className="space-y-2">
              {[
                "What is photosynthesis?",
                "Explain Newton's laws"
              ].map((question, index) => (
                <motion.button
                  key={question}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  onClick={() => setQuery(question)}
                  className="text-left p-3 rounded-xl bg-gradient-to-r from-white to-blue-50 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group w-full"
                >
                  <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                    {question}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">हि</span>
              </div>
              <strong className="text-lg text-gray-800">Hindi:</strong>
            </div>
            <div className="space-y-2">
              {[
                "प्रकाश संश्लेषण क्या है?",
                "न्यूटन के नियम बताइए"
              ].map((question, index) => (
                <motion.button
                  key={question}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  onClick={() => setQuery(question)}
                  className="text-left p-3 rounded-xl bg-gradient-to-r from-white to-orange-50 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all group w-full"
                >
                  <span className="text-gray-700 group-hover:text-orange-600 font-medium">
                    {question}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Book Selection */}
      {readyBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-8 rounded-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-800">Focus on Specific Books (Optional)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyBooks.map((book, index) => (
              <motion.label
                key={book._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`
                  flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group hover-lift
                  ${selectedBooks.includes(book._id)
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-glow'
                    : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg'}
                `}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book._id)}
                    onChange={() => setSelectedBooks(prev => 
                      prev.includes(book._id)
                        ? prev.filter(id => id !== book._id)
                        : [...prev, book._id]
                    )}
                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 focus:ring-2"
                  />
                  {selectedBooks.includes(book._id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-blue-600 rounded-lg flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {book.filename}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
                  <Book className="w-4 h-4 text-white" />
                </div>
              </motion.label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Question Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card p-8 rounded-3xl"
      >
        <form onSubmit={handleAskQuestion} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Brain className="w-6 h-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any question about your textbooks in any language..."
              className="input-modern w-full pl-16 pr-6 py-6 text-lg font-medium"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
              <motion.div
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || readyBooks.length === 0}
            className="btn-modern w-full text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-7 h-7 animate-spin" />
                AI is thinking...
              </>
            ) : (
              <>
                <Brain className="w-7 h-7" />
                Ask AI Assistant
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* No Books Warning */}
      <AnimatePresence>
        {readyBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="badge-warning flex items-center gap-4 p-6 rounded-2xl shadow-lg"
          >
            <AlertCircle className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold mb-1">No Books Ready</p>
              <p>Please upload textbooks and wait for processing to complete before using the AI assistant.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Main Answer */}
            <div className={`neo-card p-8 rounded-3xl border-2 hover-lift ${
              response.success 
                ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
                : 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'
            }`}>
              <div className="flex items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    response.success 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-red-400 to-red-600'
                  }`}>
                    {response.success ? (
                      <Brain className="w-6 h-6 text-white" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">AI Response</h3>
                </div>
                {response.sources?.length > 0 && (
                  <div className="badge-success">
                    {response.sources.length} source{response.sources.length !== 1 ? 's' : ''} analyzed
                  </div>
                )}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {response.answer}
                </div>
              </div>
              
              {response.note && (
                <div className="mt-6 badge-warning p-6 rounded-2xl">
                  <p className="font-semibold">{response.note}</p>
                </div>
              )}
            </div>

            {/* Audio Player */}
            {response.audio && response.audio.success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card p-8 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Audio Response</h4>
                </div>
                <AudioPlayer 
                  audioUrl={response.audio.audio_url}
                  audioInfo={response.audio}
                  onRegenerate={handleRegenerateAudio}
                />
              </motion.div>
            )}

            {/* Audio Regeneration */}
            {response.success && !response.audio?.success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-card p-6 rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <p className="text-yellow-800 font-semibold">Audio generation failed or was disabled.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegenerateAudio}
                    disabled={audioLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {audioLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Generate Audio
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Source Chunks */}
            {response.chunks_used && response.chunks_used.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Book className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">
                    Source Content ({response.chunks_used.length} excerpts)
                  </h4>
                </div>
                
                <div className="space-y-6">
                  {response.chunks_used.map((chunk, index) => (
                    <motion.div
                      key={chunk.chunk_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-card p-8 rounded-2xl hover-lift group"
                    >
                      <div className="flex items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <span className="text-lg font-bold text-gray-800">{chunk.book_filename}</span>
                            {chunk.chapter && (
                              <div className="badge-success mt-1 inline-block">
                                {chunk.chapter}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="badge-success">
                            {(chunk.similarity_score * 100).toFixed(1)}% relevance
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                        <div className="text-gray-800 leading-relaxed font-medium">
                          {chunk.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default AIQueryInterface;