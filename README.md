# AI-Powered Quiz Generator

A modern web application that generates multiple-choice quizzes with explanations from uploaded PDFs, PowerPoint presentations, and YouTube videos. Built with **React** for the frontend and **FastAPI** with **CrewAI** for the backend, this tool leverages AI to create educational quizzes seamlessly.

## Author
Euhid Aman

---

## Features

- **Multi-Format Support**: 
  - Upload PDF documents
  - Upload PowerPoint presentations (PPT/PPTX)
  - Generate quizzes from YouTube video transcripts
- **AI-Powered Quiz Generation**: Uses CrewAI with the Gemini LLM to create multiple-choice questions with four options, a correct answer, and detailed explanations
- **Interactive UI**: Sleek React interface with clickable options, animations, and a responsive design
- **Professional Design**: Clean interface with smooth transitions and tab-based navigation
- **Error Handling**: Robust validation for all input types and API responses

---

## Tech Stack

- **Frontend**: React, Framer Motion
- **Backend**: FastAPI, CrewAI, PyPDF2, Pydantic
- **AI Model**: Google Gemini (`gemini-2.0-flash`)
- **File Processing**: LibreOffice (for PowerPoint conversion), youtube-transcript-api (for video transcripts)
- **Deployment**: Local development with potential for cloud hosting

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16+)
- **Python** (v3.9+)
- **LibreOffice** (for PowerPoint support)

---

## Project Setup

### Backend Setup:

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```plaintext
GEMINI_API_KEY=your-gemini-api-key
```

4. Start the backend server:
```bash
cd src/ai_agent
python crew.py
```
The server will start at http://localhost:8000

### Frontend Setup:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```
The application will open at http://localhost:3000

---

## Usage

1. Start both backend and frontend servers
2. Choose your input method:
   - Upload a PDF file
   - Upload a PowerPoint presentation
   - Enter a YouTube video URL
3. Wait for the quiz generation (progress will be shown)
4. Take the quiz by selecting answers
5. View explanations for each question

---

## Contributing

If you'd like to contribute, please fork the repository and make changes as you'd like. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
