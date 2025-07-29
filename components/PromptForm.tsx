import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MicIcon, GlobeIcon } from './Icons';

interface PromptFormProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (prompt: string, isSearchEnabled: boolean) => void;
  isLoading: boolean;
  isSearchEnabled: boolean;
  setIsSearchEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define types for the non-standard Web Speech API to avoid using `any`
interface SpeechRecognitionResult {
  isFinal: boolean;
  [key: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition as SpeechRecognitionStatic | undefined;

export const PromptForm: React.FC<PromptFormProps> = ({ prompt, setPrompt, onSubmit, isLoading, isSearchEnabled, setIsSearchEnabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isApiSupported = !!SpeechRecognitionAPI;

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    }
    onSubmit(prompt, isSearchEnabled);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isListening) {
        recognitionRef.current?.stop();
      }
      onSubmit(prompt, isSearchEnabled);
    }
  };

  const handleMicClick = useCallback(() => {
    if (!isApiSupported) {
      setMicError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return; // onend will set isListening to false
    }
    
    setMicError(null);
    const recognition = new SpeechRecognitionAPI!();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    let finalTranscript = ''; // This will accumulate final results across events

    recognition.onstart = () => {
      setIsListening(true);
      setPrompt(''); // Clear prompt visually at the start
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setMicError("No speech detected. Please check your microphone.");
      } else if (event.error === 'not-allowed') {
        setMicError("Microphone access was denied. Please allow it in your browser settings.");
      } else {
        setMicError(`An error occurred: ${event.error}`);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setPrompt(finalTranscript + interimTranscript);
    };

    recognition.start();
  }, [isApiSupported, isListening, setPrompt]);


  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <label htmlFor="prompt-input" className="sr-only">Enter your question</label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything or click the mic to speak..."
          className="w-full h-32 p-4 bg-dark-input border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none transition-colors duration-200"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <label htmlFor="search-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
                <input 
                    type="checkbox" 
                    id="search-toggle" 
                    className="sr-only"
                    checked={isSearchEnabled}
                    onChange={() => setIsSearchEnabled(!isSearchEnabled)}
                    disabled={isLoading}
                />
                <div className={`block w-12 h-6 rounded-full transition-colors ${isSearchEnabled ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isSearchEnabled ? 'translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-dark-subtle flex items-center gap-2">
                <GlobeIcon />
                <span>Search web</span>
            </div>
        </label>
        
        <div className="flex items-center justify-end gap-x-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || !isApiSupported}
            className={`relative p-2 rounded-full text-dark-subtle hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'text-brand-primary' : ''}`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            <MicIcon />
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-brand-primary/20 animate-pulse"></span>
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-dark-input disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
          >
            Submit
          </button>
        </div>
      </div>
      {micError && <p className="text-red-400 text-sm mt-2 text-center">{micError}</p>}
    </form>
  );
};