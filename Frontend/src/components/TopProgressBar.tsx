// src/components/TopProgressBar.tsx

import React from 'react';

import { useLoading } from '@/contexts/LoadingContext'; // Ensure this path is correct

const TopProgressBar = () => {
  const { isLoading } = useLoading();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: 'blue',
        width: isLoading ? '100%' : '0%',
        transition: 'width 0.2s ease',
        zIndex: 9999,
      }}
    />
  );
};

export default TopProgressBar;
