import Head from 'next/head';
import { useState, useEffect } from 'react';
import { app } from '@microsoft/teams-js';
import OKRTree from '../components/OKRTree';
import Header from '../components/Header';
import LoginForm from '../components/auth/LoginForm';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isTeamsContext, setIsTeamsContext] = useState(false);

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
      }
    };

    checkTeamsContext();
    checkAuth();
  }, []);

  const handleLogin = (credentials) => {
    // This is a placeholder for actual login logic
    console.log('Logging in with:', credentials);
    // Mock successful login
    localStorage.setItem('auth_token', 'mock_token');
    setIsAuthenticated(true);
    setUser({ name: credentials.username, email: `${credentials.username}@example.com` });
  };

  return (
    <div>
      <Head>
        <title>OKR Tree</title>
        <meta name="description" content="OKR Tree Visualization and Management" />
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
        ) : (
          <OKRTree />
        )}
      </main>
    </div>
  );
} 