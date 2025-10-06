from typing import Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from app.tools.task_tools import TaskManager
import json
import re
from datetime import datetime

class TaskAgent:
    def __init__(self, api_key: str):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=api_key,
            temperature=0.1,
            convert_system_message_to_human=True
        )
        self.system_prompt = """You are an AI task management assistant. You help users manage their tasks through natural language commands.

Available tools:
- create_task: Create a new task with title, description, due_date, priority
- update_task: Update an existing task by ID or title match
- delete_task: Delete a task by ID or title match
- list_tasks: List all tasks, optionally filtered by status
- filter_tasks: Filter tasks by priority, status, or due date

When users ask you to:
1. Create tasks: Use create_task tool
2. Update tasks: Use update_task tool (you can toggle status by setting status to "completed" or "pending")
3. Delete tasks: Use delete_task tool
4. List/show tasks: Use list_tasks or filter_tasks tools
5. Mark tasks as done/complete: Use update_task with status="completed"
6. Mark tasks as pending: Use update_task with status="pending"

Always be helpful and provide clear responses. When you use tools, explain what you're doing and the results.

For date parsing, try to understand natural language dates like "tomorrow", "next week", "in 3 days" and convert them to ISO format.

Priority levels: low, medium, high, urgent
Status levels: pending, in_progress, completed, cancelled"""

    def process_message(self, user_message: str, db_session) -> Dict[str, Any]:
        """Process a user message and return response"""
        try:
            # Initialize task manager
            task_manager = TaskManager(db_session)
            
            # Create messages for the LLM
            messages = [
                HumanMessage(content=f"{self.system_prompt}\n\nUser request: {user_message}")
            ]
            
            # Get response from LLM
            response = self.llm.invoke(messages)
            llm_response = response.content.lower()
            
            # Parse the user's intent and execute appropriate actions
            tasks_updated = False
            response_text = ""
            
            # Check for different types of requests
            if any(word in llm_response for word in ["create", "add", "new task", "remind me"]):
                # Extract task details from the message
                title = self._extract_title(user_message)
                description = self._extract_description(user_message)
                priority = self._extract_priority(user_message)
                due_date = self._extract_due_date(user_message)
                
                result = task_manager.create_task(title, description, due_date, priority)
                if result["success"]:
                    response_text = result["message"]
                    tasks_updated = True
                else:
                    response_text = f"Error: {result['message']}"
                    
            elif any(word in llm_response for word in ["show", "list", "display", "get", "find"]):
                # Handle listing/filtering tasks
                if "high priority" in llm_response or "urgent" in llm_response:
                    result = task_manager.filter_tasks(priority="high")
                elif "completed" in llm_response:
                    result = task_manager.filter_tasks(status="completed")
                elif "pending" in llm_response:
                    result = task_manager.filter_tasks(status="pending")
                else:
                    result = task_manager.list_tasks()
                
                if result["success"]:
                    tasks = result.get("tasks", [])
                    if tasks:
                        response_text = f"Here are your tasks:\n\n"
                        for task in tasks:
                            response_text += f"• {task['title']} ({task['priority']} priority, {task['status']})\n"
                            if task.get('description'):
                                response_text += f"  Description: {task['description']}\n"
                            if task.get('due_date'):
                                response_text += f"  Due: {task['due_date']}\n"
                            response_text += "\n"
                    else:
                        response_text = "No tasks found matching your criteria."
                else:
                    response_text = f"Error: {result['message']}"
                    
            elif any(word in llm_response for word in ["mark", "complete", "done", "finish", "update"]):
                # Handle task updates
                title_match = self._extract_title(user_message)
                if "complete" in llm_response or "done" in llm_response:
                    result = task_manager.update_task(title_match=title_match, status="completed")
                else:
                    result = task_manager.update_task(title_match=title_match)
                
                if result["success"]:
                    response_text = result["message"]
                    tasks_updated = True
                else:
                    response_text = f"Error: {result['message']}"
                    
            elif any(word in llm_response for word in ["delete", "remove", "cancel"]):
                # Handle task deletion
                title_match = self._extract_title(user_message)
                result = task_manager.delete_task(title_match=title_match)
                
                if result["success"]:
                    response_text = result["message"]
                    tasks_updated = True
                else:
                    response_text = f"Error: {result['message']}"
                    
            else:
                # General response
                response_text = "I can help you manage your tasks! You can ask me to create, list, update, or delete tasks. For example, try saying 'Create a task to buy milk tomorrow' or 'Show me all high priority tasks'."
            
            return {
                "response": response_text,
                "tasks_updated": tasks_updated,
                "success": True
            }
            
        except Exception as e:
            return {
                "response": f"I encountered an error: {str(e)}",
                "tasks_updated": False,
                "success": False
            }
    
    def _extract_title(self, message: str) -> str:
        """Extract task title from user message"""
        # Simple extraction - look for patterns like "task to X" or "remind me to X"
        message_lower = message.lower()
        if "task to" in message_lower:
            title_words = message.split("task to")[1].split()[:3]  # Take first few words
            return " ".join(title_words)
        elif "remind me to" in message_lower:
            title_words = message.split("remind me to")[1].split()[:3]
            return " ".join(title_words)
        elif "create" in message_lower and "task" in message_lower:
            # Extract words after "create" and before "task"
            parts = message.split()
            try:
                create_idx = parts.index("create")
                task_idx = parts.index("task")
                if task_idx > create_idx:
                    return " ".join(parts[create_idx+1:task_idx])
            except:
                pass
        return "New Task"
    
    def _extract_description(self, message: str) -> str:
        """Extract task description from user message"""
        # For now, use the full message as description
        return message
    
    def _extract_priority(self, message: str) -> str:
        """Extract priority from user message"""
        message = message.lower()
        if "urgent" in message:
            return "urgent"
        elif "high priority" in message or "high" in message:
            return "high"
        elif "low priority" in message or "low" in message:
            return "low"
        else:
            return "medium"
    
    def _extract_due_date(self, message: str) -> datetime:
        """Extract due date from user message"""
        message = message.lower()
        if "tomorrow" in message:
            from datetime import datetime, timedelta
            tomorrow = datetime.now() + timedelta(days=1)
            return tomorrow
        elif "next week" in message:
            from datetime import datetime, timedelta
            next_week = datetime.now() + timedelta(weeks=1)
            return next_week
        # Add more date parsing as needed
        return None
