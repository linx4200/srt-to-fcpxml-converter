import { RefObject, useEffect, useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { clientXToTimelineTime } from '../timelineGeometry';

type TrimEdge = 'start' | 'end';

type TrimState = {
  clipId: number;
  edge: TrimEdge;
} | null;

interface UseFreeTrimDragParams {
  viewportRef: RefObject<HTMLDivElement | null>;
  pixelsPerSecond: number;
}

/* 封装 Free Trim 的浏览器拖拽生命周期，并把拖拽位置转换为 Working Timeline 时间。 */
export function useFreeTrimDrag({
  viewportRef,
  pixelsPerSecond,
}: UseFreeTrimDragParams) {
  const trimTimelineClipBoundary = useAppStore((state) => state.trimTimelineClipBoundary);

  /* 当前正在拖拽的 Subtitle Clip 边界；null 表示没有 Free Trim 交互。 */
  const [trimState, setTrimState] = useState<TrimState>(null);
  /* Free Trim 期间暂停 Playhead Follow，避免视口跟随播放头干扰拖拽。 */
  const [isFreeTrimInteracting, setIsFreeTrimInteracting] = useState(false);

  useEffect(() => {
    if (!trimState) return;

    /* 拖拽修剪边界时把鼠标位置换算为时间，并交给 Working Timeline domain module 维护相邻 Subtitle Clip 约束。 */
    const handleMouseMove = (event: MouseEvent) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const time = clientXToTimelineTime({
        clientX: event.clientX,
        viewport,
        pixelsPerSecond,
      });
      trimTimelineClipBoundary(trimState.clipId, trimState.edge, time);
      setIsFreeTrimInteracting(true);
    };

    /* 结束 Free Trim 交互，恢复 Playhead Follow 的资格。 */
    const handleMouseUp = () => {
      setTrimState(null);
      setIsFreeTrimInteracting(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pixelsPerSecond, trimState, trimTimelineClipBoundary, viewportRef]);

  const beginFreeTrim = (clipId: number, edge: TrimEdge) => {
    setTrimState({ clipId, edge });
  };

  return {
    beginFreeTrim,
    isFreeTrimInteracting,
  };
}
