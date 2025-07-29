
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { PromptForm } from './components/PromptForm';
import { ResponseDisplay } from './components/ResponseDisplay';
import { generateStreamingResponse, generateConversationalAudioScript } from './services/geminiService';
import { generateAudio } from './services/elevenLabsService';
import { GEMINI_API_KEY, ELEVENLABS_API_KEY } from './services/ttsService';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';

const ApiKeyErrorDisplay: React.FC<{ missingKeys: string[] }> = ({ missingKeys }) => (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-red-300">Configuration Error</h1>
            <p className="mt-4 text-lg text-red-200">
                The following environment variables are missing from your deployment configuration:
            </p>
            <ul className="mt-4 mb-6 text-left list-disc list-inside bg-dark-input p-4 rounded-lg">
                {missingKeys.map(key => (
                    <li key={key} className="font-mono text-red-300">{key}</li>
                ))}
            </ul>
            <p className="text-red-200">Please add these variables to your hosting provider's settings (e.g., Netlify, Vercel) and redeploy to continue.</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [fullResponseText, setFullResponseText] = useState<string>('');
  const [processedResponseHtml, setProcessedResponseHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for web search
  const [isSearchEnabled, setIsSearchEnabled] = useState<boolean>(false);
  const [sources, setSources] = useState<any[]>([]);

  // State for ElevenLabs audio
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const missingApiKeys = useMemo(() => {
    const missing: string[] = [];
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PLACEHOLDER')) {
        missing.push("API_KEY");
    }
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes('PLACEHOLDER')) {
        missing.push("ELEVENLABS_API_KEY");
    }
    return missing;
  }, []);

  const resetState = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setPrompt('');
    setFullResponseText('');
    setProcessedResponseHtml('');
    setIsLoading(false);
    setError(null);
    setAudioUrl(null);
    setIsPlayingAudio(false);
    setIsGeneratingAudio(false);
    setAudioError(null);
    setSources([]);
  }, [audioUrl]);

  const handleReset = useCallback(() => {
    resetState();
  }, [resetState]);

  const processResponseWithCitations = (text: string, citations: any[]) => {
      if (!citations || citations.length === 0) {
        setProcessedResponseHtml(text);
        setSources([]);
        return;
      }

      // 1. Create a unique, numbered list of sources
      const uniqueSourcesMap = new Map<string, any>();
      citations.forEach(citation => {
          if (!uniqueSourcesMap.has(citation.web.uri)) {
              uniqueSourcesMap.set(citation.web.uri, citation.web);
          }
      });
      const uniqueSources = Array.from(uniqueSourcesMap.values()).map((source, index) => ({
        ...source,
        number: index + 1,
      }));
      setSources(uniqueSources);
      
      // 2. Inject citation links into the text
      let processedText = text;
      // Sort citations by end index in descending order to avoid messing up indices
      const sortedCitations = [...citations].sort((a, b) => b.endIndex - a.endIndex);

      sortedCitations.forEach(citation => {
        const sourceInfo = uniqueSources.find(s => s.uri === citation.web.uri);
        if (sourceInfo) {
          const link = `<a href="${sourceInfo.uri}" target="_blank" rel="noopener noreferrer" title="${sourceInfo.title}" class="citation-link">${sourceInfo.number}</a>`;
          processedText = processedText.slice(0, citation.endIndex) + link + processedText.slice(citation.endIndex);
        }
      });
      
      setProcessedResponseHtml(processedText);
  };

  const handleSubmit = useCallback(async (currentPrompt: string, searchEnabled: boolean) => {
    if (!currentPrompt || isLoading || isGeneratingAudio) {
      return;
    }
    
    resetState();
    setIsLoading(true);

    try {
      let streamingText = '';
      const { fullText, citations } = await generateStreamingResponse(
        currentPrompt, 
        searchEnabled,
        (chunk) => {
          streamingText += chunk;
          // Render raw text as it streams for immediate feedback
          setProcessedResponseHtml(streamingText);
        }
      );
      
      setFullResponseText(fullText);
      processResponseWithCitations(fullText, citations);
      setIsLoading(false);

      setIsGeneratingAudio(true);
      const audioScript = generateConversationalAudioScript(fullText);
      const generatedAudioUrl = await generateAudio(audioScript);
      setAudioUrl(generatedAudioUrl);
      setAudioError(null);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (isLoading) {
        setError(errorMessage);
      } else {
        setAudioError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsGeneratingAudio(false);
    }
  }, [isLoading, isGeneratingAudio, resetState]);

  if (missingApiKeys.length > 0) {
      return <ApiKeyErrorDisplay missingKeys={missingApiKeys} />;
  }

  return (
    <div className="min-h-screen text-dark-text font-sans flex flex-col items-center p-2 sm:p-4">
      <div className="w-full max-w-3xl mx-auto">
        <Header onReset={handleReset} isLoading={isLoading || isGeneratingAudio} />
        <main className="mt-8">
          <PromptForm
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            isLoading={isLoading || isGeneratingAudio}
            isSearchEnabled={isSearchEnabled}
            setIsSearchEnabled={setIsSearchEnabled}
          />

          {isLoading && !processedResponseHtml && (
             <div className="flex justify-center items-center mt-8">
                <LoadingSpinner />
             </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {processedResponseHtml && !error && (
            <ResponseDisplay 
              processedResponseHtml={processedResponseHtml}
              audioUrl={audioUrl}
              isGeneratingAudio={isGeneratingAudio}
              audioError={audioError}
              audioRef={audioRef}
              onReset={handleReset}
              sources={sources}
              isPlayingAudio={isPlayingAudio}
              setIsPlayingAudio={setIsPlayingAudio}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
