import { AnimatePresence } from 'motion/react';
import { XhsOverlay, XhsBottomBar, xhsBottomHeightSpacing } from './XhsOverlay';
import { DouyinOverlay, DouyinBottomBar, douyinBottomHeightSpacing } from './DouyinOverlay';
import { CleanOverlay } from './CleanOverlay';
import { UI_LOGICAL_RESOLUTION } from '../../../constants';

interface PlatformOverlayProps {
  platform: 'none' | 'xhs' | 'douyin';
  orientation: 'landscape' | 'portrait';
  containerWidth: number;
  currentTime?: number;
  totalDuration?: number;
}

export function PlatformOverlay({
  platform,
  orientation,
  containerWidth,
  currentTime = 0,
  totalDuration = 0,
}: PlatformOverlayProps) {
  const isPortrait = orientation === 'portrait';
  const refWidth = isPortrait ? UI_LOGICAL_RESOLUTION.portrait.width : UI_LOGICAL_RESOLUTION.landscape.width;
  // 保持平台 UI 与预览画面的逻辑分辨率一致，避免缩放后越界。
  const refHeight = isPortrait ? refWidth * (16 / 9) : refWidth * (9 / 16);
  const scale = containerWidth / refWidth;

  return (
    <div
      className="absolute top-0 left-0 origin-top-left pointer-events-none"
      style={{
        width: `${refWidth}px`,
        height: `${refHeight}px`,
        transform: `scale(${scale})`
      }}
    >
      <AnimatePresence mode="wait">
        {platform === 'xhs' && <XhsOverlay key="xhs" currentTime={currentTime} totalDuration={totalDuration} />}
        {platform === 'douyin' && <DouyinOverlay key="douyin" currentTime={currentTime} totalDuration={totalDuration} />}
        {platform === 'none' && <CleanOverlay key="clean" />}
      </AnimatePresence>
    </div>
  );
}

export function PlatformBottomOverlay({
  platform,
  orientation,
  containerWidth,
}: Pick<PlatformOverlayProps, 'platform' | 'orientation' | 'containerWidth'>) {
  if (platform === 'none') return null;

  const isPortrait = orientation === 'portrait';
  const refWidth = isPortrait ? UI_LOGICAL_RESOLUTION.portrait.width : UI_LOGICAL_RESOLUTION.landscape.width;
  const scale = containerWidth / refWidth;

  // 底部扩展栏需要处于 9:16 视频区域之外，因此这里按逻辑分辨率为不同平台预留高度。
  const bottomBarHeight =
    platform === 'xhs' ? xhsBottomHeightSpacing * 4 : platform === 'douyin' ? douyinBottomHeightSpacing * 4 : 0;

  return (
    // 外层 div 预留放大后的尺寸
    <div
      className="relative w-full pointer-events-none h-10"
      style={{ paddingBottom: `${(bottomBarHeight / refWidth) * 100}%` }}
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          width: `${refWidth}px`,
          transform: `scale(${scale})`,
        }}
      >
        <AnimatePresence mode="wait">
          {platform === 'xhs' && <XhsBottomBar key="xhs-bottom" />}
          {platform === 'douyin' && <DouyinBottomBar key="douyin-bottom" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
