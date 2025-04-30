import os
import subprocess
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from crewai import LLM, Agent, Crew, Process, Task
import PyPDF2
import json
import logging
from pydantic import BaseModel, Field
from typing import List, Optional
from youtube_transcript_api import YouTubeTranscriptApi
import re
import shutil
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic models for JSON output structure


class QuizQuestion(BaseModel):
    question: str = Field(..., description="The quiz question")
    options: List[str] = Field(..., min_items=4,
                               max_items=4, description="Four answer options")
    correctAnswer: str = Field(..., description="The correct answer")
    explanation: str = Field(...,
                             description="Explanation of the correct answer")


class QuizOutput(BaseModel):
    questions: List[QuizQuestion] = Field(...,
                                          description="List of quiz questions")


# Load API key for Gemini
google_api_key = os.getenv("GEMINI_API_KEY")
if not google_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")
llm = LLM(model="gemini/gemini-2.0-flash",
          temperature=0, api_key=google_api_key)

# Define Quiz Generator Agent
quiz_agent = Agent(
    role="Quiz Generator",
    goal="Analyze PDF content and generate accurate multiple-choice quizzes with explanations.",
    backstory=(
        "You are an expert in educational content creation, skilled at extracting key information from documents "
        "and transforming it into engaging multiple-choice quizzes. You ensure each question has four options, "
        "a correct answer, and a detailed explanation based on the provided content."
    ),
    llm=llm,
    verbose=True
)

# Define Quiz Generation Task with output_json
quiz_task = Task(
    description=(
        "Analyze the following PDF content and generate a multiple-choice quiz: {pdf_content}. "
        "Create as questions as possible, each with:\n"
        "1. A clear, concise question.\n"
        "2. Four distinct answer options (one correct, three plausible distractors).\n"
        "3. A correct answer.\n"
        "4. An explanation based on the PDF content.\n"
        "Return the result as a JSON object with a 'questions' key. "
        "If the content is insufficient, return {{'error': 'Insufficient content to generate a quiz.'}}."
    ),
    expected_output=(
        "A JSON object with a 'questions' array containing quiz questions, or an error message."
    ),
    agent=quiz_agent,
    output_json=QuizOutput  # Enforce JSON output with Pydantic model
)

# Define Crew
crew = Crew(
    agents=[quiz_agent],
    tasks=[quiz_task],
    verbose=True,
    process=Process.sequential
)


def run(input):

    try:
        logger.info(
            f"Running CrewAI with input: {input['pdf_content'][:100]}...")
        result = crew.kickoff(inputs=input)
        logger.info(f"Raw CrewAI result: {result}")

        # Handle CrewOutput object
        if hasattr(result, 'json'):  # CrewOutput with json attribute
            return json.loads(result.json)
        elif hasattr(result, 'raw'):  # Check for raw attribute as fallback
            return json.loads(result.raw)
        elif isinstance(result, dict):  # Direct dict output
            return result
        elif isinstance(result, str):  # Stringified JSON
            return json.loads(result)
        else:
            logger.error(f"Unexpected result type: {type(result)}")
            return {"error": "Invalid quiz format returned from CrewAI."}
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return {"error": "Failed to parse quiz output as JSON."}
    except Exception as e:
        logger.error(f"Error in run: {str(e)}")
        return {"error": f"Failed to generate quiz: {str(e)}"}


