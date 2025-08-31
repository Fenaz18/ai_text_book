import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  MessageSquare,
  Search,
  BookOpen,
  Sparkles,
  Zap,
} from "lucide-react"; // modern icons

import FileUpload from "./components/FileUpload";
import BookManager from "./components/BookManager";
import QueryInterface from "./components/QueryInterface";
import AIQueryInterface from "./components/AIQueryInterface";

import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("upload");

  const tabs = [
    { id: "upload", label: "Upload", icon: <Upload size={18} /> },
    { id: "ai-chat", label: "Ask AI", icon: <MessageSquare size={18} /> },
    { id: "search", label: "Search", icon: <Search size={18} /> },
    { id: "manage", label: "Manage Books", icon: <BookOpen size={18} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return <FileUpload />;
      case "ai-chat":
        return <AIQueryInterface />;
      case "search":
        return <QueryInterface />;
      case "manage":
        return <BookManager />;
      default:
        return null;
    }
  };

  return (
   

    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
         {/* Header */}
         <header className="header-bg shadow-lg">
           <div className="max-w-6xl mx-auto py-8 px-6">
             {/* Title Section */}
             <div className="text-center mb-8">
               <div className="flex items-center justify-center gap-3 mb-4">
                 <Sparkles className="w-8 h-8 text-white" />
                 <h1 className="text-4xl md:text-5xl font-bold text-white">
                   TextBook AI
                 </h1>
                 <Zap className="w-8 h-8" style={{ color: '#fbbf24' }} />
               </div>
               <p className="text-lg text-white opacity-90 max-w-2xl mx-auto">
                 Transform your textbooks into an intelligent, searchable knowledge base
               </p>
             </div>
   
             {/* Tab Navigation */}
             <nav className="flex flex-wrap justify-center gap-3">
               {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`
                     flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                     ${activeTab === tab.id
                       ? "bg-white text-blue-600 shadow-lg"
                       : "text-white hover:bg-white hover:bg-opacity-20"}
                   `}
                   style={activeTab !== tab.id ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
                 >
                   {tab.icon}
                   {tab.label}
                 </button>
               ))}
             </nav>
           </div>
         </header>
   
         {/* Main Content */}
         <main className="max-w-6xl mx-auto py-6 px-4">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="card"
             >
               {renderTabContent()}
             </motion.div>
           </AnimatePresence>
         </main>
       </div>
  );
}

export default App;


//COMMENT BEFORE UPDATING UI

// import React, { useState } from 'react';
// import FileUpload from './components/FileUpload';
// import BookManager from './components/BookManager';
// import QueryInterface from './components/QueryInterface';
// import AIQueryInterface from './components/AIQueryInterface';
// import './App.css';

// function App() {
//   const [activeTab, setActiveTab] = useState('upload');
//   console.log('Current active tab:', activeTab); // Debug log

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow-sm">
//         <div className="max-w-4xl mx-auto py-4 px-6">
//           <h1 className="text-3xl font-bold text-gray-900">Textbook AI POC</h1>
//           <p className="text-gray-600">Upload textbooks and ask questions</p>
          
//           {/* Tab Navigation */}
//           <div className="mt-4 flex space-x-1">
//             <button
//               onClick={() => setActiveTab('upload')}
//               className={`px-4 py-2 rounded ${
//                 activeTab === 'upload' 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Upload
//             </button>

//             <button
//               onClick={() => setActiveTab('ai-chat')}
//               className={`px-4 py-2 rounded ${
//                 activeTab === 'ai-chat' 
//                   ? 'bg-green-500 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Ask AI
//             </button>

//             <button
//               onClick={() =>
//                  {console.log('Switching to search tab');
//                   setActiveTab('search')}}
//               className={`px-4 py-2 rounded ${
//                 activeTab === 'search' 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >

//               Search
//             </button>
//             <button
//               onClick={() =>
//                 {
//                 console.log('Switching to manage tab');
//                  setActiveTab('manage')}}
//               className={`px-4 py-2 rounded ${
//                 activeTab === 'manage' 
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >

//               Manage Books
//             </button>
//           </div>
//         </div>
//       </header>
      
//       <main className="max-w-4xl mx-auto py-8 px-6">
//         {activeTab === 'upload' && <FileUpload />}
//         {activeTab === 'ai-chat' && <AIQueryInterface />}
//         {activeTab === 'search' && <QueryInterface />}
//         {activeTab === 'manage' && <BookManager />}

//       </main>
//     </div>
//   );
// }

// export default App;













// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <div>
// //         <a href="https://vite.dev" target="_blank">
// //           <img src={viteLogo} className="logo" alt="Vite logo" />
// //         </a>
// //         <a href="https://react.dev" target="_blank">
// //           <img src={reactLogo} className="logo react" alt="React logo" />
// //         </a>
// //       </div>
// //       <h1>Vite + React</h1>
// //       <div className="card">
// //         <button onClick={() => setCount((count) => count + 1)}>
// //           count is {count}
// //         </button>
// //         <p>
// //           Edit <code>src/App.jsx</code> and save to test HMR
// //         </p>
// //       </div>
// //       <p className="read-the-docs">
// //         Click on the Vite and React logos to learn more
// //       </p>
// //     </>
// //   )
// // }

// // export default App


// // src/App.jsx
// function App() {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//       <div className="text-center">
//         <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight leading-tight">
//           Textbook AI POC
//         </h1>
//         <p className="mt-4 text-lg text-gray-600">
//           Your AI-powered educational assistant.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default App;








