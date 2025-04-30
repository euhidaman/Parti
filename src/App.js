import React, { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import QuizDisplay from './components/QuizDisplay';
import YouTubeInput from './components/YouTubeInput';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'youtube'

  const handleQuizData = (data) => {
    setQuizData(data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Quiz Generator</h1>
      </header>
      <main>
        <div className="input-tabs">
          <button
            className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            Upload File
          </button>
          <button
            className={`tab-button ${activeTab === 'youtube' ? 'active' : ''}`}
            onClick={() => setActiveTab('youtube')}
          >
            YouTube Video
          </button>
        </div>
        <div className="input-container">
          {activeTab === 'file' ? (
            <FileUploader onQuizGenerated={handleQuizData} />
          ) : (
            <YouTubeInput onUrlSubmit={handleQuizData} />
          )}
        </div>
        {quizData && <QuizDisplay quizData={quizData} />}
      </main>
    </div>
  );
}

export default App;