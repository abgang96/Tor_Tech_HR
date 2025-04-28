import { useState, useEffect } from 'react';
import Head from 'next/head';
import { app } from '@microsoft/teams-js';
import Header from '../components/Header';
import TasksList from '../components/tasks/TasksList';
import LoginForm from '../components/auth/LoginForm';
import api from '../lib/api'; // Corrected import path

export default function TasksPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeamsContext, setIsTeamsContext] = useState(false);
  const [activeFilter, setActiveFilter] = useState('week'); // Changed from 'all' to 'week'

  useEffect(() => {
    // Check if we're running in Teams
    const checkTeamsContext = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Only run in browser environment
          const context = await app.getContext();
          setIsTeamsContext(!!context);
        }
      } catch (error) {
        console.log('Not running in Teams context');
        setIsTeamsContext(false);
      }
    };

    // Check authentication status
    const checkAuth = () => {
      // This is a placeholder for actual authentication logic
      const token = localStorage.getItem('auth_token');
      if (token) {
        // You would validate the token here
        setIsAuthenticated(true);
        // Set user data from token or fetch from API
        setUser({ name: 'Test User', email: 'test@example.com' });
        
        // Fetch tasks (simulated for now)
        fetchTasks();
      } else {
        setLoading(false);
      }
    };

    checkTeamsContext();
    checkAuth();
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksData = await api.getTasks();
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleLogin = (credentials) => {
    // This is a placeholder for actual login logic
    console.log('Logging in with:', credentials);
    // Mock successful login
    localStorage.setItem('auth_token', 'mock_token');
    setIsAuthenticated(true);
    setUser({ name: credentials.username, email: `${credentials.username}@example.com` });
    
    // Fetch tasks after login
    fetchTasks();
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      // Call the API to update the task
      await api.updateTask(taskId, updates);
      
      // Update task in state after successful API call
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updates } 
            : task
        )
      );
      
      console.log(`Task ${taskId} updated successfully:`, updates);
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      // You could add error handling here, like showing a notification
    }
  };

  // New function to handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div>
      <Head>
        <title>Your Tasks | OKR Tree</title>
        <meta name="description" content="Manage your OKR tasks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header 
        isAuthenticated={isAuthenticated} 
        user={user} 
        isTeamsContext={isTeamsContext} 
      />

      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <LoginForm onLogin={handleLogin} />
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading your tasks...</div>
          </div>
        ) : (
          <TasksList 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        )}
      </main>
    </div>
  );
}