def convert_ppt_to_pdf(input_path):
    """Convert PPT/PPTX to PDF using LibreOffice in headless mode"""
    output_dir = os.path.dirname(input_path)
    filename = os.path.splitext(os.path.basename(input_path))[0]
    output_pdf = os.path.join(output_dir, f"{filename}.pdf")

    try:
        # Ensure LibreOffice isn't already running
        subprocess.run(['killall', 'soffice.bin'], stderr=subprocess.DEVNULL)
        time.sleep(1)  # Wait for LibreOffice to fully close

        # Convert to PDF using LibreOffice in headless mode
        cmd = [
            'soffice',
            '--headless',
            '--convert-to',
            'pdf',
            '--outdir',
            output_dir,
            input_path
        ]

        process = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30  # Set a timeout of 30 seconds
        )

        if process.returncode != 0:
            raise Exception(f"Conversion failed: {process.stderr.decode()}")

        # Wait for the PDF file to be created (max 5 seconds)
        for _ in range(10):
            if os.path.exists(output_pdf) and os.path.getsize(output_pdf) > 0:
                return output_pdf
            time.sleep(0.5)

        if not os.path.exists(output_pdf):
            raise Exception("PDF file was not created")

        return output_pdf

    except subprocess.TimeoutExpired:
        raise Exception("Conversion timed out")
    except Exception as e:
        raise Exception(f"Error converting PPT to PDF: {str(e)}")


def extract_video_id(url):
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/shorts\/([^&\n?#]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_youtube_transcript(video_id):
    """Get transcript from YouTube video"""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([entry['text'] for entry in transcript_list])
    except Exception as e:
        raise Exception(f"Failed to get YouTube transcript: {str(e)}")


class YouTubeInput(BaseModel):
    url: str


@app.post("/generate-quiz-from-youtube")
async def generate_quiz_from_youtube(data: YouTubeInput):
    try:
        video_id = extract_video_id(data.url)
        if not video_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid YouTube URL"
            )

        logger.info(f"Processing YouTube video: {video_id}")

        try:
            transcript = get_youtube_transcript(video_id)
            if not transcript.strip():
                return {"error": "No transcript available for this video"}

            logger.info(
                f"Successfully extracted transcript. First 100 chars: {transcript[:100]}...")
            # Reuse existing quiz generation logic
            input_data = {"pdf_content": transcript}
            quiz_result = run(input_data)
            logger.info("Quiz generated successfully from YouTube transcript")
            return quiz_result

        except Exception as e:
            logger.error(f"Error processing YouTube video: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing YouTube video: {str(e)}"
            )

    except Exception as e:
        logger.error(f"Error in YouTube processing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing YouTube video: {str(e)}"
        )


@app.post("/generate-quiz")
async def generate_quiz(file: UploadFile = File(...)):
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ['.pdf', '.ppt', '.pptx']:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and PowerPoint files (PPT/PPTX) are supported."
        )

    try:
        logger.info(f"Processing uploaded {file_ext} file: {file.filename}")
        content = ""

        # Create a temporary directory that will be automatically cleaned up
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_file_path = os.path.join(temp_dir, file.filename)

            # Save the uploaded file
            file_content = await file.read()
            with open(temp_file_path, "wb") as temp_file:
                temp_file.write(file_content)

            # Convert PPT to PDF if necessary
            pdf_path = temp_file_path
            if file_ext in ['.ppt', '.pptx']:
                logger.info("Converting PPT to PDF")
                try:
                    pdf_path = convert_ppt_to_pdf(temp_file_path)
                    logger.info(f"Successfully converted to PDF: {pdf_path}")
                except Exception as e:
                    logger.error(f"PPT conversion error: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Error converting PowerPoint to PDF: {str(e)}"
                    )

            # Extract text from PDF
            try:
                with open(pdf_path, 'rb') as pdf_file:
                    pdf_reader = PyPDF2.PdfReader(pdf_file)
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        if text:
                            content += text + "\n"
            except Exception as e:
                logger.error(f"PDF reading error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error reading PDF content: {str(e)}"
                )

        if not content.strip():
            logger.warning("No readable content found in file")
            return {"error": "No readable content found in the file. Please upload a valid document."}

        logger.info(
            f"Successfully extracted content. First 100 chars: {content[:100]}...")
        input_data = {"pdf_content": content}
        quiz_result = run(input_data)
        logger.info("Quiz generated successfully")
        return quiz_result

    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("crew:app", host="0.0.0.0", port=8000, reload=True)
