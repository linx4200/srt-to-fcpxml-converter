import { motion } from 'motion/react';
import { FCP_RESOLUTION, UI_LOGICAL_RESOLUTION } from '../../../constants';
import type { SubtitleRenderSpec } from '../../../domain/subtitleStyle';
import { getFontPixelSize } from '../../../utils';

interface PreviewSubtitleProps {
  text: string;
  subtitleRenderSpec: SubtitleRenderSpec;
  containerHeight?: number;
}

/* 按 FCP 参考分辨率缩放当前字幕，尽量让浏览器预览贴近导出结果。 */
export function PreviewSubtitle({
  text,
  subtitleRenderSpec,
  containerHeight = UI_LOGICAL_RESOLUTION.portrait.height,
}: PreviewSubtitleProps) {
  if (!text) {
    return (
      <div className="text-white/20 text-sm italic">
        Upload SRT to see preview
      </div>
    );
  }

  const referenceHeight =
    subtitleRenderSpec.orientation === 'portrait'
      ? FCP_RESOLUTION.portrait.height
      : FCP_RESOLUTION.landscape.height;

  const scale = containerHeight / referenceHeight;
  const fontSize = getFontPixelSize(subtitleRenderSpec.fontSize, referenceHeight).height;

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center whitespace-pre-wrap"
      style={{
        // 背景色和圆角暂不启用，因为 FCPXML 当前不输出自动字幕背景；
        // backgroundColor: `${subtitleRenderSpec.backgroundColor}${Math.round(subtitleRenderSpec.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
        // borderRadius: `${subtitleRenderSpec.borderRadius * scale}px`,
        color: subtitleRenderSpec.textColor,
        // 保留字幕背景 spec 字段是为了未来恢复预览能力时有一致的数据入口。
        padding: `${subtitleRenderSpec.paddingY * scale}px ${subtitleRenderSpec.paddingX * scale}px`,
        fontSize: `${fontSize * scale}px`,
        lineHeight: 1,
      }}
    >
      {text}
    </motion.div>
  );
}
