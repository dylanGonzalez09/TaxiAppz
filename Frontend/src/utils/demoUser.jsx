import { useState, useEffect } from 'react';

export const useIsDemoUser = () => {
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('isDemoUser');

      setIsDemoUser(storedValue === 'true');
      
      // Set up listener for storage changes
      const handleStorageChange = (event) => {
        if (event.key === 'isDemoUser') {
          setIsDemoUser(event.newValue === 'true');
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // Safe method to check status that works on both client and server
  const checkDemoStatus = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDemoUser') === 'true';
    }

    
return false;
  };

  return { isDemoUser, checkDemoStatus };
};