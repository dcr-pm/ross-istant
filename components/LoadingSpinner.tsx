import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-brand-primary/30"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-t-brand-primary animate-spin-slow"></div>
        <div className="absolute inset-2 rounded-full border-2 border-brand-secondary/30"></div>
        <div className="absolute inset-2 rounded-full border-b-2 border-b-brand-secondary animate-spin-reverse-slow"></div>
      </div>
      <p className="text-dark-subtle tracking-widest text-sm font-medium animate-pulse">THINKING...</p>
    </div>
  );
};
