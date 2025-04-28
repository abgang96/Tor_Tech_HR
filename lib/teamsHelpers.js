import { useState, useEffect } from 'react';
import { app, pages } from '@microsoft/teams-js';

/**
 * Initialize Microsoft Teams SDK
 */
export const initializeTeams = async () => {
  try {
    await app.initialize();
    return true;
  } catch (error) {
    console.error('Error initializing Microsoft Teams SDK:', error);
    return false;
  }
};

/**
 * Get the current Teams context
 */
export const getTeamsContext = async () => {
  try {
    const context = await app.getContext();
    return context;
  } catch (error) {
    console.error('Error getting Teams context:', error);
    return null;
  }
};

/**
 * Custom hook to detect if we're running in Teams
 */
export const useTeamsContext = () => {
  const [isTeams, setIsTeams] = useState(false);
  const [context, setContext] = useState(null);
  const [theme, setTheme] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Only initialize in browser environment
          const initialized = await initializeTeams();
          if (initialized) {
            const teamsContext = await getTeamsContext();
            setIsTeams(true);
            setContext(teamsContext);
            
            // Set theme
            if (teamsContext?.theme) {
              setTheme(teamsContext.theme);
            }
            
            // Register theme change handler
            app.registerOnThemeChangeHandler((newTheme) => {
              setTheme(newTheme);
            });
          }
        }
      } catch (error) {
        console.log('Not running in Teams context');
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  return { isTeams, context, theme, loading };
};

/**
 * Register the config handler for configurable tabs
 */
export const registerTabConfigHandler = (contentUrl, websiteUrl, entityId, name) => {
  pages.config.registerOnSaveHandler((saveEvent) => {
    const settings = {
      entityId,
      contentUrl,
      websiteUrl,
      suggestedDisplayName: name
    };
    
    pages.config.setConfig(settings);
    saveEvent.notifySuccess();
  });
  
  // Enable the save button
  pages.config.setValidityState(true);
};

/**
 * Open a URL in a Teams task module (dialog)
 */
export const openTaskModule = async (url, title, width, height) => {
  try {
    const taskInfo = {
      url,
      title,
      width,
      height
    };
    
    await pages.tasks.startTask(taskInfo);
  } catch (error) {
    console.error('Error opening task module:', error);
  }
};

/**
 * Get theme class name based on Teams theme
 */
export const getThemeClassName = (theme) => {
  switch (theme) {
    case 'dark':
      return 'teams-dark-theme dark';
    case 'contrast':
      return 'teams-contrast-theme dark';
    case 'default':
    default:
      return 'teams-light-theme';
  }
}; 