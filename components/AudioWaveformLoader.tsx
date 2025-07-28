import React from 'react';

export const AudioWaveformLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-card/80 backdrop-blur-sm">
        <div className="flex justify-center items-center space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 h-4 bg-brand-primary rounded-full animate-wave" 
                    style={{ animationDelay: `${i * 120}ms` }}
                ></div>
            ))}
        </div>
        <p className="mt-4 text-dark-subtle text-sm tracking-wider">Generating Audio...</p>
    </div>
  );
};

const style = document.createElement('style');
if (!document.querySelector('#waveform-loader-animation')) {
    style.id = 'waveform-loader-animation';
    style.innerHTML = `
      @keyframes wave {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(2.5); }
      }
      .animate-wave {
        animation: wave 1.2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
}
