import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SrtEntry } from '../types';

export function usePlayback(srtEntries: SrtEntry[], audioUrl?: string) {

  // 实时播放状态保留在 hook 内：currentTime 会随动画帧高频变化，并且需要和浏览器 Audio 元素同步。
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
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
      audioRef.current.onloadedmetadata = () => {
        setAudioDuration(Number.isFinite(audioRef.current?.duration) ? audioRef.current!.duration : 0);
      };
      audioRef.current.load();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setAudioDuration(0);
    }
  }, [audioUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;

      if (isTypingTarget || srtEntries.length === 0) return;

      event.preventDefault();
      setIsPlaying((previous) => !previous);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [srtEntries.length]);

  const subtitleDuration = useMemo(() => {
    if (srtEntries.length === 0) return 0;
    return srtEntries[srtEntries.length - 1].endSeconds;
  }, [srtEntries]);

  const totalDuration = useMemo(
    () => Math.max(subtitleDuration, audioDuration),
    [audioDuration, subtitleDuration]
  );

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
