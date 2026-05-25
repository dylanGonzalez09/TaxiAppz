// src/contexts/LoadingContext.tsx
'use client';
import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => { },
  stopLoading: () => { },
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {

  const context = useContext(LoadingContext);

  if (!context) {

    throw new Error('useLoading must be used within a LoadingProvider');

  }

  return context;

};
