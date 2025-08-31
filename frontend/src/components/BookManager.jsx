import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trash2, BookOpen, Calendar, Hash, FileText, Loader, Library, Database, BarChart3 } from 'lucide-react';
import { getAllBooks, deleteBook } from '../services/api';

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const result = await getAllBooks();
      setBooks(result.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (bookId, filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}" and all its chunks?`)) {
      return;
    }

    setDeleting(bookId);
    try {
      const result = await deleteBook(bookId);
      alert(`Successfully deleted: ${result.chunks_deleted} chunks and 1 book`);
      // Refresh the list
      fetchBooks();
    } catch (error) {
      alert('Error deleting book: ' + (error.response?.data?.detail || error.message));
    }
    setDeleting(null);
  };

  useEffect(() => {
    fetchBooks();
  }, []);


  const totalPages = books.reduce((sum, book) => sum + (book.total_pages || 0), 0);
  const totalChunks = books.reduce((sum, book) => sum + (book.chunk_count || 0), 0);
  const totalSize = books.reduce((sum, book) => sum + (book.text_length || 0), 0);

  // return (
  //   <div className="max-w-4xl mx-auto p-6">
  //     <div className="flex justify-between items-center mb-6">
  //       <h2 className="text-2xl font-bold">Manage Textbooks</h2>
  //       <button
  //         onClick={fetchBooks}
  //         disabled={loading}
  //         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
  //       >
  //         {loading ? 'Loading...' : 'Refresh'}
  //       </button>
  //     </div>

  //     {books.length === 0 ? (
  //       <div className="text-center py-8 text-gray-500">
  //         No textbooks uploaded yet.
  //       </div>
  //     ) : (
  //       <div className="space-y-4">
  //         {books.map((book) => (
  //           <div key={book._id} className="border rounded-lg p-4 bg-white shadow-sm">
  //             <div className="flex justify-between items-start">
  //               <div className="flex-1">
  //                 <h3 className="font-semibold text-lg">{book.filename}</h3>
  //                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
  //                   <p><strong>Pages:</strong> {book.total_pages}</p>
  //                   <p><strong>Chunks:</strong> {book.chunk_count}</p>
  //                   <p><strong>Size:</strong> {(book.text_length || 0).toLocaleString()} chars</p>
  //                   <p><strong>Uploaded:</strong> {new Date(book.upload_date).toLocaleDateString()}</p>
  //                 </div>
  //               </div>
  //               <button
  //                 onClick={() => handleDelete(book._id, book.filename)}
  //                 disabled={deleting === book._id}
  //                 className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
  //               >
  //                 {deleting === book._id ? 'Deleting...' : 'Delete'}
  //               </button>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );


  return (
  <div className="min-h-[85vh] p-8 md:p-12">
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Library className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gradient">Book Library</h2>
            <p className="text-lg text-gray-600 mt-1">Manage your digital textbook collection</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchBooks}
          disabled={loading}
          className="btn-secondary-modern flex items-center gap-3 px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="w-6 h-6" />
              Refresh Library
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Library Stats */}
      {books.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Total Books", value: books.length, icon: BookOpen, gradient: "from-blue-500 to-blue-600" },
            { label: "Total Pages", value: totalPages.toLocaleString(), icon: FileText, gradient: "from-green-500 to-green-600" },
            { label: "Total Chunks", value: totalChunks.toLocaleString(), icon: Database, gradient: "from-purple-500 to-purple-600" },
            { label: "Content Size", value: `${(totalSize / 1000000).toFixed(1)}M chars`, icon: BarChart3, gradient: "from-orange-500 to-orange-600" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="glass-card p-6 rounded-2xl hover-lift"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Book List */}
      <AnimatePresence>
        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-8 shadow-lg">
              <BookOpen className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">Your Library is Empty</h3>
            <p className="text-xl text-gray-500 max-w-md mx-auto">
              Upload your first textbook to start building your intelligent library
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="neo-card rounded-3xl p-8 hover-lift group"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div className="flex-1 space-y-6">
                    {/* Book Title */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {book.filename}
                        </h3>
                        <p className="text-gray-600">
                          Uploaded {new Date(book.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Book Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Pages</p>
                          <p className="text-xl font-bold text-gray-900">{book.total_pages}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                          <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Chunks</p>
                          <p className="text-xl font-bold text-gray-900">{book.chunk_count}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Size</p>
                          <p className="text-xl font-bold text-gray-900">
                            {(book.text_length || 0).toLocaleString()} chars
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Status</p>
                          <p className="text-lg font-bold text-green-600">Ready</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(book._id, book.filename)}
                    disabled={deleting === book._id}
                    className={`
                      p-4 rounded-2xl transition-all shadow-lg group
                      ${deleting === book._id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-red-400 to-red-600 text-white hover:shadow-glow'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    title="Delete Book"
                  >
                    {deleting === book._id ? (
                      <Loader className="w-6 h-6 animate-spin" />
                    ) : (
                      <Trash2 className="w-6 h-6" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

};

export default BookManager;