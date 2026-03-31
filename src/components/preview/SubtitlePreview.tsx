import { motion } from 'motion/react';
import { SrtEntry, SubtitleStyle } from '../../types';
import { FCP_RESOLUTION, UI_LOGICAL_RESOLUTION } from '../../constants';
import { getFontPixelSize } from '../../utils';

interface SubtitlePreviewProps {
  currentEntry?: SrtEntry;
  style: SubtitleStyle;
  containerHeight?: number;
}

export function SubtitlePreview({ currentEntry, style, containerHeight = UI_LOGICAL_RESOLUTION.portrait.height }: SubtitlePreviewProps) {
  if (!currentEntry) {
    return (
      <div className="text-white/20 text-sm italic">
        Upload SRT to see preview
      </div>
    );
  }

  const referenceHeight = style.orientation === 'portrait' ? FCP_RESOLUTION.portrait.height : FCP_RESOLUTION.landscape.height;

  const scale = containerHeight / referenceHeight;
  const fontSize = getFontPixelSize(style.fontSize, referenceHeight).height;

  return (
    <motion.div
      key={currentEntry.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[80%] text-center whitespace-pre-wrap"
      style={{
        color: style.textColor,
        // backgroundColor: `${style.backgroundColor}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
        // borderRadius: `${style.borderRadius * scale}px`,
        padding: `${style.paddingY * scale}px ${style.paddingX * scale}px`,
        fontSize: `${fontSize * scale}px`,
        lineHeight: 1,
      }}
    >
      {currentEntry.text}
    </motion.div>
  );
}
