import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getBookStats } from '../services/api';
import { BarChart2, BookText, AlertTriangle, Loader, FileText, Hash, TrendingUp, Database } from 'lucide-react';


const BookStats = ({ bookId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await getBookStats(bookId);
      setStats(result);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  if (!bookId) return null;

  // return (
  //   <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
  //     <div className="flex justify-between items-center mb-2">
  //       <h4 className="font-medium text-blue-800">Debug Information</h4>
  //       <button
  //         onClick={fetchStats}
  //         disabled={loading}
  //         className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
  //       >
  //         {loading ? 'Loading...' : 'Get Stats'}
  //       </button>
  //     </div>

  //     {stats && (
  //       <div className="space-y-2 text-sm">
  //         <div className="grid grid-cols-2 gap-4">
  //           <div>
  //             <p><strong>Original text:</strong> {stats.original_text_length.toLocaleString()} chars</p>
  //             <p><strong>Total chunks:</strong> {stats.total_chunks}</p>
  //             <p><strong>Coverage:</strong> {stats.coverage_percentage}%</p>
  //           </div>
  //           <div>
  //             <p><strong>Avg chunk size:</strong> {stats.avg_chunk_size}</p>
  //             <p><strong>Min/Max:</strong> {stats.min_chunk_size}/{stats.max_chunk_size}</p>
  //           </div>
  //         </div>
          
  //         {stats.coverage_percentage < 95 && (
  //           <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
  //             <p className="text-red-700 font-medium">⚠️ Low coverage detected! Some text may be missing.</p>
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );
return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="glass-card rounded-3xl p-8 shadow-xl hover-lift"
  >
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <BarChart2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-gray-900">Processing Statistics</h4>
          <p className="text-gray-600">Real-time analysis of your textbook</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchStats}
        disabled={loading}
        className="btn-secondary-modern flex items-center gap-3 px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <TrendingUp className="w-5 h-5" />
            Update Stats
          </>
        )}
      </motion.button>
    </div>

    {stats && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-blue-800">Text Length</span>
            </div>
            <p className="text-4xl font-black text-blue-900 mb-2">
              {(stats.original_text_length / 1000).toFixed(1)}k
            </p>
            <p className="text-blue-700 font-medium">characters processed</p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-green-800">Total Chunks</span>
            </div>
            <p className="text-4xl font-black text-green-900 mb-2">
              {stats.total_chunks}
            </p>
            <p className="text-green-700 font-medium">
              avg. {stats.avg_chunk_size} chars each
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-purple-800">Coverage</span>
            </div>
            <p className="text-4xl font-black text-purple-900 mb-2">
              {stats.coverage_percentage}%
            </p>
            <p className="text-purple-700 font-medium">
              of total content
            </p>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chunk Size Analysis */}
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-600" />
              Chunk Size Distribution
            </h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <span className="text-gray-700 font-medium">Minimum Size</span>
                <span className="text-xl font-bold text-blue-600">{stats.min_chunk_size}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <span className="text-gray-700 font-medium">Average Size</span>
                <span className="text-xl font-bold text-green-600">{stats.avg_chunk_size}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <span className="text-gray-700 font-medium">Maximum Size</span>
                <span className="text-xl font-bold text-purple-600">{stats.max_chunk_size}</span>
              </div>
            </div>
          </div>

          {/* Coverage Analysis */}
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              Processing Quality
            </h5>

            {/* Coverage Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Content Coverage</span>
                <span className="text-lg font-bold text-gray-900">{stats.coverage_percentage}%</span>
              </div>
              <div className="progress-modern">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.coverage_percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Quality Assessment */}
            <div className={`p-4 rounded-xl border-2 ${
              stats.coverage_percentage >= 95
                ? 'bg-green-50 border-green-200'
                : stats.coverage_percentage >= 85
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {stats.coverage_percentage >= 95 ? (
                  <>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BarChart2 className="w-4 h-4 text-white" />
                      </motion.div>
                    </div>
                    <div>
                      <p className="font-bold text-green-800">Excellent Processing</p>
                      <p className="text-green-700 text-sm">Your book is fully optimized for AI assistance</p>
                    </div>
                  </>
                ) : stats.coverage_percentage >= 85 ? (
                  <>
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-800">Good Processing</p>
                      <p className="text-yellow-700 text-sm">Most content is available for search and AI queries</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800">Low Coverage Warning</p>
                      <p className="text-red-700 text-sm">Some content may be missing from processing</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </motion.div>
);

};

export default BookStats;