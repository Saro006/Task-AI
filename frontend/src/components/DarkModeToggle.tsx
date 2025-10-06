import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95"
      aria-label="Toggle dark mode"
    >
      <div className="relative">
        {isDark ? (
          <Sun className="w-5 h-5 animate-bounce-in" />
        ) : (
          <Moon className="w-5 h-5 animate-bounce-in" />
        )}
        <div className="absolute inset-0 bg-primary-200 dark:bg-primary-800 rounded-full blur-md opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
      </div>
    </button>
  );
};

export default DarkModeToggle;
