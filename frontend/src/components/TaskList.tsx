import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { format } from 'date-fns';
import { CheckCircle, Circle, Clock, AlertCircle, Trash2, Edit } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: number, currentStatus: string) => void;
  onDeleteTask: (id: number) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onToggleStatus, 
  onDeleteTask, 
  loading = false 
}) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'text-red-600 bg-red-50 border-red-200';
      case TaskPriority.HIGH:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TaskPriority.LOW:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="w-5 h-5 text-blue-600" />;
      case TaskStatus.CANCELLED:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    if (!dueDate || status === TaskStatus.COMPLETED) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading tasks</p>
          <div className="flex space-x-1 mt-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="relative mb-6">
          <CheckCircle className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto animate-bounce-in" />
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full blur-xl opacity-30 animate-pulse-glow"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 animate-slide-up">
          No tasks yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 animate-slide-up">
          Start by asking the AI agent to create a task for you!
        </p>
        <div className="animate-slide-up">
          <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              Try: "Create a task to buy milk tomorrow"
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-task-slide ${
            task.status === TaskStatus.COMPLETED ? 'opacity-75' : ''
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <button
                onClick={() => onToggleStatus(task.id, task.status)}
                className="mt-1 hover:scale-125 transition-all duration-300 hover:shadow-lg active:scale-95"
                aria-label={`Mark task as ${task.status === TaskStatus.COMPLETED ? 'pending' : 'completed'}`}
              >
                <div className="relative">
                  {getStatusIcon(task.status)}
                  {task.status === TaskStatus.COMPLETED && (
                    <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-medium ${
                  task.status === TaskStatus.COMPLETED 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 hover:scale-105 ${getPriorityColor(task.priority)}`}>
                    <div className="w-2 h-2 rounded-full mr-2 animate-pulse"></div>
                    {task.priority}
                  </span>
                  
                  {task.due_date && (
                    <span className={`text-xs px-2 py-1 rounded-md transition-all duration-300 ${
                      isOverdue(task.due_date, task.status)
                        ? 'text-red-600 font-medium bg-red-50 dark:bg-red-900/20 animate-pulse'
                        : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
                    }`}>
                      📅 Due: {formatDate(task.due_date)}
                      {isOverdue(task.due_date, task.status) && ' ⚠️ Overdue'}
                    </span>
                  )}
                  
                  <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
                    🕒 {formatDate(task.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onDeleteTask(task.id)}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
