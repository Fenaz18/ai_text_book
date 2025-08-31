import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPDF } from '../services/api';
import BookStats from './BookStats';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, X, Cloud } from 'lucide-react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentBookId, setCurrentBookId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

   const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadPDF(file);
      setUploadResult(result);
      setCurrentBookId(result.book_id);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // return (
  //   <div className="max-w-2xl mx-auto p-6">
  //     <h2 className="text-2xl font-bold mb-6">Upload Textbook PDF</h2>
      
  //     {/* Drop Zone */}
  //     <div
  //       className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
  //       onDrop={handleDrop}
  //       onDragOver={(e) => e.preventDefault()}
  //     >
  //       <input
  //         type="file"
  //         accept=".pdf"
  //         onChange={handleFileSelect}
  //         className="hidden"
  //         id="file-input"
  //       />
  //       <label htmlFor="file-input" className="cursor-pointer">
  //         <div className="text-gray-600">
  //           <p className="text-lg mb-2">Drag and drop your PDF here</p>
  //           <p className="text-sm">or click to select a file</p>
  //         </div>
  //       </label>
  //     </div>

  //     {/* Selected File */}
  //     {file && (
  //       <div className="mt-4 p-4 bg-gray-50 rounded">
  //         <p className="font-medium">Selected: {file.name}</p>
  //         <p className="text-sm text-gray-600">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
  //         <button
  //           onClick={handleUpload}
  //           disabled={uploading}
  //           className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
  //         >
  //           {uploading ? 'Processing PDF...' : 'Upload & Process'}
  //         </button>
  //       </div>
  //     )}

  //     {/* Error Display */}
  //     {error && (
  //       <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
  //         <p className="text-red-700">{error}</p>
  //       </div>
  //     )}

  //     {/* Enhanced Upload Result */}
  //     {uploadResult && (
  //       <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
  //         <h3 className="font-bold text-green-800 mb-2">Upload Successful!</h3>
          
  //         {/* Basic Info */}
  //         <div className="grid grid-cols-2 gap-4 mb-4">
  //           <div>
  //             <p><strong>File:</strong> {uploadResult.filename}</p>
  //             <p><strong>Pages:</strong> {uploadResult.total_pages}</p>
  //           </div>
  //           <div>
  //             <p><strong>Text Length:</strong> {uploadResult.text_length.toLocaleString()} characters</p>
  //             <p><strong>Chunks Created:</strong> {uploadResult.chunks_created}</p>
  //           </div>
  //         </div>

  //         {/* Chunking Info */}
  //         <div className="mb-4 p-3 bg-blue-50 rounded">
  //           <h4 className="font-medium text-blue-800 mb-2">Processing Details</h4>
  //           <p className="text-sm"><strong>Average chunk size:</strong> {uploadResult.average_chunk_size} characters</p>
  //           <p className="text-sm"><strong>Chunks created:</strong> {uploadResult.chunks_created} segments</p>
  //         </div>
          
  //         {/* Text Preview */}
  //         <div className="mb-3">
  //           <p className="font-medium mb-1">Original Text Preview:</p>
  //           <div className="bg-white p-3 rounded border text-sm max-h-24 overflow-y-auto">
  //             {uploadResult.text_preview}
  //           </div>
  //         </div>

  //         {/* Chunk Preview */}
  //         <div>
  //           <p className="font-medium mb-1">First Chunk Preview:</p>
  //           <div className="bg-white p-3 rounded border text-sm max-h-24 overflow-y-auto">
  //             {uploadResult.chunk_preview}
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   {uploadResult && <BookStats bookId={currentBookId} />}
  //   </div>
  // );
  return (
  <div className="p-8">
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Textbook</h2>
        <p className="text-gray-600">
          Upload your PDF textbook to enable AI-powered search and questioning
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className="relative border-4 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50"
        style={{
          backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
          borderColor: isDragging ? '#60a5fa' : '#d1d5db'
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="file-input"
        />

        <div className="space-y-4">
          <div
            className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-white transition-colors"
            style={{
              backgroundColor: isDragging ? '#3b82f6' : '#6b7280'
            }}
          >
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {isDragging ? 'Drop your PDF here' : 'Drag and drop your PDF here'}
            </p>
            <p className="text-gray-500">or click to select a file</p>
          </div>
          <div className="text-sm text-gray-400">Supported format: PDF</div>
        </div>
      </div>

      {/* Selected File */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                  <FileText className="w-6 h-6" style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                aria-label="Remove file"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Cloud className="w-5 h-5" />
                  Upload & Process
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-4 rounded-lg"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
            <p className="font-medium" style={{ color: '#b91c1c' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
              <div>
                <p className="font-semibold" style={{ color: '#15803d' }}>Upload Successful!</p>
                <p className="text-sm" style={{ color: '#166534' }}>
                  {uploadResult.filename} is being processed for AI features
                </p>
              </div>
            </div>

            {currentBookId && <BookStats bookId={currentBookId} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default FileUpload;