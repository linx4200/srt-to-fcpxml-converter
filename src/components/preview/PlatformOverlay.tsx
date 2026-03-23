import { AnimatePresence } from 'motion/react';
import { XhsOverlay, XhsBottomBar } from './overlays/XhsOverlay';
import { DouyinOverlay } from './overlays/DouyinOverlay';
import { CleanOverlay } from './overlays/CleanOverlay';

interface PlatformOverlayProps {
  platform: 'none' | 'xhs' | 'douyin';
}

export function PlatformOverlay({ platform }: PlatformOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {platform === 'xhs' && <XhsOverlay key="xhs" />}
      {platform === 'douyin' && <DouyinOverlay key="douyin" />}
      {platform === 'none' && <CleanOverlay key="clean" />}
    </AnimatePresence>
  );
}

export function PlatformBottomOverlay({ platform }: PlatformOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {platform === 'xhs' && <XhsBottomBar key="xhs-bottom" />}
    </AnimatePresence>
  );
}
