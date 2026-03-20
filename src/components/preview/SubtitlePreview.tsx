import { motion } from 'motion/react';
import { useMemo } from 'react';
import { SrtEntry, SubtitleStyle } from '../../types';

interface SubtitlePreviewProps {
  currentEntry?: SrtEntry;
  style: SubtitleStyle;
}

export function SubtitlePreview({ currentEntry, style }: SubtitlePreviewProps) {
  // Auto-wrap text for preview
  const wrappedText = useMemo(() => {
    if (!currentEntry) return '';
    const text = currentEntry.text;
    if (text.length < 15) return text;
    // Simple wrapping logic for preview
    const mid = Math.floor(text.length / 2);
    const space = text.lastIndexOf(' ', mid);
    if (space !== -1) {
      return text.substring(0, space) + '\n' + text.substring(space + 1);
    }
    return text;
  }, [currentEntry]);

  if (!currentEntry) {
    return (
      <div className="text-white/20 text-sm italic">
        Upload SRT to see preview
      </div>
    );
  }

  return (
    <motion.div
      key={currentEntry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[80%] text-center whitespace-pre-wrap"
      style={{
        color: style.textColor,
        backgroundColor: `${style.backgroundColor}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
        borderRadius: `${style.borderRadius}px`,
        padding: `${style.paddingY}px ${style.paddingX}px`,
        fontSize: `${style.fontSize}px`,
        lineHeight: 1.4,
      }}
    >
      {wrappedText}
    </motion.div>
  );
}
