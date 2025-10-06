import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types';
import { api } from '@/utils/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: TaskCreateRequest) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: number, taskData: TaskUpdateRequest) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? response.data : task
      ));
      return response.data;
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    }
  }, []);

  const toggleTaskStatus = useCallback(async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return updateTask(id, { status: newStatus as any });
  }, [updateTask]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus
  };
};



