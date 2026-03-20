import { useState, useRef, useEffect, useMemo } from 'react';
import { SrtEntry } from '../types';

export function usePlayback(srtEntries: SrtEntry[]) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<number | null>(null);

  const totalDuration = useMemo(() => {
    if (srtEntries.length === 0) return 0;
    return srtEntries[srtEntries.length - 1].endSeconds;
  }, [srtEntries]);

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime * 1000;
      const tick = () => {
        const now = Date.now();
        const newTime = (now - startTime) / 1000;
        if (newTime >= totalDuration) {
          setCurrentTime(totalDuration);
          setIsPlaying(false);
        } else {
          setCurrentTime(newTime);
          playbackRef.current = requestAnimationFrame(tick);
        }
      };
      playbackRef.current = requestAnimationFrame(tick);
    } else if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
    };
  }, [isPlaying, totalDuration, currentTime]);

  const currentEntry = useMemo(() => {
    return srtEntries.find(e => currentTime >= e.startSeconds && currentTime <= e.endSeconds);
  }, [srtEntries, currentTime]);

  return {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
    currentEntry
  };
}
