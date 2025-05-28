
import React, { useRef, useEffect, useState } from 'react';

interface WaterAnimationProps {
  isActive: boolean;
  audioStream?: MediaStream;
}

export const WaterAnimation: React.FC<WaterAnimationProps> = ({
  isActive,
  audioStream,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const [ripples, setRipples] = useState<Array<{
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
    speed: number;
  }>>([]);

  useEffect(() => {
    if (!audioStream || !isActive) {
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = undefined;
      }
      return;
    }

    const setupAudioAnalysis = async () => {
      try {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const source = audioContextRef.current.createMediaStreamSource(audioStream);
        source.connect(analyserRef.current);
      } catch (error) {
        console.log('Audio analysis setup failed:', error);
      }
    };

    setupAudioAnalysis();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, isActive]);

  const addRipple = (intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Add some randomness to ripple position
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 40;

    const newRipple = {
      x: centerX + offsetX,
      y: centerY + offsetY,
      radius: 0,
      maxRadius: Math.min(canvas.width, canvas.height) * 0.4 * (0.5 + intensity),
      alpha: 0.8 * intensity,
      speed: 2 + intensity * 3,
    };

    setRipples(prev => [...prev.slice(-4), newRipple]); // Keep max 5 ripples
  };

  const drawWater = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with water background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, 
      canvas.height / 2, 
      0,
      canvas.width / 2, 
      canvas.height / 2, 
      Math.min(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#00bcd4');
    gradient.addColorStop(0.5, '#0097a7');
    gradient.addColorStop(1, '#006064');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ripples
    setRipples(prevRipples => {
      const updatedRipples = prevRipples
        .map(ripple => ({
          ...ripple,
          radius: ripple.radius + ripple.speed,
          alpha: ripple.alpha * 0.98,
        }))
        .filter(ripple => ripple.radius < ripple.maxRadius && ripple.alpha > 0.05);

      // Draw each ripple
      updatedRipples.forEach(ripple => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ripple for more effect
        if (ripple.radius > 10) {
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      return updatedRipples;
    });

    // Analyze audio and create ripples
    if (analyserRef.current && isActive) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average frequency for intensity
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const intensity = average / 255;

      // Create ripples based on audio intensity
      if (intensity > 0.1 && Math.random() < intensity) {
        addRipple(intensity);
      }
    } else if (isActive) {
      // Fallback animation when no audio analysis
      if (Math.random() < 0.05) {
        addRipple(0.3 + Math.random() * 0.4);
      }
    }

    animationRef.current = requestAnimationFrame(drawWater);
  };

  useEffect(() => {
    if (isActive) {
      drawWater();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setRipples([]);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ borderRadius: '50%' }}
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700"></div>
        </div>
      )}
    </div>
  );
};
