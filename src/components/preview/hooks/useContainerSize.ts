import { useEffect, useRef, useState } from 'react';
import { UI_LOGICAL_RESOLUTION } from '../../../constants';

/* 观察预览容器尺寸，让字幕缩放和平台浮层能按真实渲染尺寸计算。 */
export function useContainerSize() {
  const [width, setWidth] = useState(UI_LOGICAL_RESOLUTION.portrait.width);
  const [height, setHeight] = useState(UI_LOGICAL_RESOLUTION.portrait.height);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]?.contentRect) return;

      setWidth(entries[0].contentRect.width);
      setHeight(entries[0].contentRect.height);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, width, height };
}
