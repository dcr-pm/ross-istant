
import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon } from './Icons';

interface CustomAudioPlayerProps {
  audioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  onTogglePlayPause: () => void;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ 
  audioUrl, 
  audioRef,
  isPlaying,
  setIsPlaying,
  onTogglePlayPause 
}) => {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    // Auto-play when component mounts with a new URL
    audio.play().catch(e => {
        console.error("Autoplay was prevented:", e);
        // If autoplay is blocked by the browser, ensure our state reflects that.
        setIsPlaying(false);
    });

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [audioRef, audioUrl, setIsPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const progressBar = progressBarRef.current;
    const clickPositionX = e.clientX - progressBar.getBoundingClientRect().left;
    const width = progressBar.offsetWidth;
    const newTime = (clickPositionX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="mt-4 flex items-center gap-4">
       <audio ref={audioRef} src={audioUrl} hidden />
      <button
        onClick={onTogglePlayPause}
        className="p-2 rounded-full bg-brand-primary text-white hover:bg-brand-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-dark-card"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="flex-grow flex items-center gap-2">
        <span className="text-xs text-dark-subtle w-10">{formatTime(currentTime)}</span>
        <div 
          ref={progressBarRef}
          className="w-full h-1.5 bg-dark-input rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-brand-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          ></div>
        </div>
        <span className="text-xs text-dark-subtle w-10">{formatTime(duration)}</span>
      </div>
    </div>
  );
};
