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
                    <spine>
                        <gap name="Gap" offset="0s" duration="${totalFrames * 100}/${fpsScale}s" start="0s">`;

  entries.forEach((entry, index) => {
    // 强制将时间从浮点秒数换算为实际的帧数，再转换回 FCPX 的标准分数表现（如 30fps 下的 100/3000s 制）
    // 严格确保所有偏移 (offset) 与持续时间 (duration) 落在整数帧边缘，避免 "此项目不在编辑帧边界上" DTD 报错

    // --- 为什么 Generator 的 start 时间不能是动态的？ ---
    // <title> 标签里的 start 属性，代表的是【这个字幕预设（Generator）体内的渲染初始时间】，而不是它在主轴上出现的时间（那是 offset 的事）！
    // 如果把由外部视频时间决定的 offset 同时喂给 start（比如第两分钟出现时传了 start="120s"），
    // FCP 就会傻傻地从这个字幕预设的“第两分钟寿命点”处开始播放。
    // 但普通内置文字没写连续循环，活不到两分钟，结果就是渲染出一片空白（导致在检查器有字幕块，画面里没字）。
    // 所以，一定要把它在模版体内的开局时间锁死成确定的起始点，常见的就是苹果模板引擎标准的 "3600s"（01:00:00:00）或者是 "0s"。

    const startFrames = Math.round(entry.startSeconds * frameRate);
    const endFrames = Math.round(entry.endSeconds * frameRate);

    const startOffset = startFrames * 100;
    const durOffset = (endFrames - startFrames) * 100;
    const escapedText = escapeXml(entry.text);

    // --- FCPXML 的坐标系到底是什么？ ---
    // 在苹果的 FCPXML 1.9+ 协议里，<adjust-transform> 的 position 并不是绝对像素，也不是 0.0 到 1.0 的浮点比例！
    // 它的底层机制是：【数值 1 代表 1% 的画幅尺寸】，即传 100 代表 100%。
    // FCPX 检查器中的原点 (0,0) 在屏幕正中央，Y 轴向下为负值。
    // 如果想要竖屏文字距离顶部 70%，相当于让它向下偏离正中心 20%，对应的数值就是 -20 (等价于原本的 -384px)。
    // 千万不要传 -384，否则 FCP 会误以为是 -384%，导致文字直接飞出屏幕 3.8 个屏幕高度！
    const posY = style.orientation === 'portrait'
      ? -20
      : -35; // 横屏底部 15% (即距离顶部 85%)，偏离中心 35% -> -35

    xml += `
                            <title lane="1" ref="r2" offset="${startOffset}/${fpsScale}s" name="${escapedText.substring(0, 20)}" duration="${durOffset}/${fpsScale}s" start="3600s">
                            <text>
                                <text-style ref="ts${index}">${escapedText}</text-style>
                            </text>
                            <text-style-def id="ts${index}">
                                <text-style font="PingFang SC" fontSize="${style.fontSize}" fontFace="Regular" fontColor="${textColor} 1" alignment="center"/>
                            </text-style-def>
                            <adjust-transform position="0 ${posY}"/>
                        </title>`;
  });

  xml += `
                        </gap>
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>`;

  return xml;
}