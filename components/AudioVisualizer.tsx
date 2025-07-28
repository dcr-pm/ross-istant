
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const audioNodesRef = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
    source: MediaElementAudioSourceNode;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const handleResize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    // Initialize audio context and nodes only once to avoid errors with multiple renders
    if (!audioNodesRef.current) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(context.destination);
        
        audioNodesRef.current = { context, source, analyser };
      } catch (e) {
        console.error("Failed to initialize AudioContext:", e);
        return;
      }
    }

    const { context, analyser } = audioNodesRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#7c3aed'); // brand-secondary
      gradient.addColorStop(0.5, '#4f46e5'); // brand-primary
      gradient.addColorStop(1, '#7c3aed');
      canvasCtx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2.5;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };

    const onPlay = () => {
      if (context.state === 'suspended') {
        context.resume();
      }
      draw();
    };

    const onPause = () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);

    return () => {
      onPause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
    };
  }, [audioRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioNodesRef.current) {
        audioNodesRef.current.context.close().catch(e => console.error("Error closing audio context", e));
      }
    };
  }, []);

  return (
    <div className="h-24 w-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
