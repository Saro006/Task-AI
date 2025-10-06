# AI-Powered Task Management Agent

A modern full-stack application that integrates an AI agent with real backend functionality for task management. Users interact through a chat interface while the AI agent handles all task operations via natural language commands.

![AI Task Management](https://img.shields.io/badge/AI-Task%20Management-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![LangGraph](https://img.shields.io/badge/AI-LangGraph-orange)
![Docker](https://img.shields.io/badge/Deploy-Docker-blue)

## 🚀 Features

- **🤖 AI Agent**: Powered by LangGraph and Gemini API for natural language task management
- **💬 Real-time Chat**: WebSocket-based chat interface for seamless communication
- **📋 Live Task List**: Real-time updates of task management interface
- **🔄 Full CRUD Operations**: Create, read, update, delete tasks through natural language
- **🔍 Smart Filtering**: Filter tasks by priority, status, due date
- **🎨 Modern UI**: Clean, responsive design with dark mode support
- **🗄️ PostgreSQL Backend**: Robust data persistence with SQLAlchemy ORM
- **📱 Mobile Responsive**: Works perfectly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation
- **LangGraph**: Agent framework for AI task management workflows
- **Gemini API**: Google's LLM for natural language processing
- **PostgreSQL**: Production-ready database for task storage
- **SQLAlchemy**: Powerful ORM for database operations
- **WebSockets**: Real-time bidirectional communication

### Frontend
- **Next.js 14**: Latest React framework with App Router
- **TypeScript**: Type-safe JavaScript for better development experience
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Beautiful, customizable icons
- **React Hot Toast**: Elegant notifications

## 📁 Project Structure

```
AI-Task management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── task.py            # Task database model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── task.py            # Pydantic schemas
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   └── task_agent.py      # LangGraph AI agent
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   └── task_tools.py      # Task management tools
│   │   └── database/
│   │       ├── __init__.py
│   │       └── connection.py      # Database configuration
│   ├── requirements.txt
│   ├── Dockerfile
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Main page
│   │   │   └── globals.css        # Global styles
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx  # Chat UI component
│   │   │   ├── TaskList.tsx       # Task list component
│   │   │   └── DarkModeToggle.tsx # Dark mode toggle
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts    # WebSocket hook
│   │   │   └── useTasks.ts        # Task management hook
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   └── utils/
│   │       └── api.ts             # API utilities
│   ├── package.json
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml             # Multi-container setup
├── start.sh                       # Quick start script
├── env.example                    # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (Recommended)
- OR **Python 3.11+** and **Node.js 18+**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### 🐳 Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Task\ management
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your GOOGLE_API_KEY
   ```

3. **Start the application**
   ```bash
   ./start.sh
   ```
   
   Or manually:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### 🛠️ Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY=your_api_key_here
export DATABASE_URL=postgresql://user:password@localhost/taskdb

# Run the application
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the application
npm run dev
```

## 💬 Chat Commands

The AI agent understands natural language commands such as:

### Creating Tasks
- "Create a task to buy milk tomorrow"
- "Add a high priority task to review the code"
- "Remind me to call mom next week"

### Managing Tasks
- "Mark task 'Review code' as completed"
- "Update the meeting task to high priority"
- "Change the due date for grocery shopping to Friday"

### Viewing Tasks
- "Show me all high priority tasks"
- "List all completed tasks"
- "What tasks are due today?"

### Deleting Tasks
- "Delete the task about meeting"
- "Remove the old grocery task"

## 🔌 API Endpoints

### REST API
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/{id}` - Get a specific task
- `PUT /tasks/{id}` - Update a task
- `DELETE /tasks/{id}` - Delete a task
- `GET /tasks/filter/priority/{priority}` - Filter by priority
- `GET /tasks/filter/status/{status}` - Filter by status

### WebSocket
- `WS /ws` - Real-time chat with AI agent

### Chat API
- `POST /chat` - Send message to AI agent

## 🧪 Development

### Running Tests
```bash
cd backend
pytest
```

### Code Quality
```bash
cd backend
black .
flake8 .
```

### Frontend Linting
```bash
cd frontend
npm run lint
```

## 🚀 Deployment

### Production Docker Setup
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Or use the provided start script
./start.sh
```

### Environment Variables for Production
```bash
# Required
GOOGLE_API_KEY=your_production_api_key

# Optional
DATABASE_URL=postgresql://user:password@db:5432/taskdb
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🎯 Features in Detail

### AI Agent Capabilities
- **Natural Language Processing**: Understands complex task requests
- **Context Awareness**: Remembers conversation context
- **Smart Parsing**: Extracts dates, priorities, and task details
- **Error Handling**: Graceful handling of invalid requests

### Real-time Features
- **WebSocket Communication**: Instant chat responses
- **Live Task Updates**: Task list updates automatically
- **Connection Status**: Visual indicators for connection state

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on all device sizes
- **Keyboard Shortcuts**: Enter to send messages
- **Loading States**: Visual feedback during operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LangGraph](https://github.com/langchain-ai/langgraph) for the agent framework
- [Google Gemini](https://ai.google.dev/) for the LLM capabilities
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for the styling framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Built with ❤️ using modern AI and web technologies**
