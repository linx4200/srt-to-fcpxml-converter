import { motion } from 'motion/react';
import { useMemo } from 'react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { FCP_RESOLUTION, UI_LOGICAL_RESOLUTION } from '../../constants';

interface SubtitlePreviewProps {
  currentEntry?: SrtEntry;
  style: SubtitleStyle;
  containerWidth?: number;
}

export function SubtitlePreview({ currentEntry, style, containerWidth = UI_LOGICAL_RESOLUTION.portrait.width }: SubtitlePreviewProps) {
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

  const referenceWidth = style.orientation === 'portrait' ? FCP_RESOLUTION.portrait.width : FCP_RESOLUTION.landscape.width;
  const scale = containerWidth / referenceWidth;

  return (
    <motion.div
      key={currentEntry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[80%] text-center whitespace-pre-wrap"
      style={{
        color: style.textColor,
        backgroundColor: `${style.backgroundColor}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
        borderRadius: `${style.borderRadius * scale}px`,
        padding: `${style.paddingY * scale}px ${style.paddingX * scale}px`,
        fontSize: `${style.fontSize * scale}px`,
        lineHeight: 1.4,
      }}
    >
      {wrappedText}
    </motion.div>
  );
}
