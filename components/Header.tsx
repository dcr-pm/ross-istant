
import React from 'react';

interface HeaderProps {
    onReset: () => void;
    isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isLoading }) => {
  return (
    <header className="relative text-center py-4">
        <div className="sm:absolute sm:top-4 sm:right-0 mb-4 sm:mb-0">
             <button
                onClick={onReset}
                disabled={isLoading}
                className="bg-dark-card hover:bg-dark-input focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-dark-bg text-dark-subtle font-semibold py-2 px-4 border border-dark-input rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Start new chat"
              >
                New Chat
              </button>
        </div>
        <div className="inline-block bg-gradient-to-r from-brand-primary to-brand-secondary p-1 rounded-full mb-4">
            <div className="bg-dark-card p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
        </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
        Ross-istant
      </h1>
      <p className="mt-2 text-lg text-dark-subtle">
        Your personal AI assistant.
      </p>
    </header>
  );
};