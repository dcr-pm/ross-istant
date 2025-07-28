import React from 'react';

export const MicIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
        />
    </svg>
);

export const TrashIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
        />
    </svg>
);

export const PlayIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
    >
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l8.315-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
);

export const PauseIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
    >
        <path d="M5.75 3a.75.75 0 00-.75.75v12.5a.75.75 0 001.5 0V3.75A.75.75 0 005.75 3zm8.5 0a.75.75 0 00-.75.75v12.5a.75.75 0 001.5 0V3.75a.75.75 0 00-.75-.75z" />
    </svg>
);

export const GlobeIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m0 18a9 9 0 01-9-9m-4 9a9 9 0 019-9" 
      />
    </svg>
);

export const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className || "h-5 w-5"}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
      />
    </svg>
);