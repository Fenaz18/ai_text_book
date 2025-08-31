import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, RotateCcw, Volume2, Clock, User } from 'lucide-react';

const AudioPlayer = ({ audioUrl, audioInfo, onRegenerate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000${audioUrl}`;
    link.download = audioInfo?.audio_filename || 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!audioUrl) return null;

  // return (
  //   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  //     <div className="flex items-center justify-between mb-3">
  //       <h4 className="font-medium text-blue-800">Audio Response</h4>
  //       <div className="flex gap-2">
  //         {onRegenerate && (
  //           <button
  //             onClick={onRegenerate}
  //             className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
  //           >
  //             Change Voice
  //           </button>
  //         )}
  //         <button
  //           onClick={downloadAudio}
  //           className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
  //         >
  //           Download
  //         </button>
  //       </div>
  //     </div>
      
  //     <audio
  //       ref={audioRef}
  //       src={`http://localhost:8000${audioUrl}`}
  //       onTimeUpdate={handleTimeUpdate}
  //       onLoadedMetadata={handleLoadedMetadata}
  //       onEnded={() => setIsPlaying(false)}
  //     />
      
  //     <div className="space-y-3">
  //       {/* Play/Pause Button */}
  //       <button
  //         onClick={togglePlayPause}
  //         className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //       >
  //         {isPlaying ? (
  //           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  //             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  //           </svg>
  //         ) : (
  //           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  //             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  //           </svg>
  //         )}
  //         {isPlaying ? 'Pause' : 'Play Audio'}
  //       </button>
        
  //       {/* Progress Bar */}
  //       <div 
  //         className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
  //         onClick={handleSeek}
  //       >
  //         <div 
  //           className="bg-blue-500 h-2 rounded-full transition-all duration-100"
  //           style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
  //         />
  //       </div>
        
  //       {/* Time Display */}
  //       <div className="flex justify-between text-sm text-gray-600">
  //         <span>{formatTime(currentTime)}</span>
  //         <span>{formatTime(duration)}</span>
  //       </div>
        
  //       {/* Audio Info */}
  //       {audioInfo && (
  //         <div className="text-xs text-gray-600 mt-2">
  //           Voice: {audioInfo.voice_id} • Length: {audioInfo.text_length} chars
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );


  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    {/* Audio Player Header */}
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 010 7.07" />
            <path d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-800">Audio Response</h4>
          <p className="text-sm text-gray-600">Listen to your AI-generated answer</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onRegenerate && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 12a9 9 0 0 0-9-9c-2.45 0-4.63 1.15-6.07 2.97l-2-2" />
              <path d="M3.22 3.22L3 7l3.78-3.78" />
              <path d="M3 12a9 9 0 0 0 9 9c2.45 0 4.63-1.15 6.07-2.97l2 2" />
              <path d="M20.78 20.78L21 17l-3.78 3.78" />
            </svg>
            Change Voice
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadAudio}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Download
        </motion.button>
      </div>
    </div>

    {/* Hidden Audio Element */}
    <audio
      ref={audioRef}
      src={`http://localhost:8000${audioUrl}`}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={() => setIsPlaying(false)}
      preload="metadata"
    />

    {/* Audio Controls */}
    <div className="space-y-6">
      {/* Main Play Button */}
      <div className="flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayPause}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all group"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white ml-1">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white ml-2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div
          className="relative w-full h-3 bg-gray-200 rounded-full cursor-pointer shadow-inner overflow-hidden group"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-md relative"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            transition={{ duration: 0.1 }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>
        </div>

        {/* Time Display */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-medium">{formatTime(currentTime)}</span>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Audio Info */}
      {audioInfo && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Voice ID</p>
                <p className="font-semibold text-gray-800">{audioInfo.voice_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 010 7.07" />
                  <path d="M19.07 4.93a10 10 0 010 14.14" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Text Length</p>
                <p className="font-semibold text-gray-800">{audioInfo.text_length} characters</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlayPause}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          {isPlaying ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Pause Audio
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Play Audio
            </>
          )}
        </motion.button>
      </div>
    </div>
  </motion.div>
);



};

export default AudioPlayer;