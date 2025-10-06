import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "timestamp" in response.json()

def test_get_tasks():
    """Test getting all tasks"""
    response = client.get("/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_task():
    """Test creating a new task"""
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "medium"
    }
    response = client.post("/tasks", json=task_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Task"
    assert response.json()["description"] == "This is a test task"
    assert "id" in response.json()

def test_chat_endpoint():
    """Test the chat endpoint"""
    message_data = {
        "message": "Hello, can you help me create a task?"
    }
    response = client.post("/chat", json=message_data)
    assert response.status_code == 200
    assert "response" in response.json()
    assert "timestamp" in response.json()



