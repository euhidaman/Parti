import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import FileUploader from '../FileUploader';
import YouTubeInput from '../YouTubeInput';
import QuizDisplay from '../QuizDisplay';

// Mock data structure to store classes and quizzes
const initialClasses = [
    { id: 1, name: 'Introduction to Biology', studentResults: [] }
];

const ProfessorDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [classes, setClasses] = useState(() => {
        const savedClasses = localStorage.getItem('professorClasses');
        return savedClasses ? JSON.parse(savedClasses) : initialClasses;
    });

    const [activeClass, setActiveClass] = useState(null);
    const [activeTab, setActiveTab] = useState('classes'); // 'classes', 'upload', 'analytics'
    const [activeUploadMethod, setActiveUploadMethod] = useState('file'); // 'file' or 'youtube'
    const [quizConfig, setQuizConfig] = useState({
        numQuestions: 10,
        questionTypes: ['mcq'],
        className: ''
    });
    const [quizData, setQuizData] = useState(null);

    // Save classes data to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('professorClasses', JSON.stringify(classes));
    }, [classes]);

    // Function to create a new class
    const createClass = () => {
        const className = prompt('Enter class name:');
        if (className) {
            const newClass = {
                id: Date.now(),
                name: className,
                quizzes: [],
                studentResults: []
            };
            setClasses([...classes, newClass]);
        }
    };

    // Function to delete a class
    const deleteClass = (classId) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            setClasses(classes.filter(c => c.id !== classId));
            if (activeClass && activeClass.id === classId) {
                setActiveClass(null);
                setActiveTab('classes');
            }
        }
    };

    // Function to handle quiz data from file upload or YouTube
    const handleQuizData = (data, sourceClass) => {
        // Store quiz data with class information
        const enhancedData = {
            ...data,
            classId: sourceClass.id,
            className: sourceClass.name,
            createdAt: new Date().toISOString(),
            numQuestions: quizConfig.numQuestions,
            questionTypes: quizConfig.questionTypes
        };

        setQuizData(enhancedData);

        // Also store this quiz in the class
        const updatedClasses = classes.map(c => {
            if (c.id === sourceClass.id) {
                const quizzes = c.quizzes || [];
                return {
                    ...c,
                    quizzes: [...quizzes, enhancedData]
                };
            }
            return c;
        });

        setClasses(updatedClasses);

        // Switch to the preview tab
        setActiveTab('preview');
    };

    // Mock analytics data generation
    const getAnalyticsForClass = (classObj) => {
        // In a real app, this would come from your backend
        const studentData = [
            { name: 'Student 1', score: 18, totalQuestions: 20 },
            { name: 'Student 2', score: 15, totalQuestions: 20 },
            { name: 'Student 3', score: 17, totalQuestions: 20 }
        ];

        const questionAnalytics = [
            { id: 1, correct: 2, total: 3, percentage: 66 },
            { id: 2, correct: 3, total: 3, percentage: 100 },
            { id: 3, correct: 1, total: 3, percentage: 33 },
        ];

        return { studentData, questionAnalytics };
    };

    return (
        <motion.div
            className="professor-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <header className="dashboard-header">
                <h2>Professor Dashboard</h2>
                <div className="user-info">
                    <span>Welcome, {currentUser.username}</span>
                    <button onClick={logout} className="logout-button">Logout</button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <button
                    className={`nav-button ${activeTab === 'classes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('classes')}
                >
                    Classes
                </button>
                {activeClass && (
                    <>
                        <button
                            className={`nav-button ${activeTab === 'upload' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            Upload Content
                        </button>
                        <button
                            className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            Analytics
                        </button>
                        <button
                            className={`nav-button ${activeTab === 'quizzes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('quizzes')}
                        >
                            Quizzes
                        </button>
                    </>
                )}
            </nav>

            <main className="dashboard-content">
                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <motion.div
                        className="classes-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Your Classes</h3>
                        <button className="create-class-button" onClick={createClass}>Create New Class</button>

                        <div className="class-list">
                            {classes.map(classObj => (
                                <div key={classObj.id} className="class-card">
                                    <h4>{classObj.name}</h4>
                                    <div className="class-actions">
                                        <button
                                            className="select-class-button"
                                            onClick={() => {
                                                setActiveClass(classObj);
                                                setActiveTab('upload');
                                            }}
                                        >
                                            Select
                                        </button>
                                        <button
                                            className="delete-class-button"
                                            onClick={() => deleteClass(classObj.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Upload Content Tab */}
                {activeTab === 'upload' && activeClass && (
                    <motion.div
                        className="upload-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Upload Content for {activeClass.name}</h3>

                        <div className="quiz-config">
                            <h4>Quiz Configuration</h4>
                            <div className="config-item">
                                <label>Number of Questions:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={quizConfig.numQuestions}
                                    onChange={(e) => setQuizConfig({
                                        ...quizConfig,
                                        numQuestions: parseInt(e.target.value)
                                    })}
                                />
                            </div>
                            <div className="config-item">
                                <label>Question Types:</label>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={quizConfig.questionTypes.includes('mcq')}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...quizConfig.questionTypes, 'mcq']
                                                    : quizConfig.questionTypes.filter(t => t !== 'mcq');
                                                setQuizConfig({ ...quizConfig, questionTypes: types });
                                            }}
                                        />
                                        Multiple Choice
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={quizConfig.questionTypes.includes('fill-blank')}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...quizConfig.questionTypes, 'fill-blank']
                                                    : quizConfig.questionTypes.filter(t => t !== 'fill-blank');
                                                setQuizConfig({ ...quizConfig, questionTypes: types });
                                            }}
                                        />
                                        Fill in the Blanks
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={quizConfig.questionTypes.includes('match')}
                                            onChange={(e) => {
                                                const types = e.target.checked
                                                    ? [...quizConfig.questionTypes, 'match']
                                                    : quizConfig.questionTypes.filter(t => t !== 'match');
                                                setQuizConfig({ ...quizConfig, questionTypes: types });
                                            }}
                                        />
                                        Match the Following
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="upload-methods">
                            <div className="input-tabs">
                                <button
                                    className={`tab-button ${activeUploadMethod === 'file' ? 'active' : ''}`}
                                    onClick={() => setActiveUploadMethod('file')}
                                >
                                    Upload File
                                </button>
                                <button
                                    className={`tab-button ${activeUploadMethod === 'youtube' ? 'active' : ''}`}
                                    onClick={() => setActiveUploadMethod('youtube')}
                                >
                                    YouTube Video
                                </button>
                            </div>

                            <div className="input-container">
                                {activeUploadMethod === 'file' ? (
                                    <FileUploader onQuizGenerated={(data) => handleQuizData(data, activeClass)} />
                                ) : (
                                    <YouTubeInput onUrlSubmit={(data) => handleQuizData(data, activeClass)} />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && activeClass && (
                    <motion.div
                        className="analytics-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Analytics for {activeClass.name}</h3>

                        {(() => {
                            const { studentData, questionAnalytics } = getAnalyticsForClass(activeClass);

                            return (
                                <div className="analytics-content">
                                    <div className="student-performance">
                                        <h4>Student Performance</h4>
                                        <table className="analytics-table">
                                            <thead>
                                                <tr>
                                                    <th>Student</th>
                                                    <th>Score</th>
                                                    <th>Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentData.map((student, idx) => (
                                                    <tr key={idx}>
                                                        <td>{student.name}</td>
                                                        <td>{student.score}/{student.totalQuestions}</td>
                                                        <td>{(student.score / student.totalQuestions * 100).toFixed(0)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="question-analytics">
                                        <h4>Question Analytics</h4>
                                        <table className="analytics-table">
                                            <thead>
                                                <tr>
                                                    <th>Question #</th>
                                                    <th>Correct Answers</th>
                                                    <th>Accuracy</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {questionAnalytics.map((q) => (
                                                    <tr key={q.id}>
                                                        <td>Question {q.id}</td>
                                                        <td>{q.correct}/{q.total}</td>
                                                        <td>{q.percentage}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                )}

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && activeClass && (
                    <motion.div
                        className="quizzes-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Quizzes for {activeClass.name}</h3>

                        <div className="quizzes-list">
                            {activeClass.quizzes && activeClass.quizzes.length > 0 ? (
                                activeClass.quizzes.map((quiz, idx) => (
                                    <div key={idx} className="quiz-item">
                                        <h4>Quiz #{idx + 1}</h4>
                                        <p>Created: {new Date(quiz.createdAt).toLocaleString()}</p>
                                        <p>Questions: {quiz.numQuestions}</p>
                                        <button
                                            className="view-quiz-button"
                                            onClick={() => {
                                                setQuizData(quiz);
                                                setActiveTab('preview');
                                            }}
                                        >
                                            View Quiz
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No quizzes created yet for this class.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Preview Tab */}
                {activeTab === 'preview' && quizData && (
                    <motion.div
                        className="preview-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Quiz Preview</h3>
                        <p>Class: {quizData.className}</p>
                        <QuizDisplay quizData={quizData} />
                        <button
                            className="back-button"
                            onClick={() => setActiveTab('quizzes')}
                        >
                            Back to Quizzes
                        </button>
                    </motion.div>
                )}
            </main>
        </motion.div>
    );
};

export default ProfessorDashboard;