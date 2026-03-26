import { AnimatePresence } from 'motion/react';
import { XhsOverlay, XhsBottomBar } from './overlays/XhsOverlay';
import { DouyinOverlay } from './overlays/DouyinOverlay';
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

  // XhsBottomBar 的近似逻辑高度 (mt-2: 8px, mb-2: 8px, h-1.5: 1.5px, h-10: 40px) = 57.5px
  // 使用 padding-bottom hack 可以让容器的高度按照父级宽度的特定比例 (57.5 / 390) 自动展开，
  // 从而让 transform scale 中的元素完美贴合正常的 flex 布局流，不产生空白高度坍塌！
  const bottomBarHeight = platform === 'xhs' ? 57.5 : 0;

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
        </AnimatePresence>
      </div>
    </div>
  );
}
