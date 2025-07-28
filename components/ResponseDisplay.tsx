import React from 'react';
import { AudioVisualizer } from './AudioVisualizer';
import { TrashIcon, LinkIcon, PlayIcon, PauseIcon } from './Icons';
import { AudioWaveformLoader } from './AudioWaveformLoader';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface ResponseDisplayProps {
  processedResponseHtml: string;
  audioUrl: string | null;
  isGeneratingAudio: boolean;
  audioError: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  onReset: () => void;
  sources: any[];
  isPlayingAudio: boolean;
  setIsPlayingAudio: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ 
  processedResponseHtml,
  audioUrl, 
  isGeneratingAudio, 
  audioError,
  audioRef,
  onReset,
  sources,
  isPlayingAudio,
  setIsPlayingAudio,
}) => {
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Play action failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="mt-8 p-4 sm:p-6 bg-dark-card rounded-xl shadow-lg shadow-brand-primary/20 animate-fade-in relative">
      <div className="absolute top-3 right-3 flex items-center gap-x-3 z-20">
        {audioUrl && !audioError && (
          <button
            onClick={togglePlayPause}
            className="p-1 rounded-full text-dark-subtle hover:text-white transition-colors duration-200"
            aria-label={isPlayingAudio ? 'Pause response' : 'Play response'}
          >
            {isPlayingAudio ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
        <button
          onClick={onReset}
          className="p-1 text-dark-subtle hover:text-white transition-colors duration-200"
          aria-label="Delete chat and start new"
        >
          <TrashIcon />
        </button>
      </div>
      
      {(isGeneratingAudio || audioUrl || audioError) && (
        <div className="mb-6 relative">
          {audioError && !isGeneratingAudio && (
             <div className="h-full flex flex-col items-center justify-center text-center p-4 min-h-[144px] bg-dark-input/30 rounded-lg">
                <p className="font-bold text-red-400">Audio Generation Failed</p>
                <p className="text-sm text-red-400/80 mt-1">{audioError}</p>
             </div>
          )}

          {audioUrl && !audioError && (
            <>
              <AudioVisualizer audioRef={audioRef} />
              <CustomAudioPlayer
                audioUrl={audioUrl}
                audioRef={audioRef}
                isPlaying={isPlayingAudio}
                setIsPlaying={setIsPlayingAudio}
                onTogglePlayPause={togglePlayPause}
              />
            </>
          )}

          {isGeneratingAudio && <AudioWaveformLoader />}
        </div>
      )}

      <div 
        className="text-gray-200 leading-relaxed prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processedResponseHtml }}
      />

      {sources && sources.length > 0 && (
        <div className="mt-6 border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-dark-subtle mb-3">Sources:</h3>
            <ol className="list-decimal list-inside space-y-3">
                {sources.map((source) => (
                    <li key={source.uri} className="text-sm">
                      <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-2 text-gray-300 hover:text-brand-primary transition-colors duration-200"
                      >
                          <span className="truncate">{source.title}</span>
                          <LinkIcon className="w-4 h-4 mt-0.5 text-dark-subtle flex-shrink-0" />
                      </a>
                    </li>
                ))}
            </ol>
        </div>
      )}
    </div>
  );
};

// Add fade-in animation keyframes to the document's head
const style = document.createElement('style');
if (!document.querySelector('#response-display-animation')) {
    style.id = 'response-display-animation';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
      .prose { max-width: 65ch; } /* Basic prose styling */
      .prose-invert { color: #f3f4f6; }
      .prose-invert a { color: #a5b4fc; }
      .prose-invert a:hover { color: #818cf8; }
    `;
    document.head.appendChild(style);
}