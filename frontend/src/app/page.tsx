'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, WebSocketMessage } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTasks } from '@/hooks/useTasks';
import ChatInterface from '@/components/ChatInterface';
import TaskList from '@/components/TaskList';
import DarkModeToggle from '@/components/DarkModeToggle';
import { CheckSquare, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat');
  
  const { 
    tasks, 
    loading: tasksLoading, 
    fetchTasks, 
    toggleTaskStatus, 
    deleteTask 
  } = useTasks();
  
  const { isConnected, lastMessage, sendMessage } = useWebSocket(
    `${API_URL.replace('http', 'ws')}/ws`
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'agent_response':
          if (lastMessage.response) {
            const newMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: lastMessage.response,
              timestamp: lastMessage.timestamp
            };
            setMessages(prev => [...prev, newMessage]);
            setIsLoading(false);
          }
          break;
          
        case 'tasks_updated':
          fetchTasks();
          toast.success('Tasks updated!');
          break;
          
        case 'error':
          if (lastMessage.message) {
            toast.error(lastMessage.message);
            setIsLoading(false);
          }
          break;
      }
    }
  }, [lastMessage, fetchTasks]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Send message via WebSocket
    sendMessage({
      type: 'chat',
      message: message
    });
  }, [isLoading, sendMessage]);

  const handleToggleTaskStatus = useCallback(async (id: number, currentStatus: string) => {
    try {
      await toggleTaskStatus(id, currentStatus);
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  }, [toggleTaskStatus]);

  const handleDeleteTask = useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted!');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  }, [deleteTask]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 animate-slide-up">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                AI Task Management
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 animate-slide-down">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 animate-fade-in">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-all duration-300 ${
                  activeTab === 'chat'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
                {isConnected && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-all duration-300 ${
                  activeTab === 'tasks'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {tasks.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Chat Interface */}
          <div className={`${activeTab === 'chat' ? 'block' : 'hidden lg:block'} animate-fade-in`}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isConnected={isConnected}
              isLoading={isLoading}
            />
          </div>

          {/* Task List */}
          <div className={`${activeTab === 'tasks' ? 'block' : 'hidden lg:block'} animate-fade-in`}>
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover-lift">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Your Tasks
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-semibold">
                    {tasks.length} total
                  </div>
                </div>
              </div>
              
              <div className="h-[calc(100%-60px)] overflow-y-auto scrollbar-hide">
                <TaskList
                  tasks={tasks}
                  onToggleStatus={handleToggleTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  loading={tasksLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Content */}
        {activeTab === 'chat' && (
          <div className="lg:hidden mt-6">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isConnected={isConnected}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="lg:hidden mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Your Tasks
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {tasks.length} total
                </div>
              </div>
              
              <TaskList
                tasks={tasks}
                onToggleStatus={handleToggleTaskStatus}
                onDeleteTask={handleDeleteTask}
                loading={tasksLoading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
