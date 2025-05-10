import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import QuizDisplay from '../QuizDisplay';

const StudentDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('classes'); // 'classes', 'quiz', 'results'
    const [activeClass, setActiveClass] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizResults, setQuizResults] = useState(() => {
        const savedResults = localStorage.getItem(`studentResults-${currentUser.id}`);
        return savedResults ? JSON.parse(savedResults) : [];
    });

    // Save results to localStorage when they change
    useEffect(() => {
        localStorage.setItem(`studentResults-${currentUser.id}`, JSON.stringify(quizResults));
    }, [quizResults, currentUser.id]);

    // Get available classes from localStorage (professor-created classes)
    const getAvailableClasses = () => {
        const savedClasses = localStorage.getItem('professorClasses');
        return savedClasses ? JSON.parse(savedClasses) : [];
    };

    // Handle quiz completion
    const handleQuizCompletion = (score, totalQuestions) => {
        const newResult = {
            id: Date.now(),
            classId: activeClass.id,
            className: activeClass.name,
            quizId: activeQuiz.id || Date.now(),
            score,
            totalQuestions,
            completedAt: new Date().toISOString()
        };

        setQuizResults([...quizResults, newResult]);
        setActiveTab('results');
    };

    // Calculate total score
    const calculateTotalScore = () => {
        if (!quizResults.length) return { score: 0, total: 0, percentage: 0 };

        const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);
        const totalQuestions = quizResults.reduce((sum, result) => sum + result.totalQuestions, 0);
        const percentage = totalQuestions === 0
            ? 0
            : Math.round((totalScore / totalQuestions) * 100);

        return { score: totalScore, total: totalQuestions, percentage };
    };

    // Get results for a specific class
    const getResultsForClass = (classId) => {
        return quizResults.filter(result => result.classId === classId);
    };

    return (
        <motion.div
            className="student-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <header className="dashboard-header">
                <h2>Student Dashboard</h2>
                <div className="user-info">
                    <div className="student-stats">
                        <span className="student-name">Welcome, {currentUser.username}</span>
                        {quizResults.length > 0 && (
                            <span className="overall-score">
                                Overall Score: {calculateTotalScore().score}/{calculateTotalScore().total} ({calculateTotalScore().percentage}%)
                            </span>
                        )}
                    </div>
                    <button onClick={logout} className="logout-button">Logout</button>
                </div>
            </header>

            <nav className="dashboard-nav">
                <button
                    className={`nav-button ${activeTab === 'classes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('classes')}
                >
                    Available Classes
                </button>
                <button
                    className={`nav-button ${activeTab === 'myquizzes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myquizzes')}
                >
                    My Quizzes
                </button>
                <button
                    className={`nav-button ${activeTab === 'results' ? 'active' : ''}`}
                    onClick={() => setActiveTab('results')}
                >
                    Results
                </button>
            </nav>

            <main className="dashboard-content">
                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <motion.div
                        className="classes-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Available Classes</h3>
                        <div className="class-list">
                            {getAvailableClasses().map(classObj => {
                                // Count how many quizzes the student has completed for this class
                                const completedQuizzes = getResultsForClass(classObj.id).length;
                                const totalQuizzes = classObj.quizzes ? classObj.quizzes.length : 0;

                                return (
                                    <div key={classObj.id} className="class-card">
                                        <div className="class-info">
                                            <h4>{classObj.name}</h4>
                                            <p>Quizzes: {totalQuizzes} (Completed: {completedQuizzes})</p>
                                        </div>
                                        <button
                                            className="view-class-button"
                                            onClick={() => {
                                                setActiveClass(classObj);
                                                setActiveTab('classdetail');
                                            }}
                                        >
                                            View Class
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Class Detail Tab */}
                {activeTab === 'classdetail' && activeClass && (
                    <motion.div
                        className="class-detail-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>{activeClass.name}</h3>
                        <h4>Available Quizzes</h4>

                        <div className="quiz-list">
                            {activeClass.quizzes && activeClass.quizzes.length > 0 ? (
                                activeClass.quizzes.map((quiz, idx) => {
                                    // Check if student already completed this quiz
                                    const hasCompleted = quizResults.some(
                                        r => r.classId === activeClass.id && r.quizId === (quiz.id || idx)
                                    );

                                    return (
                                        <div key={idx} className="quiz-item">
                                            <div className="quiz-info">
                                                <h5>Quiz #{idx + 1}</h5>
                                                <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                                                <p>Questions: {quiz.numQuestions || quiz.questions.length}</p>
                                                {hasCompleted && <div className="completed-badge">Completed</div>}
                                            </div>
                                            <button
                                                className="take-quiz-button"
                                                onClick={() => {
                                                    setActiveQuiz({ ...quiz, id: idx });
                                                    setActiveTab('quiz');
                                                }}
                                            >
                                                {hasCompleted ? 'Retake Quiz' : 'Take Quiz'}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No quizzes available for this class yet.</p>
                            )}
                        </div>

                        <button
                            className="back-button"
                            onClick={() => {
                                setActiveClass(null);
                                setActiveTab('classes');
                            }}
                        >
                            Back to Classes
                        </button>
                    </motion.div>
                )}

                {/* Take Quiz Tab */}
                {activeTab === 'quiz' && activeQuiz && (
                    <motion.div
                        className="take-quiz-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Quiz from {activeClass.name}</h3>
                        <QuizDisplay
                            quizData={activeQuiz}
                            onQuizComplete={handleQuizCompletion}
                            isStudentMode={true}
                        />
                        <button
                            className="back-button"
                            onClick={() => {
                                setActiveQuiz(null);
                                setActiveTab('classdetail');
                            }}
                        >
                            Cancel Quiz
                        </button>
                    </motion.div>
                )}

                {/* My Quizzes Tab */}
                {activeTab === 'myquizzes' && (
                    <motion.div
                        className="my-quizzes-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>My Quizzes</h3>
                        <div className="completed-quizzes-list">
                            {quizResults.length > 0 ? (
                                quizResults.map((result, idx) => (
                                    <div key={idx} className="result-item">
                                        <div className="result-info">
                                            <h4>{result.className}</h4>
                                            <p>Completed: {new Date(result.completedAt).toLocaleString()}</p>
                                            <p className="score">
                                                Score: <strong>{result.score}/{result.totalQuestions}</strong> ({Math.round((result.score / result.totalQuestions) * 100)}%)
                                            </p>
                                        </div>
                                        <button
                                            className="view-result-button"
                                            onClick={() => {
                                                // Find the quiz in the available classes
                                                const classes = getAvailableClasses();
                                                const targetClass = classes.find(c => c.id === result.classId);

                                                if (targetClass && targetClass.quizzes) {
                                                    const quiz = targetClass.quizzes.find(q => q.id === result.quizId);
                                                    if (quiz) {
                                                        setActiveClass(targetClass);
                                                        setActiveQuiz(quiz);
                                                        setActiveTab('quiz');
                                                    }
                                                }
                                            }}
                                        >
                                            Retake Quiz
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>You haven't completed any quizzes yet.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <motion.div
                        className="results-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <h3>Your Results</h3>
                        {quizResults.length > 0 ? (
                            <>
                                <div className="overall-results">
                                    <h4>Overall Performance</h4>
                                    <div className="stats-card">
                                        <div className="stat-item">
                                            <div className="stat-label">Total Score</div>
                                            <div className="stat-value">{calculateTotalScore().score}/{calculateTotalScore().total}</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-label">Average</div>
                                            <div className="stat-value">{calculateTotalScore().percentage}%</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-label">Quizzes Taken</div>
                                            <div className="stat-value">{quizResults.length}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="results-by-class">
                                    <h4>Results by Class</h4>
                                    {getAvailableClasses().map(classObj => {
                                        const classResults = getResultsForClass(classObj.id);
                                        if (classResults.length === 0) return null;

                                        const classScore = classResults.reduce((sum, r) => sum + r.score, 0);
                                        const classTotal = classResults.reduce((sum, r) => sum + r.totalQuestions, 0);
                                        const classPercentage = Math.round((classScore / classTotal) * 100);

                                        return (
                                            <div key={classObj.id} className="class-results">
                                                <h5>{classObj.name}</h5>
                                                <p>Score: {classScore}/{classTotal} ({classPercentage}%)</p>
                                                <p>Quizzes Completed: {classResults.length}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <p>You haven't completed any quizzes yet. Start by exploring the available classes.</p>
                        )}
                    </motion.div>
                )}
            </main>
        </motion.div>
    );
};

export default StudentDashboard;