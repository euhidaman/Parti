import React, { useState } from 'react';
import { motion } from 'framer-motion';

function YouTubeInput({ onUrlSubmit }) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic URL validation
        if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/generate-quiz-from-youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            if (response.ok) {
                onUrlSubmit(data);
            } else {
                setError(data.detail || 'Failed to generate quiz from video');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="youtube-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3>Enter YouTube Video URL</h3>
            <form onSubmit={handleSubmit} className="youtube-form">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="youtube-url-input"
                />
                <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating...' : 'Generate Quiz'}
                </button>
            </form>
            {error && <p className="error-message">{error}</p>}
        </motion.div>
    );
}

export default YouTubeInput;