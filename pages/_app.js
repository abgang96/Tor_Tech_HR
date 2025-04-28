import { useEffect } from 'react';
import { app } from '@microsoft/teams-js';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Microsoft Teams SDK
    const initTeams = async () => {
      try {
        await app.initialize();
        const context = await app.getContext();
        console.log('Teams context:', context);
      } catch (error) {
        console.error('Error initializing Teams SDK:', error);
      }
    };

    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      initTeams();
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp; 