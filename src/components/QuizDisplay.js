import React, { useState } from 'react';
import { motion } from 'framer-motion';

function QuizDisplay({ quizData }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionChange = (questionIndex, option) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: option
      });
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  return (
    <motion.div
      className="quiz-display"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h2>Generated Quiz</h2>
      {quizData.questions.map((q, index) => (
        <motion.div
          key={index}
          className="question-card"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
        >
          <h3>{q.question}</h3>
          {q.options.map((option, optIndex) => (
            <motion.div
              key={optIndex}
              className={`option ${selectedAnswers[index] === option ? 'selected' : ''}`}
              onClick={() => handleOptionChange(index, option)}
              whileHover={{ scale: 1.03, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                checked={selectedAnswers[index] === option}
                onChange={() => {}} // Prevent default radio behavior since we handle clicks manually
                disabled={showResults}
              />
              <span>{option}</span>
            </motion.div>
          ))}
          {showResults && (
            <motion.div
              className="result"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p>
                <strong>Your Answer:</strong> {selectedAnswers[index] || 'None'}
              </p>
              <p className={selectedAnswers[index] === q.correctAnswer ? 'correct' : 'incorrect'}>
                <strong>Correct Answer:</strong> {q.correctAnswer}
              </p>
              <p>
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
        >
          Submit Quiz
        </motion.button>
      )}
    </motion.div>
  );
}

export default QuizDisplay;