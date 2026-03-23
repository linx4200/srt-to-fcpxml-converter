import { SrtEntry, SubtitleStyle } from '../types';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

export function generateFcpxml(entries: SrtEntry[], style: SubtitleStyle): string {
  const frameRate = style.fps;
  const duration = entries.length > 0 ? entries[entries.length - 1].endSeconds : 0;
  const totalFrames = Math.round(duration * frameRate);
  
  const fpsScale = frameRate * 100; // 3000 for 30fps, 6000 for 60fps

  const width = style.orientation === 'landscape' ? 1920 : 1080;
  const height = style.orientation === 'landscape' ? 1080 : 1920;

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)}`;
  };

  const textColor = hexToRgb(style.textColor);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
    <resources>
        <format id="r1" frameDuration="100/${fpsScale}s" width="${width}" height="${height}" colorSpace="1-1-1 (Rec. 709)"/>
        <!-- 使用 Custom.moti 是因为它是跨语言、跨版本兼容性最好的基础模板，路径极度稳定且没有预设的冲突动画 -->
        <effect id="r2" name="Custom" uid=".../Titles.localized/Build In:Out.localized/Custom.localized/Custom.moti"/>
    </resources>
    <library>
        <event name="SRT Import">
            <project name="Subtitles">
                <sequence duration="${totalFrames * 100}/${fpsScale}s" format="r1" tcStart="0s" tcFormat="NDF">
                    <spine>`;

  entries.forEach((entry, index) => {
    // 强制将时间从浮点秒数换算为实际的帧数，再转换回 FCPX 的标准分数表现（如 30fps 下的 100/3000s 制）
    // 严格确保所有偏移 (offset) 与持续时间 (duration) 落在整数帧边缘，避免 "此项目不在编辑帧边界上" DTD 报错
    const startFrames = Math.round(entry.startSeconds * frameRate);
    const endFrames = Math.round(entry.endSeconds * frameRate);
    
    const startOffset = startFrames * 100;
    const durOffset = (endFrames - startFrames) * 100;
    const escapedText = escapeXml(entry.text);
    
    // Y 坐标换算：FCPX 原点在屏幕中央 (0,0)
    // 根据需求，竖屏时设置在距离顶部 70% 的位置，横屏时设置在底部 15% (距离顶部 85%)
    const posY = style.orientation === 'portrait' 
      ? (height / 2) - (height * 0.7) 
      : (height / 2) - (height * 0.85);

    xml += `
                        <title ref="r2" offset="${startOffset}/${fpsScale}s" name="${escapedText.substring(0, 20)}" duration="${durOffset}/${fpsScale}s" start="0s">
                            <adjust-transform position="0 ${posY}"/>
                            <text>
                                <text-style ref="ts${index}">${escapedText}</text-style>
                            </text>
                            <text-style-def id="ts${index}">
                                <text-style font="PingFang SC" fontSize="${style.fontSize}" fontFace="Regular" fontColor="${textColor} 1" alignment="center"/>
                            </text-style-def>
                        </title>`;
  });

  xml += `
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

  return xml;
}