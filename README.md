# AI-Powered Task Management Agent

A modern full-stack application that integrates an AI agent with real backend functionality for task management. Users interact through a chat interface while the AI agent handles all task operations via natural language commands.

![AI Task Management](https://img.shields.io/badge/AI-Task%20Management-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![LangGraph](https://img.shields.io/badge/AI-LangGraph-orange)
![Docker](https://img.shields.io/badge/Deploy-Docker-blue)

---

## 🚀 Features

* **🤖 AI Agent**: Powered by LangGraph and Gemini API for natural language task management
* **💬 Real-time Chat**: WebSocket-based chat interface for seamless communication
* **📋 Live Task List**: Real-time updates of task management interface
* **🔄 Full CRUD Operations**: Create, read, update, delete tasks through natural language
* **🔍 Smart Filtering**: Filter tasks by priority, status, due date
* **🎨 Modern UI**: Clean, responsive design with dark mode support
* **🗄️ PostgreSQL Backend**: Robust data persistence with SQLAlchemy ORM
* **📱 Mobile Responsive**: Works perfectly on desktop and mobile devices

---

## 🛠️ Tech Stack

### Backend

* FastAPI
* LangGraph
* Google Gemini API
* PostgreSQL
* SQLAlchemy
* WebSockets

### Frontend

* Next.js 14
* TypeScript
* TailwindCSS
* Lucide React
* React Hot Toast

---

## 📁 Project Structure

```
AI-Task management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── agents/
│   │   ├── tools/
│   │   └── database/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
├── start.sh
├── env.example
└── README.md
```

---

## 🔗 Deployed URLs

* **Frontend:** [https://task-ai-frontend.onrender.com/](https://task-ai-frontend.onrender.com/)
* **Backend API Docs:** [https://task-ai-h3aa.onrender.com/docs](https://task-ai-h3aa.onrender.com/docs)

---

## 🚀 Quick Start

### Prerequisites

* Docker & Docker Compose (Recommended)
* OR Python 3.11+ and Node.js 18+
* Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

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

* Frontend: [https://task-ai-frontend.onrender.com/](https://task-ai-frontend.onrender.com/)
* Backend Docs/API: [https://task-ai-h3aa.onrender.com/docs](https://task-ai-h3aa.onrender.com/docs)

---

### 🛠️ Manual Setup

#### Backend

```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY=your_api_key_here
export DATABASE_URL=postgresql://user:password@localhost/taskdb

# Run the application
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_URL=https://task-ai-h3aa.onrender.com

# Run the application
npm run dev
```

---

## 💬 Chat Commands

* **Creating Tasks**:
  "Create a task to buy milk tomorrow"
  "Add a high priority task to review the code"

* **Managing Tasks**:
  "Mark task 'Review code' as completed"
  "Update the meeting task to high priority"

* **Viewing Tasks**:
  "Show me all high priority tasks"
  "List all completed tasks"

* **Deleting Tasks**:
  "Delete the task about meeting"
  "Remove the old grocery task"

---

## 🔌 API Endpoints

### REST API

* `GET /tasks` - List all tasks
* `POST /tasks` - Create a new task
* `GET /tasks/{id}` - Get a specific task
* `PUT /tasks/{id}` - Update a task
* `DELETE /tasks/{id}` - Delete a task
* `GET /tasks/filter/priority/{priority}` - Filter by priority
* `GET /tasks/filter/status/{status}` - Filter by status

### WebSocket

* `WS /ws` - Real-time chat with AI agent

### Chat API

* `POST /chat` - Send message to AI agent

---

## 🧪 Development

### Backend Tests

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

---

## 🎯 Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Or via start script
./start.sh
```

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_production_api_key

# Optional
DATABASE_URL=postgresql://user:password@db:5432/taskdb
NEXT_PUBLIC_API_URL=https://task-ai-h3aa.onrender.com
```

---

**Built with ❤️ using modern AI and web technologies**
