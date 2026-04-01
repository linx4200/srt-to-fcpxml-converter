import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SrtEntry } from '../types';

export function usePlayback(srtEntries: SrtEntry[], audioUrl?: string) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.load();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [audioUrl]);

  const totalDuration = useMemo(() => {
    if (srtEntries.length === 0) return 0;
    return srtEntries[srtEntries.length - 1].endSeconds;
  }, [srtEntries]);

  // Sync state and playback
  useEffect(() => {
    const audio = audioRef.current;
    
    if (isPlaying) {
      if (audio) {
        audio.currentTime = currentTime;
        audio.play().catch(err => {
          console.error("Audio play blocked or failed:", err);
          setIsPlaying(false);
        });
      }

      const syncPlayback = () => {
        if (audio) {
          const newTime = audio.currentTime;
          if (newTime >= totalDuration) {
            setCurrentTime(totalDuration);
            setIsPlaying(false);
            audio.pause();
          } else {
            setCurrentTime(newTime);
            playbackRef.current = requestAnimationFrame(syncPlayback);
          }
        } else {
          // Fallback to RAF timer if no audio
          const startTime = Date.now() - currentTime * 1000;
          const tick = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            if (elapsed >= totalDuration) {
              setCurrentTime(totalDuration);
              setIsPlaying(false);
            } else {
              setCurrentTime(elapsed);
              playbackRef.current = requestAnimationFrame(tick);
            }
          };
          playbackRef.current = requestAnimationFrame(tick);
        }
      };
      
      playbackRef.current = requestAnimationFrame(syncPlayback);
    } else {
      if (audio) audio.pause();
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    }

    return () => {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    };
  }, [isPlaying, totalDuration, audioUrl]);

  // Handle manual time updates (scrubbing)
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const currentEntry = useMemo(() => {
    return srtEntries.find(
      (entry, index) =>
        currentTime >= entry.startSeconds &&
        (currentTime < entry.endSeconds || (index === srtEntries.length - 1 && currentTime <= entry.endSeconds))
    );
  }, [srtEntries, currentTime]);

  return {
    currentTime,
    setCurrentTime: handleTimeUpdate,
    isPlaying,
    setIsPlaying,
    totalDuration,
    currentEntry
  };
}
