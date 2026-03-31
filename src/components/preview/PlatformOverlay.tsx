import { AnimatePresence } from 'motion/react';
import { XhsOverlay, XhsBottomBar } from './overlays/XhsOverlay';
import { DouyinOverlay, DouyinBottomBar } from './overlays/DouyinOverlay';
import { CleanOverlay } from './overlays/CleanOverlay';
import { UI_LOGICAL_RESOLUTION } from '../../constants';

interface PlatformOverlayProps {
  platform: 'none' | 'xhs' | 'douyin';
  orientation: 'landscape' | 'portrait';
  containerWidth: number;
}

export function PlatformOverlay({ platform, orientation, containerWidth }: PlatformOverlayProps) {
  const isPortrait = orientation === 'portrait';
  // 引用 UI_LOGICAL_RESOLUTION 的基准宽度
  const refWidth = isPortrait ? UI_LOGICAL_RESOLUTION.portrait.width : UI_LOGICAL_RESOLUTION.landscape.width;
  // 强制限定 PlatformOverlay 为完美的 9:16 (或 16:9) 比例，这与 PreviewPanel 中视频外壳的长宽比保持绝对一致，防止内部组件因按设备全高(844)适配而发生越界脱离。
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
        {platform === 'xhs' && <XhsOverlay key="xhs" />}
        {platform === 'douyin' && <DouyinOverlay key="douyin" />}
        {platform === 'none' && <CleanOverlay key="clean" />}
      </AnimatePresence>
    </div>
  );
}

export function PlatformBottomOverlay({ platform, orientation, containerWidth }: PlatformOverlayProps) {
  const isPortrait = orientation === 'portrait';
  const refWidth = isPortrait ? UI_LOGICAL_RESOLUTION.portrait.width : UI_LOGICAL_RESOLUTION.landscape.width;
  const scale = containerWidth / refWidth;

  // 底部扩展栏需要处于 9:16 视频区域之外，因此这里按逻辑分辨率为不同平台预留高度。
  const bottomBarHeight = platform === 'xhs' ? 57.5 : platform === 'douyin' ? 56 : 0;

  if (bottomBarHeight === 0) return null;

  return (
    <div
      className="relative w-full pointer-events-none"
      style={{ paddingBottom: `${(bottomBarHeight / refWidth) * 100}%` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left flex flex-col w-full h-full"
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
