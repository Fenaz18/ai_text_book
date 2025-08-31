//RECENT COMMENT----------------------------------------------

// import React, { useState } from 'react';

// const QueryInterface = () => {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
    
//     if (!query.trim()) {
//       alert('Please enter a search query');
//       return;
//     }

//     setLoading(true);
//     console.log('Starting search for:', query);

//     try {
//       // Direct fetch instead of using api.js
//       const response = await fetch('http://localhost:8000/search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query: query,
//           book_ids: null,
//           top_k: 5,
//           min_similarity: 0.1
//         })
//       });

//       console.log('Response status:', response.status);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Search response data:', data);
      
//       setResults(JSON.stringify(data, null, 2));
      
//     } catch (error) {
//       console.error('Search error:', error);
//       setResults(`Error: ${error.message}`);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h2 className="text-2xl font-bold mb-6">Search Test Interface</h2>
      
//       {/* Simple Search Form */}
//       <form onSubmit={handleSearch} className="mb-6">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Enter search query (e.g., 'photosynthesis')"
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//           >
//             {loading ? 'Searching...' : 'Test Search'}
//           </button>
//         </div>
//       </form>

//       {/* Raw Results Display */}
//       {results && (
//         <div className="mb-6">
//           <h3 className="text-lg font-medium mb-2">Raw Search Results:</h3>
//           <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
//             {results}
//           </pre>
//         </div>
//       )}

//       {/* Test Buttons */}
//       <div className="space-y-2">
//         <button
//           onClick={() => {
//             fetch('http://localhost:8000/debug/search-ready')
//               .then(r => r.json())
//               .then(data => {
//                 console.log('Debug data:', data);
//                 setResults(JSON.stringify(data, null, 2));
//               })
//               .catch(err => setResults(`Debug error: ${err.message}`));
//           }}
//           className="px-4 py-2 bg-green-500 text-white rounded"
//         >
//           Test Debug Endpoint
//         </button>
        
//         <button
//           onClick={() => {
//             fetch('http://localhost:8000/books')
//               .then(r => r.json())
//               .then(data => {
//                 console.log('Books data:', data);
//                 setResults(JSON.stringify(data, null, 2));
//               })
//               .catch(err => setResults(`Books error: ${err.message}`));
//           }}
//           className="ml-2 px-4 py-2 bg-purple-500 text-white rounded"
//         >
//           Test Books Endpoint
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QueryInterface;







import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, Loader, ChevronRight, Target, Filter, Zap } from 'lucide-react';
import { searchChunks, getAllBooks } from '../services/api';

const QueryInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);

  // The original implementation had these helper functions for styling based on score
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Low Match';
  };

  // Original useEffect hook to fetch books on component mount
  useEffect(() => {
    console.log('QueryInterface mounted, fetching books...');
    fetchBooks();
  }, []);

  // Original function to fetch books from the backend
  const fetchBooks = async () => {
    try {
      console.log('Fetching books...');
      const response = await getAllBooks();
      console.log('Books response:', response);
      setBooks(response.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Original search handler with the new UI's logic for disabled button
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    console.log('Searching for:', query);
    setLoading(true);

    try {
      const response = await searchChunks(
        query,
        selectedBooks.length > 0 ? selectedBooks : null,
        5,
        0.1
      );
      console.log('Search results:', response);
      setResults(response.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + (error.response?.data?.detail || error.message));
      setResults([]);
    }

    setLoading(false);
  };

  // The helper function to render results, adapted to the new UI's design
  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-12 h-12 animate-spin text-gray-400" />
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Search Results</h3>
            </div>
            <div className="badge-success">
              {results.length} matches found
            </div>
          </div>

          <div className="space-y-6">
            {results.map((result, index) => (
              <motion.div
                key={result.chunk_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover-lift group"
              >
                <div className="flex items-center justify-between gap-6 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {result.book_filename}
                      </span>
                      {result.chapter && (
                        <div className="badge-success mt-1 inline-block ml-3">
                          {result.chapter}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`badge ${getScoreColor(result.similarity_score)}`}>
                    {(result.similarity_score * 100).toFixed(1)}% match
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                  <p className="text-gray-800 leading-relaxed font-medium">
                    {result.content.length > 500
                      ? result.content.substring(0, 500) + '...'
                      : result.content
                    }
                  </p>
                </div>

                {/* You can add page information if available in your result object */}
                {result.page && (
                  <div className="mt-4 flex items-center gap-2 text-gray-600">
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium">Page {result.page}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (query && !loading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-8 shadow-lg">
            <AlertCircle className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-700 mb-4">No results found</h3>
          <p className="text-xl text-gray-500 max-w-md mx-auto">
            Try a different query or make sure embeddings for your books are ready
          </p>
        </motion.div>
      );
    }

    return null;
  };

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
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-black text-gradient">Search Your Books</h2>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <Filter className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find specific content, concepts, and topics across all your uploaded textbooks with intelligent search
          </p>
        </motion.div>

        {/* Enhanced Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8 rounded-3xl"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for topics, concepts, definitions, or specific terms..."
                className="input-modern w-full pl-16 pr-6 py-6 text-lg font-medium"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  <Zap className="w-6 h-6 text-orange-400" />
                </motion.div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-modern w-full text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-7 h-7 animate-spin" />
                  Searching your books...
                </>
              ) : (
                <>
                  <Search className="w-7 h-7" />
                  Search Books
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Book Selection */}
        <AnimatePresence>
          {books.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-8 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Select books to search (optional):</h3>
              <div className="space-y-4">
                {books.map((book) => (
                  <label key={book._id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book._id)}
                      onChange={() => setSelectedBooks(prev =>
                        prev.includes(book._id)
                          ? prev.filter(id => id !== book._id)
                          : [...prev, book._id]
                      )}
                      className="h-6 w-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-lg font-semibold text-gray-900">{book.filename}</span>
                      <div className="text-sm text-gray-500 mt-1">
                        {book.embedded_chunks || 0} / {book.chunk_count || 0} chunks embedded
                        {(book.embedded_chunks > 0 && book.embedded_chunks === book.chunk_count) ? (
                          <span className="ml-2 text-green-600 font-medium">✓ Ready</span>
                        ) : (
                          <span className="ml-2 text-yellow-600 font-medium">⏳ Processing</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search Results */}
        <AnimatePresence mode="wait">
          <motion.div
            key={query}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderSearchResults()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QueryInterface;


//SECOND COMMENTED Working part---------------------------------------

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, AlertCircle, BookOpen, Loader, ChevronRight, Target, Filter, Zap } from 'lucide-react';
// import { searchChunks, getAllBooks } from '../services/api';

// const QueryInterface = () => {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [books, setBooks] = useState([]);
//   const [selectedBooks, setSelectedBooks] = useState([]);

//     const getScoreColor = (score) => {
//     if (score >= 0.8) return 'text-green-600';
//     if (score >= 0.6) return 'text-yellow-600';
//     return 'text-red-600';
//   };


//    const getScoreLabel = (score) => {
//     if (score >= 0.8) return 'Excellent Match';
//     if (score >= 0.6) return 'Good Match';
//     return 'Low Match';
//   };

//   useEffect(() => {
//     console.log('QueryInterface mounted, fetching books...');
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       console.log('Fetching books...');
//       const response = await getAllBooks();
//       console.log('Books response:', response);
//       setBooks(response.books || []);
//     } catch (error) {
//       console.error('Error fetching books:', error);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) {
//       alert('Please enter a search query');
//       return;
//     }

//     console.log('Searching for:', query);
//     setLoading(true);

//     try {
//       const response = await searchChunks(
//         query,
//         selectedBooks.length > 0 ? selectedBooks : null,
//         5,
//         0.1
//       );
//       console.log('Search results:', response);
//       setResults(response.results || []);
//     } catch (error) {
//       console.error('Search error:', error);
//       alert('Search failed: ' + (error.response?.data?.detail || error.message));
//       setResults([]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h2 className="text-2xl font-bold mb-6">Search Textbooks</h2>
      
//       {/* Debug Info */}
//       <div className="mb-4 p-3 bg-gray-50 border rounded">
//         <p className="text-sm"><strong>Debug:</strong> Found {books.length} books</p>
//         {books.map(book => (
//           <p key={book._id} className="text-xs text-gray-600">
//             {book.filename}: {book.embedded_chunks || 0}/{book.chunk_count || 0} chunks embedded
//           </p>
//         ))}
//       </div>

//       {/* Search Form - Always Show */}
//       <form onSubmit={handleSearch} className="mb-6">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Ask a question or search for a topic..."
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//           >
//             {loading ? 'Searching...' : 'Search'}
//           </button>
//         </div>
//       </form>

//       {/* Book Selection */}
//       {books.length > 0 && (
//         <div className="mb-6">
//           <h3 className="text-lg font-medium mb-3">Select books to search (optional):</h3>
//           <div className="space-y-2">
//             {books.map((book) => (
//               <label key={book._id} className="flex items-center space-x-2 p-2 border rounded">
//                 <input
//                   type="checkbox"
//                   checked={selectedBooks.includes(book._id)}
//                   onChange={() => setSelectedBooks(prev => 
//                     prev.includes(book._id)
//                       ? prev.filter(id => id !== book._id)
//                       : [...prev, book._id]
//                   )}
//                   className="rounded"
//                 />
//                 <div className="flex-1">
//                   <span className="text-sm font-medium">{book.filename}</span>
//                   <div className="text-xs text-gray-500">
//                     {book.embedded_chunks || 0}/{book.chunk_count || 0} chunks embedded
//                     {(book.embedded_chunks > 0 && book.embedded_chunks === book.chunk_count) ? (
//                       <span className="ml-2 text-green-600">✓ Ready</span>
//                     ) : (
//                       <span className="ml-2 text-yellow-600">⏳ Processing</span>
//                     )}
//                   </div>
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Results */}
//       {results.length > 0 && (
//         <div className="space-y-4">
//           <h3 className="text-lg font-medium">Search Results ({results.length})</h3>
          
//           {results.map((result, index) => (
//             <div key={result.chunk_id} className="border rounded-lg p-4 bg-white shadow-sm">
//               <div className="flex justify-between items-start mb-2">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="font-medium text-blue-600">#{index + 1}</span>
//                     <span className="text-sm text-gray-600">{result.book_filename}</span>
//                     {result.chapter && (
//                       <span className="text-xs bg-gray-100 px-2 py-1 rounded">{result.chapter}</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className={`text-sm font-medium ${getScoreColor(result.similarity_score)}`}>
//                     {getScoreLabel(result.similarity_score)}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {(result.similarity_score * 100).toFixed(1)}%
//                   </div>
//                 </div>
//               </div>
              
//               <div className="text-sm text-gray-800 leading-relaxed">
//                 {result.content.length > 500 
//                   ? result.content.substring(0, 500) + '...'
//                   : result.content
//                 }
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* No Results Message */}
//       {results.length === 0 && query && !loading && (
//         <div className="text-center py-8 text-gray-500">
//           <p>No results found for: "<strong>{query}</strong>"</p>
//           <p className="text-sm mt-2">Make sure embeddings are ready and try different keywords.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryInterface;









//FIRST COMMENTED------------------------------------

//import React, { useState, useEffect } from 'react';
// import { searchChunks, getAllBooks } from '../services/api';

// const QueryInterface = () => {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [books, setBooks] = useState([]);
//   const [selectedBooks, setSelectedBooks] = useState([]);
//   const [searchPerformed, setSearchPerformed] = useState(false);

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       const response = await getAllBooks();
//       console.log('All books:', response.books); // Debug log
      
//       // Show all books, but indicate which ones are ready for search
//       setBooks(response.books || []);
//     } catch (error) {
//       console.error('Error fetching books:', error);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!query.trim())
//         {
//             alert('Please enter a search query');
//             return;
//         } 
    
//      console.log('Searching for:', query);
//     setLoading(true);
//     setSearchPerformed(true);

//     try {
//       const response = await searchChunks(
//         query,
//         selectedBooks.length > 0 ? selectedBooks : null,
//         5
//       );
//       console.log('Search response:', response); // Debug log
//       setResults(response.results || []);
//     } catch (error) {
//       console.error('Search error:', error);
//       alert('Search failed: ' + (error.response?.data?.detail || error.message));
//       setResults([]);
//     }

//     setLoading(false);
//   };

//   const toggleBookSelection = (bookId) => {
//     setSelectedBooks(prev => 
//       prev.includes(bookId)
//         ? prev.filter(id => id !== bookId)
//         : [...prev, bookId]
//     );
//   };

//   const getScoreColor = (score) => {
//     if (score > 0.7) return 'text-green-600';
//     if (score > 0.5) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const getScoreLabel = (score) => {
//     if (score > 0.7) return 'High';
//     if (score > 0.5) return 'Medium';
//     return 'Low';
//   };

//   // Count books ready for search
//   const readyBooks = books.filter(book => book.embeddings_ready || book.embedded_chunks === book.chunk_count);
//   const totalBooksWithEmbeddings = readyBooks.length;

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h2 className="text-2xl font-bold mb-6">Search Textbooks</h2>
      
//       {/* Status Info */}
//       <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h3 className="font-medium text-blue-800 mb-2">Search Status</h3>
//         <p className="text-sm">
//           <strong>Total books:</strong> {books.length} | 
//           <strong> Ready for search:</strong> {totalBooksWithEmbeddings} |
//           <strong> Books with embeddings:</strong> {books.map(b => `${b.filename}: ${b.embedded_chunks}/${b.chunk_count}`).join(', ')}
//         </p>
//       </div>

//       {/* Book Selection */}
//       {books.length > 0 && (
//         <div className="mb-6">
//           <h3 className="text-lg font-medium mb-3">Search in books (optional):</h3>
//           <div className="space-y-2">
//             {books.map((book) => (
//               <label key={book._id} className="flex items-center space-x-2 p-2 border rounded">
//                 <input
//                   type="checkbox"
//                   checked={selectedBooks.includes(book._id)}
//                   onChange={() => toggleBookSelection(book._id)}
//                   className="rounded"
//                 />
//                 <div className="flex-1">
//                   <span className="text-sm font-medium">{book.filename}</span>
//                   <div className="text-xs text-gray-500">
//                     Chunks: {book.embedded_chunks || 0}/{book.chunk_count || 0} embedded
//                     {book.embeddings_ready || (book.embedded_chunks === book.chunk_count && book.chunk_count > 0) ? (
//                       <span className="ml-2 text-green-600">✓ Ready</span>
//                     ) : (
//                       <span className="ml-2 text-yellow-600">⏳ Processing</span>
//                     )}
//                   </div>
//                 </div>
//               </label>
//             ))}
//           </div>
//           {selectedBooks.length === 0 && (
//             <p className="text-sm text-gray-500 mt-1">All books will be searched</p>
//           )}
//         </div>
//       )}

//       {/* Search Form */}
//       <form onSubmit={handleSearch} className="mb-6">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Ask a question or search for a topic..."
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={loading}
//           />
//           <button
//             type="submit"
//             disabled={loading || !query.trim() || totalBooksWithEmbeddings === 0}
//             className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//           >
//             {loading ? 'Searching...' : 'Search'}
//           </button>
//         </div>
//       </form>

//       {/* No Books Warning */}
//       {totalBooksWithEmbeddings === 0 && books.length > 0 && (
//         <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <p className="text-yellow-700">
//             <strong>Embeddings are still being generated.</strong> Please wait a few minutes and refresh the page.
//             Check the console logs to see embedding progress.
//           </p>
//         </div>
//       )}

//       {books.length === 0 && (
//         <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
//           <p className="text-gray-700">
//             No textbooks uploaded yet. Go to the "Upload" tab to add some textbooks first.
//           </p>
//         </div>
//       )}

//       {/* Results */}
//       {searchPerformed && (
//         <div className="space-y-4">
//           <h3 className="text-lg font-medium">
//             {loading ? 'Searching...' : `Search Results (${results.length})`}
//           </h3>
          
//           {!loading && results.length === 0 && query && (
//             <div className="text-center py-8 text-gray-500">
//               <p>No relevant content found for: "<strong>{query}</strong>"</p>
//               <p className="text-sm mt-2">Try rephrasing your query or using different keywords.</p>
//             </div>
//           )}
          
//           {results.map((result, index) => (
//             <div key={result.chunk_id} className="border rounded-lg p-4 bg-white shadow-sm">
//               <div className="flex justify-between items-start mb-2">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="font-medium text-blue-600">#{index + 1}</span>
//                     <span className="text-sm text-gray-600">{result.book_filename}</span>
//                     {result.chapter && (
//                       <span className="text-xs bg-gray-100 px-2 py-1 rounded">{result.chapter}</span>
//                     )}
//                   </div>
//                   {result.section && (
//                     <p className="text-xs text-gray-500 mb-2">{result.section}</p>
//                   )}
//                 </div>
//                 <div className="text-right">
//                   <div className={`text-sm font-medium ${getScoreColor(result.similarity_score)}`}>
//                     {getScoreLabel(result.similarity_score)}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {(result.similarity_score * 100).toFixed(1)}%
//                   </div>
//                 </div>
//               </div>
              
//               <div className="text-sm text-gray-800 leading-relaxed">
//                 {result.content.length > 500 
//                   ? result.content.substring(0, 500) + '...'
//                   : result.content
//                 }
//               </div>
              
//               <div className="mt-2 text-xs text-gray-400">
//                 Chunk {result.chunk_index + 1} • {result.content.length} characters
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryInterface;