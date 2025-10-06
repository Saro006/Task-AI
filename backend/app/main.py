from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import asyncio
from datetime import datetime

from app.database.connection import get_db, engine, Base
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, ChatMessage, ChatResponse
from app.agents.task_agent import TaskAgent
from app.database.connection import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Task Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize task agent
task_agent = TaskAgent(settings.google_api_key)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "AI Task Management API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Task CRUD endpoints
@app.get("/tasks")
async def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tasks"""
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks

@app.post("/tasks")
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/{task_id}")
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.put("/tasks/{task_id}")
async def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@app.get("/tasks/filter/priority/{priority}")
async def filter_tasks_by_priority(priority: str, db: Session = Depends(get_db)):
    """Filter tasks by priority"""
    tasks = db.query(Task).filter(Task.priority == priority).all()
    return tasks

@app.get("/tasks/filter/status/{status}")
async def filter_tasks_by_status(status: str, db: Session = Depends(get_db)):
    """Filter tasks by status"""
    tasks = db.query(Task).filter(Task.status == status).all()
    return tasks

# Chat endpoint
@app.post("/chat")
async def chat_with_agent(message: ChatMessage, db: Session = Depends(get_db)):
    """Chat with the AI agent"""
    try:
        result = task_agent.process_message(message.message, db)
        
        response = ChatResponse(
            response=result["response"],
            tasks_updated=result["tasks_updated"]
        )
        
        # Broadcast task updates to all connected WebSocket clients
        if result["tasks_updated"]:
            await manager.broadcast(json.dumps({
                "type": "tasks_updated",
                "timestamp": datetime.now().isoformat()
            }))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

# WebSocket endpoint for real-time chat
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "chat":
                # Process chat message with agent
                user_message = message_data.get("message", "")
                
                # Get database session for this request
                db = next(get_db())
                try:
                    result = task_agent.process_message(user_message, db)
                    
                    # Send response back to client
                    response = {
                        "type": "agent_response",
                        "response": result["response"],
                        "tasks_updated": result["tasks_updated"],
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    await manager.send_personal_message(json.dumps(response), websocket)
                    
                    # Broadcast task updates to all clients
                    if result["tasks_updated"]:
                        await manager.broadcast(json.dumps({
                            "type": "tasks_updated",
                            "timestamp": datetime.now().isoformat()
                        }))
                        
                except Exception as e:
                    error_response = {
                        "type": "error",
                        "message": f"Error processing message: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }
                    await manager.send_personal_message(json.dumps(error_response), websocket)
                finally:
                    db.close()
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



