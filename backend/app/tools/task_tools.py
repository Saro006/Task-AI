from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate
from langchain.tools import tool
import json

class TaskManager:
    def __init__(self, db: Session):
        self.db = db

    def create_task(self, title: str, description: Optional[str] = None, 
                   due_date: Optional[datetime] = None, priority: str = "medium") -> Dict[str, Any]:
        """Create a new task"""
        try:
            task_priority = TaskPriority(priority.lower()) if priority else TaskPriority.MEDIUM
            task = Task(
                title=title,
                description=description,
                due_date=due_date,
                priority=task_priority
            )
            self.db.add(task)
            self.db.commit()
            self.db.refresh(task)
            
            return {
                "success": True,
                "message": f"Task '{title}' created successfully",
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "due_date": task.due_date.isoformat() if task.due_date else None
                }
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "message": f"Error creating task: {str(e)}"}

    def update_task(self, task_id: Optional[int] = None, title_match: Optional[str] = None,
                   **updates) -> Dict[str, Any]:
        """Update an existing task by ID or title match"""
        try:
            if task_id:
                task = self.db.query(Task).filter(Task.id == task_id).first()
            elif title_match:
                task = self.db.query(Task).filter(Task.title.ilike(f"%{title_match}%")).first()
            else:
                return {"success": False, "message": "Either task_id or title_match must be provided"}

            if not task:
                return {"success": False, "message": "Task not found"}

            # Update fields
            for field, value in updates.items():
                if hasattr(task, field) and value is not None:
                    if field == "status" and isinstance(value, str):
                        setattr(task, field, TaskStatus(value))
                    elif field == "priority" and isinstance(value, str):
                        setattr(task, field, TaskPriority(value))
                    else:
                        setattr(task, field, value)

            self.db.commit()
            self.db.refresh(task)
            
            return {
                "success": True,
                "message": f"Task '{task.title}' updated successfully",
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "due_date": task.due_date.isoformat() if task.due_date else None
                }
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "message": f"Error updating task: {str(e)}"}

    def delete_task(self, task_id: Optional[int] = None, title_match: Optional[str] = None) -> Dict[str, Any]:
        """Delete a task by ID or title match"""
        try:
            if task_id:
                task = self.db.query(Task).filter(Task.id == task_id).first()
            elif title_match:
                task = self.db.query(Task).filter(Task.title.ilike(f"%{title_match}%")).first()
            else:
                return {"success": False, "message": "Either task_id or title_match must be provided"}

            if not task:
                return {"success": False, "message": "Task not found"}

            task_title = task.title
            self.db.delete(task)
            self.db.commit()
            
            return {
                "success": True,
                "message": f"Task '{task_title}' deleted successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "message": f"Error deleting task: {str(e)}"}

    def list_tasks(self, status: Optional[str] = None) -> Dict[str, Any]:
        """List all tasks, optionally filtered by status"""
        try:
            query = self.db.query(Task)
            if status:
                query = query.filter(Task.status == TaskStatus(status))
            
            tasks = query.order_by(Task.created_at.desc()).all()
            
            task_list = []
            for task in tasks:
                task_list.append({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "created_at": task.created_at.isoformat()
                })
            
            return {
                "success": True,
                "message": f"Found {len(task_list)} tasks",
                "tasks": task_list
            }
        except Exception as e:
            return {"success": False, "message": f"Error listing tasks: {str(e)}"}

    def filter_tasks(self, priority: Optional[str] = None, status: Optional[str] = None,
                    due_date_filter: Optional[str] = None) -> Dict[str, Any]:
        """Filter tasks by priority, status, or due date"""
        try:
            query = self.db.query(Task)
            
            if priority:
                query = query.filter(Task.priority == TaskPriority(priority))
            if status:
                query = query.filter(Task.status == TaskStatus(status))
            if due_date_filter:
                # Simple date filtering - can be enhanced
                if due_date_filter == "today":
                    today = datetime.now().date()
                    query = query.filter(Task.due_date.cast(date) == today)
                elif due_date_filter == "overdue":
                    query = query.filter(Task.due_date < datetime.now())
            
            tasks = query.order_by(Task.priority.desc(), Task.due_date.asc()).all()
            
            task_list = []
            for task in tasks:
                task_list.append({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "created_at": task.created_at.isoformat()
                })
            
            return {
                "success": True,
                "message": f"Found {len(task_list)} tasks matching filters",
                "tasks": task_list
            }
        except Exception as e:
            return {"success": False, "message": f"Error filtering tasks: {str(e)}"}

# LangGraph tools
def create_task_tool(db: Session):
    @tool
    def create_task(title: str, description: str = "", due_date: str = "", priority: str = "medium") -> str:
        """Create a new task with title, description, optional due_date and priority.
        
        Args:
            title: The task title (required)
            description: Task description (optional)
            due_date: Due date in ISO format (optional)
            priority: Task priority - low, medium, high, urgent (default: medium)
        """
        task_manager = TaskManager(db)
        due_date_obj = None
        if due_date:
            try:
                due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except:
                pass
        
        result = task_manager.create_task(title, description, due_date_obj, priority)
        return json.dumps(result)
    
    return create_task

def update_task_tool(db: Session):
    @tool
    def update_task(task_id: int = 0, title_match: str = "", title: str = "", 
                   description: str = "", status: str = "", priority: str = "", 
                   due_date: str = "") -> str:
        """Update an existing task by ID or title match.
        
        Args:
            task_id: Task ID (use 0 if not available)
            title_match: Partial title to match (use if task_id is 0)
            title: New title (optional)
            description: New description (optional)
            status: New status - pending, in_progress, completed, cancelled (optional)
            priority: New priority - low, medium, high, urgent (optional)
            due_date: New due date in ISO format (optional)
        """
        task_manager = TaskManager(db)
        
        updates = {}
        if title:
            updates["title"] = title
        if description:
            updates["description"] = description
        if status:
            updates["status"] = status
        if priority:
            updates["priority"] = priority
        if due_date:
            try:
                updates["due_date"] = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except:
                pass
        
        task_id_val = task_id if task_id > 0 else None
        title_match_val = title_match if title_match else None
        
        result = task_manager.update_task(task_id_val, title_match_val, **updates)
        return json.dumps(result)
    
    return update_task

def delete_task_tool(db: Session):
    @tool
    def delete_task(task_id: int = 0, title_match: str = "") -> str:
        """Delete a task by ID or title match.
        
        Args:
            task_id: Task ID (use 0 if not available)
            title_match: Partial title to match (use if task_id is 0)
        """
        task_manager = TaskManager(db)
        task_id_val = task_id if task_id > 0 else None
        title_match_val = title_match if title_match else None
        
        result = task_manager.delete_task(task_id_val, title_match_val)
        return json.dumps(result)
    
    return delete_task

def list_tasks_tool(db: Session):
    @tool
    def list_tasks(status: str = "") -> str:
        """List all tasks, optionally filtered by status.
        
        Args:
            status: Filter by status - pending, in_progress, completed, cancelled (optional)
        """
        task_manager = TaskManager(db)
        status_val = status if status else None
        result = task_manager.list_tasks(status_val)
        return json.dumps(result)
    
    return list_tasks

def filter_tasks_tool(db: Session):
    @tool
    def filter_tasks(priority: str = "", status: str = "", due_date_filter: str = "") -> str:
        """Filter tasks by priority, status, or due date.
        
        Args:
            priority: Filter by priority - low, medium, high, urgent (optional)
            status: Filter by status - pending, in_progress, completed, cancelled (optional)
            due_date_filter: Filter by due date - today, overdue (optional)
        """
        task_manager = TaskManager(db)
        priority_val = priority if priority else None
        status_val = status if status else None
        due_date_val = due_date_filter if due_date_filter else None
        
        result = task_manager.filter_tasks(priority_val, status_val, due_date_val)
        return json.dumps(result)
    
    return filter_tasks
