from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.task import TaskStatus, TaskPriority

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime = Field(default_factory=datetime.now)
    tasks_updated: bool = False



