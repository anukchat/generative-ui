# Generative UI with LangGraph and Assistant UI

This project demonstrates a generative UI application using Python LangGraph for the backend and Assistant UI for the frontend. The application allows users to ask questions about stocks and weather, and the agent will respond with appropriate information and UI components.

## Features

- Interactive chat interface with Assistant UI
- Tool-based agent architecture with LangGraph
- Stock information tool using Alpha Vantage API
- Weather information tool using python-weather library
- Generative UI components that adapt to the query

## Setup

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   ```
6. Start the backend server: `uvicorn app:app --reload`

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the frontend development server: `npm run dev`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Type a question in the chat interface, such as:
   - "What's the current stock price for Apple?"
   - "How's the weather in New York today?"
3. The agent will process your question, call the appropriate tools, and respond with both text and UI components

## Project Structure

- `app.py`: Main FastAPI application with LangGraph agent setup
- `tools/`: Directory containing tool implementations
  - `stock_tool.py`: Stock information tool using Alpha Vantage
  - `weather_tool.py`: Weather information tool using python-weather
- `frontend/`: Directory containing the Assistant UI frontend

## License

MIT
