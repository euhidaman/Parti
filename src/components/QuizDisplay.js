import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function QuizDisplay({ quizData, onQuizComplete, isStudentMode = false }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Reset answers when a new quiz is loaded
  useEffect(() => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  }, [quizData]);

  const handleOptionChange = (questionIndex, option) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: option
      });
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quizData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmit = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setShowResults(true);

    // If in student mode and onQuizComplete callback exists, call it with the score
    if (isStudentMode && onQuizComplete) {
      onQuizComplete(calculatedScore, quizData.questions.length);
    }
  };

  return (
    <motion.div
      className="quiz-display"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h2>
        {isStudentMode ? 'Quiz' : 'Generated Quiz'}
        {showResults && (
          <span className="score-display"> - Score: {score}/{quizData.questions.length}
            ({Math.round((score / quizData.questions.length) * 100)}%)
          </span>
        )}
      </h2>
      {quizData.questions.map((q, index) => (
        <motion.div
          key={index}
          className="question-card"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
        >
          <h3>{q.question}</h3>
          {q.options.map((option, optIndex) => {
            // Determine special classes for options when results are shown
            let optionClass = selectedAnswers[index] === option ? 'selected' : '';
            if (showResults) {
              if (option === q.correctAnswer) {
                optionClass += ' correct-answer';
              } else if (selectedAnswers[index] === option && option !== q.correctAnswer) {
                optionClass += ' incorrect-answer';
              }
            }

            return (
              <motion.div
                key={optIndex}
                className={`option ${optionClass}`}
                onClick={() => handleOptionChange(index, option)}
                whileHover={{ scale: showResults ? 1 : 1.03, boxShadow: showResults ? 'none' : '0 5px 15px rgba(0, 0, 0, 0.1)' }}
                whileTap={{ scale: showResults ? 1 : 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={selectedAnswers[index] === option}
                  onChange={() => { }} // Prevent default radio behavior since we handle clicks manually
                  disabled={showResults}
                />
                <span>{option}</span>
                {showResults && option === q.correctAnswer && (
                  <span className="correct-indicator">✓</span>
                )}
              </motion.div>
            );
          })}
          {showResults && (
            <motion.div
              className="result"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className={selectedAnswers[index] === q.correctAnswer ? 'correct' : 'incorrect'}>
                <strong>Your Answer:</strong> {selectedAnswers[index] || 'None'}
                {selectedAnswers[index] === q.correctAnswer ? ' ✓' : ' ✗'}
              </p>
              {selectedAnswers[index] !== q.correctAnswer && (
                <p className="correct">
                  <strong>Correct Answer:</strong> {q.correctAnswer}
                </p>
              )}
              <p className="explanation">
                <strong>Explanation:</strong> {q.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}
      {!showResults && (
        <motion.button
          className="submit-button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 87, 34, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
        >
          Submit Quiz
        </motion.button>
      )}
    </motion.div>
  );
}

export default QuizDisplay;