import { motion } from 'motion/react';
import { FCP_RESOLUTION, UI_LOGICAL_RESOLUTION } from '../../../constants';
import { useAppStore } from '../../../store/useAppStore';
import { getFontPixelSize } from '../../../utils';

interface PreviewSubtitleProps {
  text: string;
  containerHeight?: number;
}

/* 按 FCP 参考分辨率缩放当前字幕，尽量让浏览器预览贴近导出结果。 */
export function PreviewSubtitle({
  text,
  containerHeight = UI_LOGICAL_RESOLUTION.portrait.height,
}: PreviewSubtitleProps) {
  const subtitleStyle = useAppStore((state) => state.subtitleStyle);

  if (!text) {
    return (
      <div className="text-white/20 text-sm italic">
        Upload SRT to see preview
      </div>
    );
  }

  const referenceHeight =
    subtitleStyle.orientation === 'portrait'
      ? FCP_RESOLUTION.portrait.height
      : FCP_RESOLUTION.landscape.height;

  const scale = containerHeight / referenceHeight;
  const fontSize = getFontPixelSize(subtitleStyle.fontSize, referenceHeight).height;

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center whitespace-pre-wrap"
      style={{
        // 背景色和圆角暂不启用，因为 FCPXML 当前不输出自动字幕背景；
        // backgroundColor: `${subtitleStyle.backgroundColor}${Math.round(subtitleStyle.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
        // borderRadius: `${subtitleStyle.borderRadius * scale}px`,
        color: subtitleStyle.textColor,
        // 保留 SubtitleStyle 字段是为了未来恢复预览能力时有一致的数据入口。
        padding: `${subtitleStyle.paddingY * scale}px ${subtitleStyle.paddingX * scale}px`,
        fontSize: `${fontSize * scale}px`,
        lineHeight: 1,
      }}
    >
      {text}
    </motion.div>
  );
}
